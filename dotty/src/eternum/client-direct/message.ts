import { Router, Request, Response } from 'express';
import {
  AgentRuntime,
  Memory,
  Content,
  ModelClass,
  UUID,
  Media,
  stringToUuid,
  composeContext,
  generateMessageResponse,
  elizaLogger,
  messageCompletionFooter,
} from '@elizaos/core';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * テンプレ: Action選択用 (軽量モデル)
 */
const actionSelectionTemplate = `
# You are a system that chooses the best action for the user query.
User said: "{{inputText}}"

Available actions:
- QUERY_ETERNUM_RESOURCES

Pick only one action name from these options. If user doesn't require an action, choose "NONE".

Final output must be JSON:
{"action": "..."}
`;

/**
 * テンプレ: DB結果を踏まえた最終応答
 * {{resourceJson}} がDBのJSONデータとして挿入される
 */
const resourceResponseTemplate =
  `
# Resource data:
{{resourceJson}}

Write a helpful explanation about this resource for the user.
` + messageCompletionFooter;

/**
 * "eternum" 用のmessageHandler
 */
export function createMessageHandler(agents: Map<string, AgentRuntime>): Router {
  const router = Router();

  // ファイルアップロード設定
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'data', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

  router.post('/:agentId/message', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const agentId = req.params.agentId;
      const runtime = getRuntime(agents, agentId);
      if (!runtime) {
        res.status(404).send('Agent not found');
        return;
      }

      // 1) userId / roomId
      const userId = stringToUuid(req.body.userId ?? 'user') as UUID;
      const roomId = stringToUuid(req.body.roomId ?? `default-room-${agentId}`) as UUID;

      // 2) 接続セットアップ
      await runtime.ensureConnection(userId, roomId, req.body.userName, req.body.name, 'eternum');

      // 3) ユーザメッセージをMemory化
      const { memory, userMessage } = await createUserMessage(req, runtime, userId, roomId);

      // 4) (軽量モデル) Action選定
      const actionSelectionContext = buildActionSelectionContext(memory.content.text);
      const actionJson = await generateMessageResponse({
        runtime,
        context: actionSelectionContext,
        modelClass: ModelClass.SMALL, // 軽量モデル
      });

      let chosenAction = 'NONE';
      try {
        const parsed = JSON.parse(actionJson.text || '{}');
        chosenAction = parsed.action || 'NONE';
      } catch {
        chosenAction = 'NONE';
      }
      elizaLogger.info(`Chosen action: ${chosenAction}`);

      // memoryに action をセット (Evaluator で上書きされるかもしれない)
      memory.content.action = chosenAction;

      // 5) Evaluate / Action 実行
      //   - Evaluate → resourceQueryEvaluator など発火
      //   - Action → DB検索
      let state = await runtime.composeState(userMessage, {
        agentName: runtime.character.name,
      });
      state = await runtime.updateRecentMessageState(state);

      // Evaluator
      await runtime.evaluate(memory, state);

      // Action
      let newMessages = null;
      await runtime.processActions(memory, [], state, async (msgs) => {
        newMessages = msgs;
        return [memory];
      });

      // ==> ここで DB結果が memory.content.dbData に入った想定
      const dbData = memory.content.text || null;

      // 6) composeContext で resourceResponseTemplate に dbDataを差し込み
      //    => 大きいモデルで実際の応答文を生成
      const finalResponse = await buildResourceResponse(runtime, state, dbData);

      // 7) Memory保存 & レスポンス返却
      const finalResponseMessage: Memory = {
        id: stringToUuid(memory.id + '-final'),
        userId: runtime.agentId,
        agentId: runtime.agentId,
        content: finalResponse,
        roomId,
        createdAt: Date.now(),
      };
      await runtime.messageManager.createMemory(finalResponseMessage);

      res.json({ action: chosenAction, finalResponse });
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({
        error: 'Error processing message',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

// runtime取得
function getRuntime(agents: Map<string, AgentRuntime>, agentId: string): AgentRuntime | undefined {
  let runtime = agents.get(agentId);
  if (!runtime) {
    runtime = Array.from(agents.values()).find((a) => a.character.name.toLowerCase() === agentId.toLowerCase());
  }
  return runtime;
}

// ユーザメッセージを Memory化
async function createUserMessage(
  req: Request & { file?: Express.Multer.File },
  runtime: AgentRuntime,
  userId: UUID,
  roomId: UUID,
) {
  const text = req.body.text || '';
  const messageId = stringToUuid(Date.now().toString()) as UUID;

  const attachments: Media[] = [];
  if (req.file) {
    const filePath = path.join(process.cwd(), 'data', 'uploads', req.file.filename);
    attachments.push({
      id: Date.now().toString(),
      url: filePath,
      title: req.file.originalname,
      source: 'eternum',
      description: `Uploaded file: ${req.file.originalname}`,
      text: '',
      contentType: req.file.mimetype,
    });
  }

  const content: Content = {
    text,
    attachments,
    source: 'eternum',
  };

  const userMessage = {
    content,
    userId,
    roomId,
    agentId: runtime.agentId,
  };

  const memory: Memory = {
    id: stringToUuid(messageId + '-' + userId),
    ...userMessage,
    agentId: runtime.agentId,
    userId,
    roomId,
    content,
    createdAt: Date.now(),
  };

  // Embedding & 保存
  await runtime.messageManager.addEmbeddingToMemory(memory);
  await runtime.messageManager.createMemory(memory);

  return { memory, userMessage };
}

// 軽量モデルで Actionを選ぶためのテンプレ生成
function buildActionSelectionContext(userText: string): string {
  return actionSelectionTemplate.replace('{{inputText}}', userText);
}

/**
 * composeContext を使って DBデータをテンプレに差し込み
 */
async function buildResourceResponse(runtime: AgentRuntime, state: any, dbData: any) {
  // 1) state に JSON化したデータを入れる
  const extendedState = {
    ...state,
    // resourceJson: dbData ? JSON.stringify(dbData, null, 2) : 'No resource found',
    resourceJson: dbData,
  };
  console.log('resourceJson', extendedState.resourceJson);
  // 2) テンプレ + ステート
  const finalContext = composeContext({
    state: extendedState,
    template: resourceResponseTemplate,
  });

  // 3) 大きいモデルで応答
  const finalResponse = await generateMessageResponse({
    runtime,
    context: finalContext,
    modelClass: ModelClass.LARGE,
  });

  return finalResponse;
}

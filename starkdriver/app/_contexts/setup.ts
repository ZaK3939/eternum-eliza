import type { DojoConfig } from '@dojoengine/core';
import {
  BUILDING_CATEGORY_POPULATION_CONFIG_ID,
  HYPERSTRUCTURE_CONFIG_ID,
  WORLD_CONFIG_ID,
} from '@bibliothecadao/eternum';
import { Component, Metadata, Schema } from '@dojoengine/recs';
import { getEntities, getEvents, setEntities } from '@dojoengine/state';
import { Clause, EntityKeysClause, ToriiClient } from '@dojoengine/torii-client';
import { debounce } from 'lodash';
// import * as torii from '@dojoengine/torii-client';
import { createClientComponents } from '../dojo/createClientComponents';
import { createSystemCalls } from '../dojo/createSystemCalls';
import { ClientConfigManager } from '../dojo/modelManager/ConfigManager';
import { setupNetwork } from '../dojo/setupNetwork';

// -----------------------------------------------------------------------
// この型が「setup()」の戻り値。呼び出し元で Awaited<ReturnType<typeof setup>>
// として取得できるようにしています。
export type SetupResult = Awaited<ReturnType<typeof setup>>;

// シングルトンの ConfigManager を使う場合は既存の実装どおり
export const configManager = ClientConfigManager.instance();

// -----------------------------------------------------------------------
// 以下、syncEntitiesDebounced はユーザープロジェクトで使う独自の同期処理の例。
// これも省略なしでそのまま記載します。
export const syncEntitiesDebounced = async <S extends Schema>(
  client: ToriiClient,
  components: Component<S, Metadata, undefined>[],
  entityKeyClause: EntityKeysClause[],
  logging: boolean = true,
  historical: boolean = false,
) => {
  if (logging) console.log('Starting syncEntities');

  let entityBatch: Record<string, any> = {};

  const debouncedSetEntities = debounce(() => {
    if (Object.keys(entityBatch).length > 0) {
      // console.log("Applying batch update", entityBatch);
      setEntities(entityBatch, components, logging);
      entityBatch = {}; // Clear the batch after applying
    }
  }, 200); // Increased debounce time to 200ms (もしくは1秒など) for batching

  // -----------------------------
  // Handle entity updates
  const entitySub = await client.onEntityUpdated(entityKeyClause, (fetchedEntities: any, data: any) => {
    if (logging) console.log('Entity updated', fetchedEntities);

    entityBatch[fetchedEntities] = {
      ...entityBatch[fetchedEntities],
      ...data,
    };
    debouncedSetEntities();
  });

  // -----------------------------
  // Handle event message updates
  const eventSub = await client.onEventMessageUpdated(
    entityKeyClause,
    historical,
    (fetchedEntities: any, data: any) => {
      if (logging) console.log('Event message updated', fetchedEntities);

      entityBatch[fetchedEntities] = {
        ...entityBatch[fetchedEntities],
        ...data,
      };
      debouncedSetEntities();
    },
  );

  // -----------------------------
  // Return a combined subscription that can cancel both
  return {
    cancel: () => {
      entitySub.cancel();
      eventSub.cancel();
    },
  };
};

// -----------------------------------------------------------------------
export async function setup(config: DojoConfig) {
  const network = await setupNetwork(config);
  // const network = null as any;
  const dojoComponents = createClientComponents(network);
  const systemCalls = createSystemCalls(network);
  const configClauses: Clause[] = [
    {
      Keys: {
        keys: [WORLD_CONFIG_ID.toString()],
        pattern_matching: 'FixedLen',
        models: [],
      },
    },
    {
      Keys: {
        keys: [WORLD_CONFIG_ID.toString(), undefined],
        pattern_matching: 'FixedLen',
        models: [],
      },
    },
    {
      Keys: {
        keys: [WORLD_CONFIG_ID.toString(), undefined, undefined],
        pattern_matching: 'FixedLen',
        models: [],
      },
    },
    {
      Keys: {
        keys: [BUILDING_CATEGORY_POPULATION_CONFIG_ID.toString(), undefined],
        pattern_matching: 'FixedLen',
        models: [],
      },
    },
    {
      Keys: {
        keys: [HYPERSTRUCTURE_CONFIG_ID.toString()],
        pattern_matching: 'VariableLen',
        models: [],
      },
    },
  ];

  // ブラウザでのみ torii.createClient() を実行
  // 動的インポートでビルド時の衝突を回避
  const toriiLib = await import('@dojoengine/torii-client');
  const toriiClient = await toriiLib.createClient({
    rpcUrl: config.rpcUrl,
    toriiUrl: config.toriiUrl,
    relayUrl: config.relayUrl,
    worldAddress: config.manifest.world.address || '',
  });

  // const toriiClient = (await torii.createClient({
  //   rpcUrl: config.rpcUrl,
  //   toriiUrl: config.toriiUrl,
  //   relayUrl: config.relayUrl,
  //   worldAddress: config.manifest.world.address || '',
  // })) as ToriiClient;
  // const toriiClient = null as any;
  // -----------------------------
  // 複数の getEntities() を並列実行
  await Promise.all([
    getEntities(
      toriiClient,
      { Composite: { operator: 'Or', clauses: configClauses } },
      network.contractComponents as any,
    ),
    getEntities(
      toriiClient,
      {
        Keys: {
          keys: [undefined, undefined],
          pattern_matching: 'FixedLen',
          models: ['s0_eternum-CapacityConfigCategory', 's0_eternum-ResourceCost'],
        },
      },
      network.contractComponents as any,
      [],
      [],
      40_000,
      false,
    ),
  ]);

  // -----------------------------
  // さらに追加の getEntities()
  await getEntities(
    toriiClient,
    {
      Keys: {
        keys: [undefined],
        pattern_matching: 'FixedLen',
        models: [
          's0_eternum-AddressName',
          's0_eternum-Realm',
          's0_eternum-PopulationConfig',
          's0_eternum-CapacityConfig',
          's0_eternum-ProductionConfig',
          's0_eternum-RealmLevelConfig',
          's0_eternum-BankConfig',
          's0_eternum-Bank',
          's0_eternum-Trade',
          's0_eternum-Structure',
          's0_eternum-Battle',
          's0_eternum-Guild',
        ],
      },
    },
    network.contractComponents as any,
    [],
    [],
    40_000,
    false,
  );

  // -----------------------------
  // syncEntitiesDebounced でエンティティ更新を購読
  const sync = await syncEntitiesDebounced(toriiClient, network.contractComponents as any, [], false);

  // -----------------------------
  // コンポーネントを ConfigManager にセット
  configManager.setDojo(dojoComponents);

  // -----------------------------
  // getEvents() でイベント購読
  const eventSync = await getEvents(
    toriiClient,
    network.contractComponents.events as any,
    [],
    [],
    20000,
    {
      Keys: {
        keys: [undefined],
        pattern_matching: 'VariableLen',
        models: [
          's0_eternum-GameEnded',
          's0_eternum-HyperstructureFinished',
          's0_eternum-BattleClaimData',
          's0_eternum-BattleJoinData',
          's0_eternum-BattleLeaveData',
          's0_eternum-BattlePillageData',
          's0_eternum-BattleStartData',
          's0_eternum-AcceptOrder',
          's0_eternum-SwapEvent',
          's0_eternum-LiquidityEvent',
          's0_eternum-HyperstructureContribution',
        ],
      },
    },
    false,
    false,
  );

  // -----------------------------
  // 最終的に返すオブジェクト
  return {
    network,
    dojoComponents,
    systemCalls,
    sync,
    eventSync,
  };
}

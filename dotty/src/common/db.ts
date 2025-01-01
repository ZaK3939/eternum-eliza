import { Pool } from 'pg';
import { Service, ServiceType, IAgentRuntime } from '@ai16z/eliza';

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class DatabaseService implements Service {
  private static _instance: DatabaseService;

  get serviceType(): ServiceType {
    return ServiceType.AWS_S3;
  }

  static get serviceType(): ServiceType {
    return ServiceType.AWS_S3;
  }

  static initialize(runtime: IAgentRuntime): Promise<void> {
    return this.getInstance().initialize(runtime);
  }

  static getInstance<T extends Service>(): T {
    if (!DatabaseService._instance) {
      DatabaseService._instance = new DatabaseService();
    }
    return DatabaseService._instance as unknown as T;
  }

  async initialize(runtime: IAgentRuntime): Promise<void> {
    await dbPool.connect();
  }

  async dispose(): Promise<void> {
    await dbPool.end();
  }
}
export { DatabaseService, dbPool };

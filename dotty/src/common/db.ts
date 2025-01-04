import { PostgresDatabaseAdapter } from '@eliza/adapter-postgres';
import { IDatabaseAdapter, IDatabaseCacheAdapter, elizaLogger } from '@eliza/core';

export class DatabaseConnectionWrapper {
  private db: IDatabaseAdapter & IDatabaseCacheAdapter;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private retryDelay: number = 5000; // 5 seconds
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private _isHealthy: boolean = false;

  constructor(dataDir: string) {
    this.db = this.initializeDatabase();
    this.startKeepAlive();
  }

  get isHealthy(): boolean {
    return this._isHealthy;
  }

  private initializeDatabase(): IDatabaseAdapter & IDatabaseCacheAdapter {
    if (process.env.POSTGRES_URL) {
      return new PostgresDatabaseAdapter({
        connectionString: process.env.POSTGRES_URL,
        pool: {
          max: 20,
          min: 5,
          idleTimeoutMillis: 300000,
          connectionTimeoutMillis: 10000,
          allowExitOnIdle: false,
          keepAlive: true,
          keepAliveInitialDelayMillis: 10000,
        },
        statement_timeout: 5000,
        query_timeout: 5000,
        ssl: {
          rejectUnauthorized: false,
        },
      });
    } else {
      throw new Error('No database URL provided');
    }
  }

  private startKeepAlive() {
    if (!process.env.POSTGRES_URL) return; // SQLiteでは不要

    console.log('Starting keep-alive query...');
    this.keepAliveInterval = setInterval(async () => {
      try {
        await (this.db as any).query('SELECT 1');
        elizaLogger.log('Keep-alive query successful');
        this._isHealthy = true;
      } catch (error) {
        elizaLogger.error('Keep-alive query failed:', error);
        this._isHealthy = false;
        await this.reconnect();
      }
    }, 60000);
  }

  private async reconnect() {
    elizaLogger.log('Attempting to reconnect to database...');
    this.db = this.initializeDatabase();
    await this.init();
  }

  async init() {
    while (this.retryCount < this.maxRetries) {
      try {
        console.log('Attempting to initialize database connection...');
        await (this.db as IDatabaseAdapter).init();
        elizaLogger.log('Database connection established successfully');
        this.retryCount = 0;
        this._isHealthy = true;
        return;
      } catch (error) {
        this.retryCount++;
        elizaLogger.error(`Database initialization error (attempt ${this.retryCount}/${this.maxRetries}):`, error);
        this._isHealthy = false;

        if (this.retryCount < this.maxRetries) {
          elizaLogger.log(`Retrying database connection in ${this.retryDelay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        } else {
          throw new Error(`Failed to initialize database after ${this.maxRetries} attempts`);
        }
      }
    }
  }

  async cleanup() {
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);

    try {
      await (this.db as any).close();
    } catch (error) {
      elizaLogger.error('Error cleaning up database connection:', error);
    }
  }

  getAdapter(): IDatabaseAdapter & IDatabaseCacheAdapter {
    return this.db;
  }
}

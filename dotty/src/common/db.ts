import { PostgresDatabaseAdapter } from '@elizaos/adapter-postgres';
import { elizaLogger, IDatabaseAdapter, IDatabaseCacheAdapter } from '@elizaos/core';
import { Pool } from 'pg';

type DatabaseType = IDatabaseAdapter & IDatabaseCacheAdapter;

export class ExtendedPostgresAdapter extends PostgresDatabaseAdapter implements DatabaseType {
  declare public readonly db: Pool;

  constructor(config: any) {
    super(config);
    this.db = (this as any).pool;
  }
}

export class DatabaseConnectionWrapper {
  private db: DatabaseType;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private _isHealthy: boolean = false;

  constructor() {
    if (!process.env.POSTGRES_URL) {
      throw new Error('No database URL provided');
    }

    this.db = new ExtendedPostgresAdapter({
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

    this.startKeepAlive();
  }

  get isHealthy(): boolean {
    return this._isHealthy;
  }

  private startKeepAlive() {
    console.log('Starting keep-alive query...');
    this.keepAliveInterval = setInterval(async () => {
      try {
        await (this.db as ExtendedPostgresAdapter).query('SELECT 1');
        elizaLogger.log('Keep-alive query successful');
        this._isHealthy = true;
      } catch (error) {
        elizaLogger.error('Keep-alive query failed:', error);
        this._isHealthy = false;
        await this.reconnect();
      }
    }, 60000);
  }

  /**
   * The `reconnect` function attempts to reconnect to the database by logging a message and calling
   * the `init` function asynchronously.
   */
  public async reconnect() {
    elizaLogger.log('Attempting to reconnect to database...');
    await this.init();
  }

  async init() {
    try {
      console.log('Attempting to initialize database connection...');
      await this.db.init();
      elizaLogger.log('Database connection established successfully');
      this._isHealthy = true;
    } catch (error) {
      elizaLogger.error('Database initialization error:', error);
      this._isHealthy = false;
      throw error;
    }
  }

  async cleanup() {
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);

    try {
      // PostgreSQL 接続を閉じる
      await this.db.close();
      elizaLogger.info('Database connection closed successfully');
    } catch (error) {
      elizaLogger.error('Error while closing database connection:', error);
    }
  }

  getAdapter(): DatabaseType {
    return this.db;
  }
}

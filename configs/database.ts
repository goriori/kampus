import { Sequelize } from 'sequelize';
import { config } from './index';

export class Database {
  private static instance: Database;
  private sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize(config.database.url, {
      dialect: 'postgres',
      logging: config.nodeEnv === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: false,
      },
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  public async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.log('📦 Database connection has been established successfully.');

      // Синхронизация моделей (только для development)
      if (config.nodeEnv === 'development') {
        await this.sequelize.sync({ alter: true });
        console.log('📦 Database models synchronized.');
      }
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.sequelize.close();
      console.log('📦 Database connection closed.');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
      throw error;
    }
  }
}

import { Server } from '../../entities/server';
import { Database } from '../../configs/database';

export async function createTestApp() {
  const server = new Server();
  const app = server.getApp();

  const db = Database.getInstance();
  const sequelize = db.getSequelize();
  await sequelize.sync({ force: true });

  return { app, sequelize };
}

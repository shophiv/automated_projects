import { PrismaClient } from '@prisma/client';

class Database {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient();
    }
    return Database.instance;
  }
}

export const db = Database.getInstance();
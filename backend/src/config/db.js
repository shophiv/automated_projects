const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/expense_tracker?schema=public'
    }
  }
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

module.exports = { prisma, connectDB, disconnectDB };
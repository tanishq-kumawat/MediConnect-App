import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🐘 PostgreSQL Connected via Prisma ORM');
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    console.log('💡 Note: Ensure DATABASE_URL is properly set in backend/.env (e.g. postgresql://postgres:postgres@localhost:5432/mediconnect)');
  }
};

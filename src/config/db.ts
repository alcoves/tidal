import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PGB_DATABASE_URL,
    },
  },
})

export const db = prisma

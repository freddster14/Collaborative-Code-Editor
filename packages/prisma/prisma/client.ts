import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

console.log(process.env.NODE_ENV, process.env.TEST_DATABASE_URL )
const connectionString = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_DATABASE_URL 
  : process.env.DATABASE_URL;
  console.log(connectionString)

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
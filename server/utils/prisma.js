const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '../.env')
});

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter
});

module.exports = prisma;
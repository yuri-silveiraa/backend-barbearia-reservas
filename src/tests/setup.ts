import dotenv from 'dotenv';

dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';

import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: true, // REQUIRED for Azure SQL
    trustServerCertificate: false,
  },
};

let pool;

export const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(config);
    console.log("✅ Connected to Azure SQL");
  }
  return pool;
};

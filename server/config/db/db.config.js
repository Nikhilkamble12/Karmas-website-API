//----- Initialize database configuration -----
import dotenv from 'dotenv';
dotenv.config();

// Development
const development = {
    HOST: process.env.DEV_DB_HOST,
    USER: process.env.DEV_DB_USER,
    PASSWORD: process.env.DEV_DB_PASSWORD,
    DB: process.env.DEV_DB_NAME,
    DIALECT: process.env.DEV_DB_DIALECT,
    pool: {
      max: 5,
      min: 0,
      acquire: 300000,
      idle: 100000,
    },
  };
  
  // Production
  const production = {
    HOST: process.env.PROD_DB_HOST,
    USER: process.env.PROD_DB_USER,
    PASSWORD: process.env.PROD_DB_PASSWORD,
    DB: process.env.PROD_DB_NAME,
    DIALECT: process.env.PROD_DB_DIALECT,
    pool: {
      max: 10, 
      min: 0,
      acquire: 600000, 
      idle: 100000, 
    },
  };
  
  export default {
    development,
    production,
  };
  
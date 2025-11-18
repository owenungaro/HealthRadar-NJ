import dotenv from 'dotenv';

dotenv.config();

const mongoConfig = {
  serverUrl: process.env.MONGO_URI || 'mongodb://localhost:27017',
  database: process.env.MONGO_DB_NAME || 'healthradar_nj'
};

export default mongoConfig;

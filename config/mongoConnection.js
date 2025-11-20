import { MongoClient } from 'mongodb';
import mongoConfig from './settings.js';

let _client = null;
let _db = null;

const connectDb = async () => {
  if (!_db) {
    _client = new MongoClient(mongoConfig.serverUrl);
    await _client.connect();
    _db = _client.db(mongoConfig.database);
    console.log('MongoDB connected');
  }
  return _db;
};

export const getDb = () => {
  if (!_db) {
    throw new Error('Database not initialized. Call connectDb() first.');
  }
  return _db;
};

export default connectDb;

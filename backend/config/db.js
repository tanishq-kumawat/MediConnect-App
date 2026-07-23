import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      console.log('No MONGO_URI provided in env. Initializing MongoMemoryServer...');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      console.log(`MongoMemoryServer started at: ${uri}`);
    } else {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log(`Connected to external MongoDB at ${mongoose.connection.host}`);
        return;
      } catch (err) {
        console.log('Failed to connect to MONGO_URI, falling back to MongoMemoryServer:', err.message);
        mongoMemoryServer = await MongoMemoryServer.create();
        uri = mongoMemoryServer.getUri();
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected (Memory Server): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

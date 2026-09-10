import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { setupApp } from './setup-app';
import { connectToDb } from './db/db';
import { config } from './core/config';

const start = async () => {
  const app = express();
  setupApp(app);

  try {
    await connectToDb();

    app.listen(config.port, () => {
      console.log(`App listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start application: ', error);
    process.exit(1);
  }
};

start();

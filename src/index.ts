import 'dotenv/config';
import express from 'express';
import { setupApp } from './setup-app';
import { connectToDb } from './db/db';

const PORT = process.env.PORT || 5001;

const start = async () => {
  const app = express();
  setupApp(app);

  try {
    await connectToDb();

    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application: ', error);
    process.exit(1);
  }
};

start();

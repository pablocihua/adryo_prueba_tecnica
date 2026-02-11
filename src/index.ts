// import { loadEnvFile } from 'node:process';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { AppDataSource } from "./data-source";
import { authRoute, leadRoute, activityRoute, metricRoute } from "./routes/index"

const server = express();
// loadEnvFile();// Cargar variables de entorno
dotenv.config();
const port = process.env.PORT || 3001;

// Middlewares
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use('/api/auth', authRoute);
server.use('/api', leadRoute);
server.use('/api', activityRoute);
server.use('/api', metricRoute);

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

AppDataSource.initialize()
  .then(() => {
    console.log(`Connected to the database!`);
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
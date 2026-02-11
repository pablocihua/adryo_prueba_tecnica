import { DataSource } from "typeorm";
import { Lead } from "./entities/lead";
import { Activity } from "./entities/activities";
import { History } from "./entities/history";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "pruebaTecnica",
  synchronize: true,
  logging: false,
  entities: [Lead, Activity, History],
  subscribers: [],
  migrations: [],
});
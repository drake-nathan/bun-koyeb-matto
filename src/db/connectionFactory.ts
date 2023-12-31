import { createConnection } from "mongoose";

import { envVars } from "../env.config";
import { conversionInstanceSchema } from "./conversionInstanceSchema";
import { tokenSchema } from "./tokenSchema";

export const connectionFactory = async () => {
  const dbConnectionString = envVars.DB_CONNECTION_STRING;

  const conn = await createConnection(dbConnectionString).asPromise();

  conn.addListener("error", (error) => {
    console.error("Mongo Error Listener:", error);
  });

  conn.model("Token", tokenSchema);
  conn.model("ConversionInstance", conversionInstanceSchema);

  return conn;
};

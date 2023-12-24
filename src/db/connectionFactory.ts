import { createConnection } from "mongoose";
import { tokenSchema } from "./tokenSchema";

export const connectionFactory = async () => {
  const dbConnectionString = process.env.DB_CONNECTION_STRING;

  if (!dbConnectionString) {
    throw new Error("DB_CONNECTION_STRING not found in .env");
  }

  const conn = await createConnection(dbConnectionString).asPromise();

  conn.addListener("error", (error) => {
    console.error("Mongo Error Listener:", error);
  });

  conn.model("Token", tokenSchema);

  return conn;
};

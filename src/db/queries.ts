import { type Connection } from "mongoose";

import { type TokenSchema } from "./tokenSchema";

export const getToken = (
  conn: Connection,
  projectSlug: string,
  tokenId: number,
) => {
  const Token = conn.model<TokenSchema>("Token");

  const query = Token.findOne({ project_slug: projectSlug, token_id: tokenId });

  return query.exec();
};

import type { Connection } from "mongoose";

import type {
  ConversionInstance,
  ConversionInstanceSchema,
} from "./conversionInstanceSchema";
import type { TokenSchema } from "./tokenSchema";

export const getToken = (
  conn: Connection,
  projectSlug: string,
  tokenId: number,
) => {
  const Token = conn.model<TokenSchema>("Token");

  const query = Token.findOne({ project_slug: projectSlug, token_id: tokenId });

  return query.exec();
};

export const createConversionInstance = (
  conn: Connection,
  projectSlug: string,
) => {
  const ConversionInstance =
    conn.model<ConversionInstanceSchema>("ConversionInstance");

  const conversionInstance = new ConversionInstance({
    project_slug: projectSlug,
    started_at: new Date(),
  });

  return conversionInstance.save();
};

export const updateConversionInstance = (
  conn: Connection,
  conversionInstance: ConversionInstance,
) => {
  const ConversionInstance =
    conn.model<ConversionInstanceSchema>("ConversionInstance");

  const query = ConversionInstance.updateOne(
    { _id: conversionInstance._id },
    conversionInstance,
  );

  return query.exec();
};

export const getLatestConverstionInstance = async (
  conn: Connection,
  projectSlug: string,
) => {
  const ConversionInstance =
    conn.model<ConversionInstanceSchema>("ConversionInstance");

  const exists = await ConversionInstance.findOne({});

  if (!exists) return null;

  const query = ConversionInstance.findOne({ project_slug: projectSlug })
    .sort({ started_at: -1 })
    .limit(1);

  return query.exec();
};

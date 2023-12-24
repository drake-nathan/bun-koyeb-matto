import type { Connection } from "mongoose";

import type { TokenSchema } from "../db/tokenSchema";
import { svgToPngAndUpload } from "./svgToPngAndUpload";

export const updateCompositeImage = async ({
  conn,
  svg,
  projectId,
  projectSlug,
  tokenId,
}: {
  conn: Connection;
  svg: string;
  projectId: number;
  projectSlug: string;
  tokenId: number;
}) => {
  const pngs = await svgToPngAndUpload(svg, projectId, projectSlug, tokenId);

  const Token = conn.model<TokenSchema>("Token");

  const query = Token.findOneAndUpdate(
    { project_id: projectId, token_id: tokenId },
    {
      image: pngs.image,
      image_mid: pngs.image_mid,
      image_small: pngs.image_small,
      image_updated_at: new Date(),
    },
    { new: true },
  );

  return query.lean().exec();
};

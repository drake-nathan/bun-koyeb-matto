import sharp from "sharp";

import { uploadImage } from "./uploadImage";

export const svgToPngAndUpload = async (
  svg: string,
  projectId: number,
  projectSlug: string,
  tokenId: number,
): Promise<{
  image: string;
  image_mid: string;
  image_small: string;
}> => {
  const sizes = {
    full: { width: 2160, height: 3840 },
    mid: { width: 1080, height: 1920 },
    small: { width: 540, height: 960 },
  };

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const midBuffer = await sharp(buffer).resize(sizes.mid).toBuffer();
  const smallBuffer = await sharp(buffer).resize(sizes.small).toBuffer();

  const image = await uploadImage(buffer, projectSlug, tokenId);
  const image_mid = await uploadImage(
    midBuffer,
    projectSlug,
    tokenId,
    "images-mid",
  );
  const image_small = await uploadImage(
    smallBuffer,
    projectSlug,
    tokenId,
    "thumbnails",
  );

  return { image, image_mid, image_small };
};

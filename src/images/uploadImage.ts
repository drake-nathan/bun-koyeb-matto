import { BlobServiceClient } from "@azure/storage-blob";

import { envVars } from "../env.config";

export const uploadImage = async (
  file: Buffer,
  project_slug: string,
  token_id: number,
  folderName = "images",
): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    envVars.AZURE_STORAGE_CONNECTION_STRING,
  );

  const containerClient = blobServiceClient.getContainerClient(folderName);

  await containerClient.createIfNotExists();
  await containerClient.setAccessPolicy("blob");

  const imageName = `${project_slug}_${token_id}.png`;
  const blockBlobClient = containerClient.getBlockBlobClient(imageName);

  await blockBlobClient.upload(file, file.length);

  await blockBlobClient.setHTTPHeaders({
    blobContentType: "image/png",
  });

  return blockBlobClient.url;
};

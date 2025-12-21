import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import dotenv from "dotenv";
dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

const credential = new StorageSharedKeyCredential(accountName, accountKey);

const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_CONTAINER_NAME
);

export { blobServiceClient, containerClient, credential };

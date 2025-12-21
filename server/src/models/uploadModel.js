import {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";
import { containerClient, credential } from "../config/azureBlob.js";

export class UploadModel {
  static async uploadFile(file, originalname) {
    try {
      const blobName = `${Date.now()}-${originalname}`; // Keep this
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      return {
        statusCode: 200,
        message: "Uploaded successfully",
        data: {
          blobName, // save this in DB
          fileUrl: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_CONTAINER_NAME}/${blobName}`,
          fileName: file.originalname,
        },
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to upload file");
    }
  }

  static async generateSasUrl(blobName) {
    try {
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: process.env.AZURE_CONTAINER_NAME,
          blobName,
          permissions: BlobSASPermissions.parse("r"),
          expiresOn: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes

          contentDisposition: `attachment; filename="${blobName}"`,
        },
        credential
      ).toString();

      return {
        statusCode: 200,
        data: {
          fileUrl: `https://${
            process.env.AZURE_STORAGE_ACCOUNT_NAME
          }.blob.core.windows.net/${
            process.env.AZURE_CONTAINER_NAME
          }/${encodeURIComponent(blobName)}?${sasToken}`,
          fileName: blobName,
        },
      };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to generate SAS URL");
    }
  }
}

import { UploadModel } from "../models/uploadModel.js";
import { containerClient } from "../config/azureBlob.js";

export class UploadController {
  async uploadFile(req, res) {
    try {
      const { file } = req;
      const { blobName } = req.body;

      console.log({ file, blobName });
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadRes = await UploadModel.uploadFile(file, blobName);

      res.send({
        statusCode: 200,
        message: "File uploaded successfully",
        data: uploadRes?.data,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async generateSasUrl(req, res) {
    try {
      const { fileName } = req.body;

      if (!fileName) {
        return res.status(400).json({ message: "No file name provided" });
      }

      const sasRes = await UploadModel.generateSasUrl(fileName);
      console.log({ sasRes });
      res.send({
        statusCode: 200,
        message: "SAS URL generated successfully",
        data: sasRes?.data,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

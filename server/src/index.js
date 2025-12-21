import dotenv from "dotenv";
import mainHandler from "./handler/main.js";

dotenv.config();

await mainHandler();

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

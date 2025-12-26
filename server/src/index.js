import dotenv from "dotenv";
import mainHandler from "./handler/main.js";

dotenv.config();

(async () => {
  try {
    await mainHandler();
    console.log("✅ Server started successfully");
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1); // ensures Azure knows the startup failed
  }
})();

// Catch unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

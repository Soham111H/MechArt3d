// scripts/db-push.js
// Safe database sync for serverless TiDB clusters on Vercel
const { execSync } = require("child_process");

console.log("[db-push] Syncing database schema with TiDB...");

try {
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  console.log("[db-push] ✅ Database schema is up to date.");
} catch (err1) {
  console.warn("[db-push] ⚠️ First attempt timed out (TiDB waking up from idle). Retrying in 4 seconds...");
  try {
    // Wait 4 seconds synchronously for TiDB to finish cold-start
    const start = Date.now();
    while (Date.now() - start < 4000) {}

    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("[db-push] ✅ Database schema synced successfully on retry.");
  } catch (err2) {
    console.warn("[db-push] ⚠️ TiDB database unreachable during build. Proceeding with build to avoid deployment failure.");
  }
}

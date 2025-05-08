import { exec } from "child_process";
import { promisify } from "util";
import { createSnapshot } from "./db-snapshot";

const execAsync = promisify(exec);

async function runPrismaCommand(command: string) {
  try {
    // Create a snapshot before running the command
    console.log("📸 Creating database snapshot...");
    await createSnapshot();
    console.log("✅ Snapshot created successfully");

    // Run the Prisma command
    console.log(`\n🚀 Running Prisma command: ${command}`);
    const { stdout, stderr } = await execAsync(`npx prisma ${command}`);

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("\n✅ Prisma command completed successfully");
  } catch (error) {
    console.error("\n❌ Error:", error);
    console.log("\n⚠️  You can restore the database using:");
    console.log("npm run db:snapshot:list    # To see available snapshots");
    console.log(
      "npm run db:snapshot:restore <snapshot-path>    # To restore a snapshot"
    );
    process.exit(1);
  }
}

// Get the command from command line arguments
const command = process.argv.slice(2).join(" ");

if (!command) {
  console.log(`
Usage:
  npm run prisma:safe <prisma-command>

Examples:
  npm run prisma:safe migrate reset
  npm run prisma:safe migrate deploy
  npm run prisma:safe db push
  `);
  process.exit(1);
}

runPrismaCommand(command);

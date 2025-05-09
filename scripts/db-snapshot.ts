import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const prisma = new PrismaClient();

const SNAPSHOTS_DIR = path.join(process.cwd(), "db-snapshots");

// Ensure snapshots directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

async function createSnapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapshotPath = path.join(SNAPSHOTS_DIR, `snapshot-${timestamp}.sql`);

  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not found in environment variables");
    }

    // Create snapshot using pg_dump
    const command = `pg_dump --format=custom --no-owner --no-privileges --clean --if-exists --no-acl --file=\"${snapshotPath}\" \"${databaseUrl}\"`;
    await execAsync(command);

    console.log(`✅ Database snapshot created: ${snapshotPath}`);
    return snapshotPath;
  } catch (error) {
    console.error("❌ Error creating snapshot:", error);
    throw error;
  }
}

async function restoreSnapshot(snapshotPath: string) {
  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not found in environment variables");
    }

    // Parse database name from URL
    const match = databaseUrl.match(/\/([^\/\?]+)(\?.*)?$/);
    if (!match) {
      throw new Error("Could not parse database name from DATABASE_URL");
    }
    const dbName = match[1];

    // Drop and recreate the database
    const dropCommand = `dropdb \"${dbName}\" --if-exists`;
    const createCommand = `createdb \"${dbName}\"`;
    await execAsync(dropCommand);
    await execAsync(createCommand);

    // Restore snapshot using pg_restore
    const restoreCommand = `pg_restore --no-owner --no-privileges --clean --if-exists --no-acl --dbname=\"${databaseUrl}\" \"${snapshotPath}\"`;
    await execAsync(restoreCommand);

    console.log(`✅ Database restored from snapshot: ${snapshotPath}`);
  } catch (error) {
    console.error("❌ Error restoring snapshot:", error);
    throw error;
  }
}

async function listSnapshots() {
  try {
    const files = fs.readdirSync(SNAPSHOTS_DIR);
    const snapshots = files
      .filter((file) => file.endsWith(".sql"))
      .map((file) => ({
        name: file,
        path: path.join(SNAPSHOTS_DIR, file),
        date: fs.statSync(path.join(SNAPSHOTS_DIR, file)).mtime,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    console.log("\nAvailable snapshots:");
    snapshots.forEach((snapshot) => {
      console.log(`📅 ${snapshot.date.toLocaleString()} - ${snapshot.name}`);
    });
    return snapshots;
  } catch (error) {
    console.error("❌ Error listing snapshots:", error);
    throw error;
  }
}

// Export functions for use in other scripts
export { createSnapshot, restoreSnapshot, listSnapshots };

const command = process.argv[2];
const snapshotPath = process.argv[3];

switch (command) {
  case "create":
    createSnapshot()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  case "restore":
    if (!snapshotPath) {
      console.error("❌ Please provide a snapshot path");
      process.exit(1);
    }
    restoreSnapshot(snapshotPath)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  case "list":
    listSnapshots()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  default:
    console.log(`
Usage:
  npm run db:snapshot create    # Create a new snapshot
  npm run db:snapshot restore <path>  # Restore from a snapshot
  npm run db:snapshot list     # List available snapshots
    `);
    process.exit(1);
}

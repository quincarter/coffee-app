import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    // Log the session for debugging

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    // Get the upload context (profile, brewing-device, etc.)
    const context = (formData.get("context") as string) || "profile";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("Missing BLOB_READ_WRITE_TOKEN environment variable");
      return NextResponse.json(
        { error: "Server configuration error: Missing Blob storage token" },
        { status: 500 }
      );
    }

    // Determine the directory based on context
    let directory;
    switch (context) {
      case "brewing-device":
        directory = "brewing-devices";
        break;
      case "profile":
        directory = "user-profile-images";
        break;
      case "brew-session":
        directory = "brew-session-images";
        break;
      case "background":
        directory = "user-background-images";
        break;
      default:
        directory = "misc";
        break;
    }

    // Generate a unique filename
    const filename = `${directory}/${
      session.user.id
    }-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

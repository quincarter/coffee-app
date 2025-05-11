export async function uploadImage(
  file: File,
  context: string
): Promise<string> {
  try {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("context", context);

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image");
    }

    const uploadData = await uploadResponse.json();
    return uploadData.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

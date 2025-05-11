import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Define the session type
export type Session = {
  userId: string;
  user: {
    backgroundImage: string;
    backgroundOpacity: number;
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string; // Added optional image property
  };
  exp?: number;
};

// Create a secret key for JWT signing
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "default-secret-key-change-in-production"
);

// Encrypt session data into a JWT
export async function encrypt(payload: Session): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey);
}

// Decrypt JWT token back to session data
export async function decrypt(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as Session;
  } catch (error) {
    console.error("Failed to decrypt session token:", error);
    return null;
  }
}

// Get the current session
export async function getSession(): Promise<Session | null> {
  console.log("getSession called");
  const cookieStore = cookies();
  const token = (await cookieStore).get("session")?.value;

  console.log("Session token exists:", !!token);
  if (token) {
    console.log("Session token length:", token.length);
  }

  if (!token) {
    console.log("No session token found in cookies");
    return null;
  }

  try {
    const decryptedSession = await decrypt(token);
    console.log("Session decrypted successfully:", !!decryptedSession);
    return decryptedSession;
  } catch (error) {
    console.error("Error decrypting session:", error);
    return null;
  }
}

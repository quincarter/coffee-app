import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

// Secret key for JWT signing - in production, use a proper secret management system
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-at-least-32-characters"
);

// Session type definition
export type Session = {
  userId: string;
  user: {
    email: string;
    name: string;
    role: string;
  };
};

// Encrypt session data into a JWT
export async function encrypt(payload: Session): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

// Decrypt and verify JWT
export async function decrypt(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as Session;
  } catch (error) {
    return null;
  }
}

// Get the current session
export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  return decrypt(token);
}

// Verify session and redirect if not authenticated
export async function verifySession() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId, user: session.user };
}

// Create a new session
export async function createSession(
  userId: string,
  user: { email: string; name: string; role: string }
) {
  const session: Session = {
    userId,
    user,
  };

  const token = await encrypt(session);

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

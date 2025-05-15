import { cookies } from "next/headers";
import { Session } from "./session";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "default-secret-key"
);

export async function getServerUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
    return payload.user as Session["user"];
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return null;
  }
}

export async function requireAdmin() {
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return user;
}

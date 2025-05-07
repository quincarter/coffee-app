"use server";

import { getSession } from "../lib/session";

export async function refreshSession() {
  return await getSession();
}

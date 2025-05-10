'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "./authConfig";

// Function to get session in API routes
export async function getAuthSession() {
  return getServerSession(authOptions);
}

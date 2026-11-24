
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "6ixtem_crm_session";
const SESSION_DURATION = 8 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.CRM_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("CRM_SESSION_SECRET must contain at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  const token = await new SignJWT({
    role: "CRM_ADMIN",
    email: process.env.CRM_ADMIN_EMAIL,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSecret());

    return (
      payload.role === "CRM_ADMIN" &&
      payload.email === process.env.CRM_ADMIN_EMAIL
    );
  } catch {
    return false;
  }
}

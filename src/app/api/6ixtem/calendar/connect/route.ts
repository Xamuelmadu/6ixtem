import crypto from "node:crypto";
import { NextResponse } from "next/server";

import {
  buildOAuthClient,
  CALENDAR_SCOPE,
  createOAuthState,
} from "@/lib/6ixtem-google-calendar";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const suppliedSecret =
    url.searchParams.get("secret");

  const expectedSecret =
    process.env.GOOGLE_CALENDAR_CONNECT_SECRET;

  if (
    !expectedSecret ||
    !suppliedSecret ||
    Buffer.byteLength(suppliedSecret) !==
      Buffer.byteLength(expectedSecret)
  ) {
    return NextResponse.json(
      { error: "Not authorized." },
      { status: 401 },
    );
  }

  if (
    !crypto.timingSafeEqual(
      Buffer.from(suppliedSecret),
      Buffer.from(expectedSecret),
    )
  ) {
    return NextResponse.json(
      { error: "Not authorized." },
      { status: 401 },
    );
  }

  try {
    const oauth = buildOAuthClient();
    const state = createOAuthState();

    const authUrl = oauth.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",

      scope: [
        CALENDAR_SCOPE,
        "https://www.googleapis.com/auth/userinfo.email",
      ],

      state,
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error(
      "Google Calendar connection error:",
      error,
    );

    return NextResponse.json(
      { error: "Could not start Google authorization." },
      { status: 500 },
    );
  }
}
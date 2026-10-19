import { NextResponse } from "next/server";
import { google } from "googleapis";

import {
  buildOAuthClient,
  saveGoogleTokens,
  verifyOAuthState,
} from "@/lib/6ixtem-google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.json(
      {
        error:
          "Google Calendar authorization was declined.",
      },
      { status: 400 },
    );
  }

  if (
    !code ||
    !verifyOAuthState(state)
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid or expired Google OAuth state.",
      },
      { status: 400 },
    );
  }

  try {
    const oauth = buildOAuthClient();

    const { tokens } = await oauth.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          error:
            "Google did not return a refresh token. Revoke the application's access in your Google Account, then connect again.",
        },
        { status: 400 },
      );
    }

    oauth.setCredentials(tokens);

    const oauth2 = google.oauth2({
      version: "v2",
      auth: oauth,
    });

    const profile =
      await oauth2.userinfo.get();

    await saveGoogleTokens(
      tokens.refresh_token,
      profile.data.email,
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      url.origin;

    return NextResponse.redirect(
      new URL(
        "/6ixtem/assessment/booking?calendar=connected",
        baseUrl,
      ),
    );
  } catch (error) {
    console.error(
      "Google Calendar OAuth callback failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Could not connect Google Calendar.",
      },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSession } from "@/lib/crm/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    const configuredEmail =
      process.env.CRM_ADMIN_EMAIL?.trim().toLowerCase();
    const passwordHash = process.env.CRM_ADMIN_PASSWORD_HASH;

    if (!configuredEmail || !passwordHash) {
      return NextResponse.json(
        { success: false, message: "CRM authentication is not configured." },
        { status: 500 },
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    const emailMatches = email === configuredEmail;
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    await createAdminSession();

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      admin: { email: configuredEmail },
    });
  } catch (error) {
    console.error("[CRM_ADMIN_LOGIN]", error);

    return NextResponse.json(
      { success: false, message: "Unable to complete login." },
      { status: 500 },
    );
  }
}
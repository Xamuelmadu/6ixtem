
import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/crm/admin-auth";

export async function POST() {
  await destroyAdminSession();

  return NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
}

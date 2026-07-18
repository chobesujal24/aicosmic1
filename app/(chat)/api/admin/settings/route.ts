import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { isAdminUser } from "@/lib/firebase";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin-tracking";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdminUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const settings = await getAdminSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdminUser(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const success = await updateAdminSettings(body);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

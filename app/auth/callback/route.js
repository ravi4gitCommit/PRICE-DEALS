import { createClient } from "@/utils/superbase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.log("Auth error:", error);
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
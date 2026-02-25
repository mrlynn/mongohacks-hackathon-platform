import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

// Force sign out and clear cookies
export async function POST() {
  try {
    await signOut({ redirect: false });
    const response = NextResponse.json({ success: true });
    
    // Clear all auth cookies
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    response.cookies.delete("authjs.csrf-token");
    response.cookies.delete("__Host-authjs.csrf-token");
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

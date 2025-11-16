import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    console.log("Environment:", process.env.NODE_ENV);
    console.log("AUTH_SECRET exists:", !!process.env.AUTH_SECRET);
    console.log(process.env.AUTH_SECRET);

    // Try with different secureCookie settings
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      // secureCookie を指定しない（自動検出させる）
    });

    if (!token) {
      const allCookies = request.cookies.getAll();
      console.log("All cookies:", allCookies.map(c => c.name));

      return NextResponse.json({
        error: "No token found",
        debug: {
          cookieNames: allCookies.map(c => c.name),
          env: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV
        }
      }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract token", details: String(error) },
      { status: 500 }
    );
  }
}

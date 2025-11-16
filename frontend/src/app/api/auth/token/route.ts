import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    console.log("Environment:", process.env.NODE_ENV);
    console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);

    // NextAuthのJWTトークンを取得
    // secureCookie を環境に応じて明示的に指定
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    console.log("Token found:", !!token);

    if (!token) {
      const allCookies = request.cookies.getAll();
      console.log("All cookies:", allCookies.map(c => c.name));

      return NextResponse.json({
        error: "No token found",
        debug: {
          cookieNames: allCookies.map(c => c.name),
          env: process.env.NODE_ENV,
          hasSecret: !!process.env.NEXTAUTH_SECRET,
          secureCookie: process.env.NODE_ENV === "production",
        }
      }, { status: 401 });
    }

    // トークン全体を返す（id, email, roles, tenantIdなどが含まれる）
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract token", details: String(error) },
      { status: 500 }
    );
  }
}

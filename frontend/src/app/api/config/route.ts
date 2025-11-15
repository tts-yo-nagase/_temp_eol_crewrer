import { NextRequest, NextResponse } from "next/server";

/**
 * アプリケーション設定を取得するAPIエンドポイント
 * 認証不要でアクセス可能
 * GET /api/config
 */
export async function GET(request: NextRequest) {
  try {
    // サーバーサイドで環境変数を取得
    const apiUrl = process.env.API_URL;

    // 設定オブジェクトを構築
    const config = {
      apiUrl: apiUrl || "http://localhost:3010", // デフォルト値
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(config, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300", // 5分間キャッシュ
      },
    });
  } catch (error) {
    console.error("設定取得エラー:", error);

    return NextResponse.json(
      {
        error: "設定の取得に失敗しました",
        apiUrl: "http://localhost:3010", // フォールバック値
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}

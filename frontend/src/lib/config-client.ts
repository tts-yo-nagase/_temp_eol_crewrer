/**
 * クライアントサイドでアプリケーション設定を取得するためのユーティリティ関数
 */

/**
 * アプリケーション設定の型定義
 */
export interface AppConfig {
  apiUrl: string;
  timestamp: string;
}

/**
 * 設定をキャッシュするための変数
 */
let configCache: AppConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間

/**
 * サーバーからアプリケーション設定を取得する
 * @param forceRefresh キャッシュを無視して強制的に再取得するかどうか
 * @returns アプリケーション設定
 */
export async function getAppConfig(
  forceRefresh: boolean = false
): Promise<AppConfig> {
  const now = Date.now();

  // キャッシュが有効で、強制更新でない場合はキャッシュを返す
  if (!forceRefresh && configCache && now - cacheTimestamp < CACHE_DURATION) {
    return configCache;
  }

  try {
    const response = await fetch("/api/config", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`設定の取得に失敗しました: ${response.status}`);
    }

    const config: AppConfig = await response.json();

    // キャッシュを更新
    configCache = config;
    cacheTimestamp = now;

    return config;
  } catch (error) {
    console.error("設定取得エラー:", error);

    // エラー時はキャッシュがあればそれを使用、なければデフォルト値を返す
    if (configCache) {
      return configCache;
    }

    return {
      apiUrl: "http://localhost:3010",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * API URLを取得する（キャッシュ付き）
 * @param forceRefresh キャッシュを無視して強制的に再取得するかどうか
 * @returns API URL
 */
export async function getApiUrl(
  forceRefresh: boolean = false
): Promise<string> {
  const config = await getAppConfig(forceRefresh);
  return config.apiUrl;
}

/**
 * 設定キャッシュをクリアする
 */
export function clearConfigCache(): void {
  configCache = null;
  cacheTimestamp = 0;
}

/**
 * 設定がキャッシュされているかどうかを確認する
 * @returns キャッシュされているかどうか
 */
export function isConfigCached(): boolean {
  const now = Date.now();
  return configCache !== null && now - cacheTimestamp < CACHE_DURATION;
}

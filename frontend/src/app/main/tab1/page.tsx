'use client';

import { ScrollRestoration } from '@/components/navigation/scroll-restoration';
import { PageTitle } from '@/components/ui/page-title';
import { Package, Plus, Search } from 'lucide-react';

export default function Tab1Page() {
  return (
    <>
      <ScrollRestoration tabId="tab1" />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <PageTitle className="mb-4 flex items-center gap-3">
            <Package className="h-8 w-8" />
            製品割り当て
          </PageTitle>
          <p className="text-muted-foreground">
            製品の割り当てと管理を行います。対象システムに製品を割り当て、EOL情報を追跡します。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* カード1: 製品リスト */}
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <div className="flex items-center gap-3 mb-3">
              <Search className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">製品リスト</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              登録されている製品の一覧を表示します
            </p>
            <div className="text-sm text-muted-foreground">
              合計: 0 製品
            </div>
          </div>

          {/* カード2: 新規登録 */}
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <div className="flex items-center gap-3 mb-3">
              <Plus className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">新規登録</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              新しい製品を登録します
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              製品を登録
            </button>
          </div>

          {/* カード3: 統計情報 */}
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <div className="flex items-center gap-3 mb-3">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">統計情報</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              製品割当の統計を表示します
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">アクティブ:</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">非アクティブ:</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* プレースホルダーコンテンツ - 最近の製品 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">最近の製品</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-4 font-semibold grid grid-cols-4 gap-4">
              <div>製品名</div>
              <div>バージョン</div>
              <div>EOL日</div>
              <div>ステータス</div>
            </div>
            <div className="divide-y">
              {[
                { name: 'Product A', version: '1.0.0', eol: '2025-12-31', status: 'アクティブ' },
                { name: 'Product B', version: '2.1.0', eol: '2026-06-30', status: 'アクティブ' },
                { name: 'Product C', version: '3.0.0', eol: '2025-03-15', status: '注意' },
                { name: 'Product D', version: '1.5.2', eol: '2024-12-31', status: 'EOL' },
                { name: 'Product E', version: '4.0.0', eol: '2027-01-01', status: 'アクティブ' },
              ].map((product, i) => (
                <div key={i} className="p-4 grid grid-cols-4 gap-4 hover:bg-accent transition-colors">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-muted-foreground">{product.version}</div>
                  <div className="text-muted-foreground">{product.eol}</div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.status === 'アクティブ' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                      product.status === '注意' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

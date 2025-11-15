'use client';

import { PageTitle } from '@/components/ui/page-title';
import { ShieldAlert, Package2 } from 'lucide-react';

export default function ProductViewPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <PageTitle className="mb-4 flex items-center gap-3">
          <Package2 className="h-8 w-8" />
          製品軸ビュー
        </PageTitle>
        <p className="text-muted-foreground">
          製品ごとの脆弱性状況を確認できます
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">重大</h2>
          </div>
          <p className="text-3xl font-bold text-red-500">5</p>
          <p className="text-sm text-muted-foreground mt-2">Critical vulnerabilities</p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold">高</h2>
          </div>
          <p className="text-3xl font-bold text-orange-500">12</p>
          <p className="text-sm text-muted-foreground mt-2">High vulnerabilities</p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">中</h2>
          </div>
          <p className="text-3xl font-bold text-yellow-500">23</p>
          <p className="text-sm text-muted-foreground mt-2">Medium vulnerabilities</p>
        </div>
      </div>

      {/* 製品別脆弱性リスト */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">製品別脆弱性一覧</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-4 font-semibold grid grid-cols-5 gap-4">
            <div>製品名</div>
            <div>バージョン</div>
            <div className="text-center">重大</div>
            <div className="text-center">高</div>
            <div className="text-center">中</div>
          </div>
          <div className="divide-y">
            {[
              { name: 'Product A', version: '1.0.0', critical: 2, high: 5, medium: 8 },
              { name: 'Product B', version: '2.1.0', critical: 0, high: 3, medium: 7 },
              { name: 'Product C', version: '3.0.0', critical: 1, high: 2, medium: 4 },
              { name: 'Product D', version: '1.5.2', critical: 2, high: 2, medium: 4 },
              { name: 'Product E', version: '4.0.0', critical: 0, high: 0, medium: 0 },
            ].map((product, i) => (
              <div key={i} className="p-4 grid grid-cols-5 gap-4 hover:bg-accent transition-colors">
                <div className="font-semibold">{product.name}</div>
                <div className="text-muted-foreground">{product.version}</div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.critical > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 'text-muted-foreground'
                  }`}>
                    {product.critical}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.high > 0 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' : 'text-muted-foreground'
                  }`}>
                    {product.high}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.medium > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'text-muted-foreground'
                  }`}>
                    {product.medium}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

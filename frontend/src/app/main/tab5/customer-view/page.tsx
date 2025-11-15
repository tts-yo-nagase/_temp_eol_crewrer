'use client';

import { PageTitle } from '@/components/ui/page-title';
import { ShieldAlert, Users2 } from 'lucide-react';

export default function CustomerViewPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <PageTitle className="mb-4 flex items-center gap-3">
          <Users2 className="h-8 w-8" />
          顧客軸ビュー
        </PageTitle>
        <p className="text-muted-foreground">
          顧客ごとの脆弱性状況を確認できます
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-3 mb-3">
            <Users2 className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">総顧客数</h2>
          </div>
          <p className="text-3xl font-bold">45</p>
          <p className="text-sm text-muted-foreground mt-2">Total customers</p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">影響顧客</h2>
          </div>
          <p className="text-3xl font-bold text-red-500">18</p>
          <p className="text-sm text-muted-foreground mt-2">Affected customers</p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold">対応完了</h2>
          </div>
          <p className="text-3xl font-bold text-green-500">27</p>
          <p className="text-sm text-muted-foreground mt-2">Resolved customers</p>
        </div>
      </div>

      {/* 顧客別脆弱性リスト */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">顧客別脆弱性一覧</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-4 font-semibold grid grid-cols-5 gap-4">
            <div>顧客名</div>
            <div>製品数</div>
            <div className="text-center">重大</div>
            <div className="text-center">高</div>
            <div className="text-center">中</div>
          </div>
          <div className="divide-y">
            {[
              { name: 'Customer A Corp', products: 5, critical: 3, high: 8, medium: 12 },
              { name: 'Customer B Inc', products: 3, critical: 0, high: 4, medium: 9 },
              { name: 'Customer C Ltd', products: 7, critical: 2, high: 6, medium: 15 },
              { name: 'Customer D GmbH', products: 2, critical: 1, high: 2, medium: 3 },
              { name: 'Customer E SA', products: 4, critical: 0, high: 3, medium: 7 },
              { name: 'Customer F LLC', products: 6, critical: 4, high: 10, medium: 18 },
              { name: 'Customer G Pty', products: 3, critical: 0, high: 0, medium: 2 },
            ].map((customer, i) => (
              <div key={i} className="p-4 grid grid-cols-5 gap-4 hover:bg-accent transition-colors">
                <div className="font-semibold">{customer.name}</div>
                <div className="text-muted-foreground">{customer.products} 製品</div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    customer.critical > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 'text-muted-foreground'
                  }`}>
                    {customer.critical}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    customer.high > 0 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' : 'text-muted-foreground'
                  }`}>
                    {customer.high}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    customer.medium > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'text-muted-foreground'
                  }`}>
                    {customer.medium}
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

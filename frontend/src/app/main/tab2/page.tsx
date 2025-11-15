'use client';

import { ScrollRestoration } from '@/components/navigation/scroll-restoration';
import { PageTitle } from '@/components/ui/page-title';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, FileSearch } from 'lucide-react';

export default function Tab2Page() {
  return (
    <>
      <ScrollRestoration tabId="tab2" />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <PageTitle className="mb-4">EOL・脆弱性スキャン</PageTitle>
          <p className="text-muted-foreground">製品のEOL情報と脆弱性をスキャンします</p>
        </div>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="schedule" className="gap-2">
              <CalendarClock className="h-4 w-4" />
              スキャンスケジュール
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <FileSearch className="h-4 w-4" />
              スキャン結果
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <div className="p-6 border rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">スキャンスケジュール</h2>
              <p className="text-muted-foreground mb-4">
                定期的なスキャンスケジュールを設定できます。
              </p>

              {/* プレースホルダーコンテンツ */}
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">スケジュール {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      スキャンスケジュールの詳細がここに表示されます。
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="p-6 border rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">スキャン結果</h2>
              <p className="text-muted-foreground mb-4">
                過去のスキャン結果を確認できます。
              </p>

              {/* プレースホルダーコンテンツ */}
              <div className="space-y-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">スキャン結果 {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      スキャン結果の詳細がここに表示されます。
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Building, Users } from 'lucide-react';

export default function Tab3Page() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">メンテナンス</h1>
        <p className="text-muted-foreground">システムの基本設定とユーザー管理</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/main/tab3/company')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-8 w-8 text-primary" />
              <CardTitle>会社管理</CardTitle>
            </div>
            <CardDescription>
              会社情報の登録・編集・削除
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              会社管理を開く
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/main/tab3/users')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>ユーザー管理</CardTitle>
            </div>
            <CardDescription>
              ユーザーアカウントの登録・編集・削除
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              ユーザー管理を開く
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

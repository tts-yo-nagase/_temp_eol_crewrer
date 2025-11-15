'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTitle } from '@/components/ui/page-title';
import { toast } from '@/hooks/use-toast';
import { apiClient, User } from '@/lib/api-client';
import { Loader2, User as UserIcon, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (!session?.user?.email) return;

      const userData = await apiClient.getMyProfile();
      if (userData) {
        setUser(userData);
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'エラー',
        description: 'ユーザー情報の取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setUpdating(true);
      const updatedUser = await apiClient.updateMyProfile({
        name: profileData.name,
      });

      // Update session with new data and force refresh from server
      await updateSession();

      // Update local state with the response
      setUser(updatedUser);
      setProfileData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
      });

      toast({
        title: '成功',
        description: 'プロフィール情報を更新しました',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'エラー',
        description: 'プロフィール情報の更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'エラー',
        description: '新しいパスワードと確認用パスワードが一致しません',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'エラー',
        description: 'パスワードは6文字以上である必要があります',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChangingPassword(true);

      // Verify current password
      const validUser = await apiClient.validateUser({
        email: user.email || '',
        password: passwordData.currentPassword,
      });

      if (!validUser) {
        toast({
          title: 'エラー',
          description: '現在のパスワードが正しくありません',
          variant: 'destructive',
        });
        return;
      }

      // Update password
      await apiClient.updateUser(user.id, {
        password: passwordData.newPassword,
      });

      toast({
        title: '成功',
        description: 'パスワードを変更しました',
      });

      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'エラー',
        description: 'パスワードの変更に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div>
          <PageTitle>アカウント設定</PageTitle>
          <p className="text-muted-foreground mt-2">
            プロフィール情報とパスワードを管理します
          </p>
        </div>

        <Separator />

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
              <CardTitle>プロフィール情報</CardTitle>
            </div>
            <CardDescription>
              名前を更新できます（メールアドレスは変更できません）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  placeholder="example@example.com"
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  セキュリティ上の理由により、メールアドレスは変更できません
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={updating}>
                  {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  更新
                </Button>
                {user && (
                  <div className="text-sm text-muted-foreground">
                    役割: <span className="font-medium">{user.roles.join(', ')}</span>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
              <CardTitle>パスワード変更</CardTitle>
            </div>
            <CardDescription>
              セキュリティのため、定期的にパスワードを変更することをお勧めします
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">現在のパスワード</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">新しいパスワード</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  6文字以上で入力してください
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                パスワードを変更
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageTitle } from '@/components/ui/page-title';
import { toast } from '@/hooks/use-toast';
import { companyApi, Company, CreateCompanyDto } from '@/lib/company-api';
import { Plus, Edit, Trash2, Loader2, Search, X } from 'lucide-react';

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: '',
    code: '',
    address: '',
    phone: ''
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch companies when debounced search term changes
  useEffect(() => {
    fetchCompanies();
  }, [debouncedSearchTerm]);

  const fetchCompanies = async () => {
    try {
      // Show full loading only on initial load, use searching state for subsequent searches
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setSearching(true);
      }

      const data = await companyApi.getAllCompanies(debouncedSearchTerm);
      setCompanies(data);

      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '会社情報の取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast({
        title: 'エラー',
        description: '会社名と会社コードは必須です',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingCompany) {
        await companyApi.updateCompany(editingCompany.id, formData);
        toast({
          title: '成功',
          description: '会社情報を更新しました',
        });
      } else {
        await companyApi.createCompany(formData);
        toast({
          title: '成功',
          description: '会社を追加しました',
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchCompanies();
    } catch (error) {
      toast({
        title: 'エラー',
        description: editingCompany ? '会社情報の更新に失敗しました' : '会社の追加に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      code: company.code,
      address: company.address || '',
      phone: company.phone || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;

    try {
      await companyApi.deleteCompany(companyToDelete.id);
      toast({
        title: '成功',
        description: '会社を削除しました',
      });
      fetchCompanies();
    } catch (error) {
      toast({
        title: 'エラー',
        description: '会社の削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: ''
    });
    setEditingCompany(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <PageTitle>会社管理</PageTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                会社を追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? '会社情報編集' : '新規会社追加'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">会社名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">会社コード *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">住所</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingCompany ? '更新' : '追加'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    キャンセル
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="会社名・コード・住所・電話番号で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searching ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>会社名</TableHead>
              <TableHead>会社コード</TableHead>
              <TableHead>住所</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  会社が登録されていません
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.code}</TableCell>
                  <TableCell>{company.address || '-'}</TableCell>
                  <TableCell>{company.phone || '-'}</TableCell>
                  <TableCell>
                    {new Date(company.createdAt).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(company)}
                        aria-label={`${company.name}を編集`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(company)}
                        aria-label={`${company.name}を削除`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>会社を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {companyToDelete && `「${companyToDelete.name}」を削除します。この操作は取り消せません。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

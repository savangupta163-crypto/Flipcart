'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';

// lucide-react icons
import {
  LayoutDashboard,
  Tag,
  Layers,
  Package,
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Search,
  Menu,
  Store,
  BarChart3,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { products: number; subcategories?: number };
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  categoryId: string;
  order: number;
  active: boolean;
  category?: Category;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  discount: number;
  images: string;
  categoryId: string;
  subCategoryId?: string | null;
  features: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured: boolean;
  isDealOfDay: boolean;
  brand: string;
  seller: string;
  category?: Category;
  subCategory?: SubCategory;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  order: number;
  active: boolean;
}

interface AdminStats {
  categoryCount: number;
  subCategoryCount: number;
  productCount: number;
  bannerCount: number;
  cartCount: number;
  featuredCount: number;
  avgPrice: number;
  totalValue: number;
  categoryProducts: (Category & { _count: { products: number } })[];
  recentProducts: (Product & { category: Category })[];
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type TabId = 'dashboard' | 'categories' | 'subcategories' | 'products' | 'banners';

// ============================================================
// CONSTANTS & HELPERS
// ============================================================

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'subcategories', label: 'Subcategories', icon: Layers },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'banners', label: 'Banners', icon: ImageIcon },
];

const SIDEBAR_BG = '#172337';
const PRIMARY_BLUE = '#2874f0';
const ORANGE_CTA = '#fb641b';
const GREEN_SUCCESS = '#388e3c';
const RED_DESTRUCTIVE = '#ff6161';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }
  return res.json();
}

function parseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

// ============================================================
// ZOD SCHEMAS
// ============================================================

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.string().default(''),
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

const subcategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.string().default(''),
  categoryId: z.string().min(1, 'Category is required'),
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().default(''),
  brand: z.string().default(''),
  seller: z.string().default(''),
  price: z.coerce.number().min(0, 'Price must be positive'),
  mrp: z.coerce.number().min(0, 'MRP must be positive'),
  inStock: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isDealOfDay: z.boolean().default(false),
  imagesText: z.string().default(''),
  categoryId: z.string().min(1, 'Category is required'),
  subCategoryId: z.string().optional().default(''),
  featuresText: z.string().default(''),
  rating: z.coerce.number().min(1).max(5).default(4),
  reviewCount: z.coerce.number().min(0).default(0),
});

const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().default(''),
  image: z.string().default(''),
  link: z.string().default(''),
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type SubCategoryFormData = z.infer<typeof subcategorySchema>;
type ProductFormData = z.infer<typeof productSchema>;
type BannerFormData = z.infer<typeof bannerSchema>;

// ============================================================
// SHARED COMPONENTS
// ============================================================

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-[#ff6161] text-white hover:bg-[#e55555]"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Package className="mb-3 h-12 w-12 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ============================================================
// DASHBOARD TAB
// ============================================================

function DashboardTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAPI<AdminStats>('/api/admin/stats');
      setStats(data);
    } catch {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Total Categories', value: stats.categoryCount, icon: Tag, color: '#2874f0', bgColor: '#e8f0fe' },
      { label: 'Total Products', value: stats.productCount, icon: Package, color: '#388e3c', bgColor: '#e8f5e9' },
      { label: 'Total Banners', value: stats.bannerCount, icon: ImageIcon, color: '#fb641b', bgColor: '#fff3e0' },
      { label: 'Total Revenue Value', value: formatCurrency(stats.totalValue), icon: TrendingUp, color: '#7c3aed', bgColor: '#f3e8ff' },
    ];
  }, [stats]);

  const maxProductCount = useMemo(() => {
    if (!stats) return 0;
    return Math.max(...stats.categoryProducts.map((c) => c._count.products), 1);
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!stats) return <EmptyState message="Failed to load dashboard stats" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <card.icon className="h-6 w-6" style={{ color: card.color }} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Products */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Recent Products</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStats}
            className="text-muted-foreground"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentProducts.length === 0 ? (
            <EmptyState message="No products yet" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-right">Price</TableHead>
                    <TableHead className="text-xs text-right">MRP</TableHead>
                    <TableHead className="text-xs text-right">Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentProducts.map((p) => {
                    const imgs = parseJSON<string[]>(p.images, []);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            {imgs[0] && (
                              <img
                                src={imgs[0]}
                                alt={p.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <span className="max-w-[200px] truncate">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{p.category?.name || '-'}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(p.price)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatCurrency(p.mrp)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          <span style={{ color: GREEN_SUCCESS }}>{p.discount}% off</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.categoryProducts.length === 0 ? (
            <EmptyState message="No categories yet" />
          ) : (
            <div className="space-y-3">
              {stats.categoryProducts.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm font-medium">
                    {cat.name}
                  </span>
                  <div className="flex-1">
                    <div className="h-6 w-full overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: PRIMARY_BLUE }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max((cat._count.products / maxProductCount) * 100, 2)}%`,
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-medium tabular-nums">
                    {cat._count.products}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// CATEGORIES TAB
// ============================================================

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', image: '', order: 0, active: true },
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAPI<Category[]>('/api/categories?all=true');
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const watchedName = form.watch('name');

  useEffect(() => {
    if (!editTarget && watchedName) {
      form.setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, editTarget, form]);

  const handleAdd = () => {
    setEditTarget(null);
    form.reset({ name: '', slug: '', image: '', order: 0, active: true });
    setDialogOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditTarget(cat);
    form.reset({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      order: cat.order,
      active: cat.active,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (cat: Category) => {
    setDeleteTarget(cat);
    setDeleteOpen(true);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await fetchAPI('/api/categories', {
          method: 'PUT',
          body: JSON.stringify({ id: editTarget.id, ...data }),
        });
        toast.success('Category updated successfully');
      } else {
        await fetchAPI('/api/categories', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast.success('Category created successfully');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchAPI(`/api/categories?id=${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Category deleted successfully');
      setDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">{categories.length} total</p>
        </div>
        <Button
          onClick={handleAdd}
          className="text-white"
          style={{ backgroundColor: PRIMARY_BLUE }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : categories.length === 0 ? (
            <EmptyState message="No categories found. Add your first category!" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Image</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Slug</TableHead>
                    <TableHead className="text-xs text-center">Order</TableHead>
                    <TableHead className="text-xs text-center">Active</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                            <Tag className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell className="text-center text-sm">{cat.order}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={cat.active ? 'default' : 'secondary'}
                          className={
                            cat.active
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : ''
                          }
                        >
                          {cat.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cat)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(cat)}
                            className="h-8 w-8 p-0 text-[#ff6161] hover:text-[#ff6161]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                placeholder="Category name"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-[#ff6161]">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                placeholder="category-slug"
                {...form.register('slug')}
              />
              {form.formState.errors.slug && (
                <p className="text-xs text-[#ff6161]">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-image">Image URL</Label>
              <Input
                id="cat-image"
                placeholder="https://example.com/image.jpg"
                {...form.register('image')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order">Order</Label>
              <Input
                id="cat-order"
                type="number"
                placeholder="0"
                {...form.register('order')}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch('active')}
                onCheckedChange={(checked) => form.setValue('active', checked)}
              />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="text-white"
                style={{ backgroundColor: PRIMARY_BLUE }}
              >
                {submitting ? 'Saving...' : editTarget ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all its subcategories and associated data.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </motion.div>
  );
}

// ============================================================
// SUBCATEGORIES TAB
// ============================================================

function SubcategoriesTab() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SubCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<SubCategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: { name: '', slug: '', image: '', categoryId: '', order: 0, active: true },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, cats] = await Promise.all([
        fetchAPI<SubCategory[]>(
          filterCategory !== 'all'
            ? `/api/subcategories?all=true&categoryId=${filterCategory}`
            : '/api/subcategories?all=true'
        ),
        fetchAPI<Category[]>('/api/categories?all=true'),
      ]);
      setSubcategories(subs);
      setAllCategories(cats);
    } catch {
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const watchedName = form.watch('name');

  useEffect(() => {
    if (!editTarget && watchedName) {
      form.setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, editTarget, form]);

  const handleAdd = () => {
    setEditTarget(null);
    form.reset({ name: '', slug: '', image: '', categoryId: filterCategory !== 'all' ? filterCategory : '', order: 0, active: true });
    setDialogOpen(true);
  };

  const handleEdit = (sub: SubCategory) => {
    setEditTarget(sub);
    form.reset({
      name: sub.name,
      slug: sub.slug,
      image: sub.image,
      categoryId: sub.categoryId,
      order: sub.order,
      active: sub.active,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (sub: SubCategory) => {
    setDeleteTarget(sub);
    setDeleteOpen(true);
  };

  const onSubmit = async (data: SubCategoryFormData) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await fetchAPI('/api/subcategories', {
          method: 'PUT',
          body: JSON.stringify({ id: editTarget.id, ...data }),
        });
        toast.success('Subcategory updated successfully');
      } else {
        await fetchAPI('/api/subcategories', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast.success('Subcategory created successfully');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchAPI(`/api/subcategories?id=${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Subcategory deleted successfully');
      setDeleteOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Subcategories</h2>
          <p className="text-sm text-muted-foreground">{subcategories.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAdd}
            className="text-white"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subcategory
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : subcategories.length === 0 ? (
            <EmptyState message="No subcategories found. Add your first subcategory!" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Image</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Slug</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-center">Order</TableHead>
                    <TableHead className="text-xs text-center">Active</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                            <Layers className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{sub.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sub.slug}</TableCell>
                      <TableCell className="text-sm">{sub.category?.name || '-'}</TableCell>
                      <TableCell className="text-center text-sm">{sub.order}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={sub.active ? 'default' : 'secondary'}
                          className={
                            sub.active
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : ''
                          }
                        >
                          {sub.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(sub)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(sub)}
                            className="h-8 w-8 p-0 text-[#ff6161] hover:text-[#ff6161]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Subcategory' : 'Add Subcategory'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sub-name">Name</Label>
              <Input id="sub-name" placeholder="Subcategory name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-[#ff6161]">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-slug">Slug</Label>
              <Input id="sub-slug" placeholder="subcategory-slug" {...form.register('slug')} />
              {form.formState.errors.slug && (
                <p className="text-xs text-[#ff6161]">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-image">Image URL</Label>
              <Input id="sub-image" placeholder="https://example.com/image.jpg" {...form.register('image')} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.watch('categoryId')}
                onValueChange={(val) => form.setValue('categoryId', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-xs text-[#ff6161]">{form.formState.errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-order">Order</Label>
              <Input id="sub-order" type="number" placeholder="0" {...form.register('order')} />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch('active')}
                onCheckedChange={(checked) => form.setValue('active', checked)}
              />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="text-white"
                style={{ backgroundColor: PRIMARY_BLUE }}
              >
                {submitting ? 'Saving...' : editTarget ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Subcategory"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove it from any products.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </motion.div>
  );
}

// ============================================================
// PRODUCTS TAB
// ============================================================

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSubcategory, setFilterSubcategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', slug: '', description: '', brand: '', seller: '',
      price: 0, mrp: 0, inStock: true, isFeatured: false, isDealOfDay: false,
      imagesText: '', categoryId: '', subCategoryId: '', featuresText: '',
      rating: 4, reviewCount: 0,
    },
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/products?all=true&page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filterCategory !== 'all') url += `&categoryId=${filterCategory}`;
      if (filterSubcategory !== 'all') url += `&subCategoryId=${filterSubcategory}`;
      const data = await fetchAPI<ProductsResponse>(url);
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterSubcategory, page]);

  const fetchFilters = useCallback(async () => {
    try {
      const [cats, subs] = await Promise.all([
        fetchAPI<Category[]>('/api/categories?all=true'),
        fetchAPI<SubCategory[]>('/api/subcategories?all=true'),
      ]);
      setAllCategories(cats);
      setAllSubcategories(subs);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredSubcategories = useMemo(() => {
    if (filterCategory === 'all') return allSubcategories;
    return allSubcategories.filter((s) => s.categoryId === filterCategory);
  }, [filterCategory, allSubcategories]);

  const formSubcategories = useMemo(() => {
    const catId = form.watch('categoryId');
    if (!catId) return allSubcategories;
    return allSubcategories.filter((s) => s.categoryId === catId);
  }, [form.watch('categoryId'), allSubcategories]);

  const watchedName = form.watch('name');

  useEffect(() => {
    if (!editTarget && watchedName) {
      form.setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, editTarget, form]);

  const discountCalc = useMemo(() => {
    const mrp = form.watch('mrp');
    const price = form.watch('price');
    if (mrp > 0 && price > 0) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  }, [form.watch('mrp'), form.watch('price')]);

  const handleAdd = () => {
    setEditTarget(null);
    form.reset({
      name: '', slug: '', description: '', brand: '', seller: '',
      price: 0, mrp: 0, inStock: true, isFeatured: false, isDealOfDay: false,
      imagesText: '', categoryId: '', subCategoryId: '', featuresText: '',
      rating: 4, reviewCount: 0,
    });
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditTarget(product);
    const images = parseJSON<string[]>(product.images, []);
    const features = parseJSON<string[]>(product.features, []);
    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      seller: product.seller,
      price: product.price,
      mrp: product.mrp,
      inStock: product.inStock,
      isFeatured: product.isFeatured,
      isDealOfDay: product.isDealOfDay,
      imagesText: images.join('\n'),
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId || '',
      featuresText: features.join('\n'),
      rating: product.rating,
      reviewCount: product.reviewCount,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteTarget(product);
    setDeleteOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const images = data.imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const features = data.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        brand: data.brand,
        seller: data.seller,
        price: data.price,
        mrp: data.mrp,
        inStock: data.inStock,
        isFeatured: data.isFeatured,
        isDealOfDay: data.isDealOfDay,
        images,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId || null,
        features,
        rating: data.rating,
        reviewCount: data.reviewCount,
      };

      if (editTarget) {
        await fetchAPI('/api/products', {
          method: 'PUT',
          body: JSON.stringify({ id: editTarget.id, ...payload }),
        });
        toast.success('Product updated successfully');
      } else {
        await fetchAPI('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Product created successfully');
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchAPI(`/api/products?id=${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Product deleted successfully');
      setDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleFilterChange = (type: 'category' | 'subcategory', value: string) => {
    if (type === 'category') {
      setFilterCategory(value);
      setFilterSubcategory('all');
    } else {
      setFilterSubcategory(value);
    }
    setPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <Button
          onClick={handleAdd}
          className="text-white"
          style={{ backgroundColor: PRIMARY_BLUE }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </form>
            <Select value={filterCategory} onValueChange={(v) => handleFilterChange('category', v)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSubcategory} onValueChange={(v) => handleFilterChange('subcategory', v)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcategories</SelectItem>
                {filteredSubcategories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={8} cols={8} />
          ) : products.length === 0 ? (
            <EmptyState message="No products found. Add your first product!" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Image</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-right">Price</TableHead>
                    <TableHead className="text-xs text-right">MRP</TableHead>
                    <TableHead className="text-xs text-center">Discount</TableHead>
                    <TableHead className="text-xs text-center">Stock</TableHead>
                    <TableHead className="text-xs text-center">Featured</TableHead>
                    <TableHead className="text-xs text-center">Deal</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const imgs = parseJSON<string[]>(p.images, []);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          {imgs[0] ? (
                            <img src={imgs[0]} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[180px] font-medium text-sm">
                          <span className="line-clamp-2">{p.name}</span>
                        </TableCell>
                        <TableCell className="text-sm">{p.category?.name || '-'}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatCurrency(p.price)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground line-through">
                          {formatCurrency(p.mrp)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium" style={{ color: GREEN_SUCCESS }}>
                            {p.discount}% off
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={p.inStock ? 'default' : 'secondary'}
                            className={p.inStock ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                          >
                            {p.inStock ? 'In Stock' : 'Out'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {p.isFeatured && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Featured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.isDealOfDay && (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                              Deal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(p)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(p)}
                              className="h-8 w-8 p-0 text-[#ff6161] hover:text-[#ff6161]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} products)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-8 w-8 p-0"
                  style={pageNum === page ? { backgroundColor: PRIMARY_BLUE, color: 'white' } : {}}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing" className="flex-1">Pricing</TabsTrigger>
                <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-name">Name</Label>
                  <Input id="prod-name" placeholder="Product name" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-[#ff6161]">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-slug">Slug</Label>
                  <Input id="prod-slug" placeholder="product-slug" {...form.register('slug')} />
                  {form.formState.errors.slug && (
                    <p className="text-xs text-[#ff6161]">{form.formState.errors.slug.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-desc">Description</Label>
                  <Textarea
                    id="prod-desc"
                    placeholder="Product description..."
                    rows={3}
                    {...form.register('description')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prod-brand">Brand</Label>
                    <Input id="prod-brand" placeholder="Brand name" {...form.register('brand')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-seller">Seller</Label>
                    <Input id="prod-seller" placeholder="Seller name" {...form.register('seller')} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prod-price">Selling Price (₹)</Label>
                    <Input
                      id="prod-price"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...form.register('price')}
                    />
                    {form.formState.errors.price && (
                      <p className="text-xs text-[#ff6161]">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-mrp">MRP (₹)</Label>
                    <Input
                      id="prod-mrp"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...form.register('mrp')}
                    />
                    {form.formState.errors.mrp && (
                      <p className="text-xs text-[#ff6161]">{form.formState.errors.mrp.message}</p>
                    )}
                  </div>
                </div>
                {discountCalc > 0 && (
                  <p className="text-sm" style={{ color: GREEN_SUCCESS }}>
                    Calculated Discount: {discountCalc}% off
                  </p>
                )}
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>In Stock</Label>
                      <p className="text-xs text-muted-foreground">Product is available for purchase</p>
                    </div>
                    <Switch
                      checked={form.watch('inStock')}
                      onCheckedChange={(checked) => form.setValue('inStock', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Featured Product</Label>
                      <p className="text-xs text-muted-foreground">Show in featured section</p>
                    </div>
                    <Switch
                      checked={form.watch('isFeatured')}
                      onCheckedChange={(checked) => form.setValue('isFeatured', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Deal of the Day</Label>
                      <p className="text-xs text-muted-foreground">Mark as deal of the day</p>
                    </div>
                    <Switch
                      checked={form.watch('isDealOfDay')}
                      onCheckedChange={(checked) => form.setValue('isDealOfDay', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-images">Images</Label>
                  <p className="text-xs text-muted-foreground">Enter one image URL per line</p>
                  <Textarea
                    id="prod-images"
                    placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
                    rows={6}
                    {...form.register('imagesText')}
                  />
                </div>
                {form.watch('imagesText') && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preview</p>
                    <div className="flex flex-wrap gap-2">
                      {form
                        .watch('imagesText')
                        .split('\n')
                        .filter((s) => s.trim())
                        .map((url, i) => (
                          <img
                            key={i}
                            src={url.trim()}
                            alt={`Preview ${i + 1}`}
                            className="h-16 w-16 rounded-md border object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.watch('categoryId')}
                    onValueChange={(val) => {
                      form.setValue('categoryId', val);
                      form.setValue('subCategoryId', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-xs text-[#ff6161]">{form.formState.errors.categoryId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select
                    value={form.watch('subCategoryId') || ''}
                    onValueChange={(val) => form.setValue('subCategoryId', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {formSubcategories.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-features">Features</Label>
                  <p className="text-xs text-muted-foreground">Enter one feature per line</p>
                  <Textarea
                    id="prod-features"
                    placeholder={"Feature 1\nFeature 2\nFeature 3"}
                    rows={4}
                    {...form.register('featuresText')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prod-rating">Rating (1-5)</Label>
                    <Input
                      id="prod-rating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="4.0"
                      {...form.register('rating')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-reviews">Review Count</Label>
                    <Input
                      id="prod-reviews"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...form.register('reviewCount')}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="text-white"
                style={{ backgroundColor: PRIMARY_BLUE }}
              >
                {submitting ? 'Saving...' : editTarget ? 'Update Product' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </motion.div>
  );
}

// ============================================================
// BANNERS TAB
// ============================================================

function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: '', subtitle: '', image: '', link: '', order: 0, active: true },
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAPI<Banner[]>('/api/banners');
      setBanners(data);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleAdd = () => {
    setEditTarget(null);
    form.reset({ title: '', subtitle: '', image: '', link: '', order: 0, active: true });
    setDialogOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditTarget(banner);
    form.reset({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      link: banner.link,
      order: banner.order,
      active: banner.active,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (banner: Banner) => {
    setDeleteTarget(banner);
    setDeleteOpen(true);
  };

  const onSubmit = async (data: BannerFormData) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await fetchAPI('/api/banners', {
          method: 'PUT',
          body: JSON.stringify({ id: editTarget.id, ...data }),
        });
        toast.success('Banner updated successfully');
      } else {
        await fetchAPI('/api/banners', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast.success('Banner created successfully');
      }
      setDialogOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchAPI(`/api/banners?id=${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Banner deleted successfully');
      setDeleteOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Banners</h2>
          <p className="text-sm text-muted-foreground">{banners.length} total</p>
        </div>
        <Button
          onClick={handleAdd}
          className="text-white"
          style={{ backgroundColor: PRIMARY_BLUE }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : banners.length === 0 ? (
            <EmptyState message="No banners found. Add your first banner!" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Image</TableHead>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Subtitle</TableHead>
                    <TableHead className="text-xs">Link</TableHead>
                    <TableHead className="text-xs text-center">Order</TableHead>
                    <TableHead className="text-xs text-center">Active</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="h-10 w-20 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-20 items-center justify-center rounded-md bg-gray-100">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{banner.title}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                        {banner.subtitle || '-'}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-sm text-muted-foreground">
                        {banner.link || '-'}
                      </TableCell>
                      <TableCell className="text-center text-sm">{banner.order}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={banner.active ? 'default' : 'secondary'}
                          className={
                            banner.active
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : ''
                          }
                        >
                          {banner.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(banner)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(banner)}
                            className="h-8 w-8 p-0 text-[#ff6161] hover:text-[#ff6161]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="banner-title">Title</Label>
              <Input id="banner-title" placeholder="Banner title" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-xs text-[#ff6161]">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-subtitle">Subtitle</Label>
              <Input id="banner-subtitle" placeholder="Banner subtitle" {...form.register('subtitle')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-image">Image URL</Label>
              <Input id="banner-image" placeholder="https://example.com/banner.jpg" {...form.register('image')} />
            </div>
            {form.watch('image') && (
              <img
                src={form.watch('image')}
                alt="Preview"
                className="w-full rounded-md border object-cover"
                style={{ maxHeight: 120 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="space-y-2">
              <Label htmlFor="banner-link">Link</Label>
              <Input id="banner-link" placeholder="https://example.com" {...form.register('link')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-order">Order</Label>
              <Input id="banner-order" type="number" placeholder="0" {...form.register('order')} />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch('active')}
                onCheckedChange={(checked) => form.setValue('active', checked)}
              />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="text-white"
                style={{ backgroundColor: PRIMARY_BLUE }}
              >
                {submitting ? 'Saving...' : editTarget ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Banner"
        description={`Are you sure you want to delete banner "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </motion.div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================

function SidebarContent({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: PRIMARY_BLUE }}>
          <Store className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white">Flipkart Admin</h1>
          <p className="text-xs text-gray-400">Management Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
              style={isActive ? { backgroundColor: PRIMARY_BLUE } : {}}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Back to Store */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={() => {
            window.location.href = '/';
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Store
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN ADMIN PANEL
// ============================================================

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  }, []);

  const tabTitle = NAV_ITEMS.find((item) => item.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Desktop Sidebar */}
      <aside
        className="hidden w-64 shrink-0 flex-col md:flex"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0" style={{ backgroundColor: SIDEBAR_BG }}>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4 md:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">{tabTitle}</h2>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
            {activeTab === 'categories' && <CategoriesTab key="categories" />}
            {activeTab === 'subcategories' && <SubcategoriesTab key="subcategories" />}
            {activeTab === 'products' && <ProductsTab key="products" />}
            {activeTab === 'banners' && <BannersTab key="banners" />}
          </AnimatePresence>
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
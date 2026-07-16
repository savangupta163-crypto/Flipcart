import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [categoryCount, subCategoryCount, productCount, bannerCount, cartCount, priceAgg, featuredCount] = await Promise.all([
      db.category.count(),
      db.subCategory.count(),
      db.product.count(),
      db.banner.count(),
      db.cartItem.count(),
      db.product.aggregate({ _avg: { price: true }, _sum: { price: true } }),
      db.product.count({ where: { isFeatured: true } }),
    ]);

    const categoryProducts = await db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });

    const recentProducts = await db.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    return NextResponse.json({
      categoryCount,
      subCategoryCount,
      productCount,
      bannerCount,
      cartCount,
      featuredCount,
      avgPrice: priceAgg._avg.price || 0,
      totalValue: priceAgg._sum.price || 0,
      categoryProducts,
      recentProducts,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
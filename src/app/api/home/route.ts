import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // 👈 Add this line

export async function GET() {
  try {
    const [banners, categories, featuredProducts, dealProducts] = await Promise.all([
      db.banner.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.category.findMany({ where: { active: true }, orderBy: { order: 'asc' }, include: { subcategories: { where: { active: true }, orderBy: { order: 'asc' } } } }),
      db.product.findMany({ where: { isFeatured: true, inStock: true }, take: 20, orderBy: { createdAt: 'desc' }, include: { category: true } }),
      db.product.findMany({ where: { isDealOfDay: true, inStock: true }, take: 20, orderBy: { createdAt: 'desc' }, include: { category: true } }),
    ]);

    // Group featured products by category
    const categoryProducts: Record<string, { category: string; slug: string; products: typeof featuredProducts }> = {};
    for (const product of featuredProducts) {
      const catName = product.category.name;
      if (!categoryProducts[catName]) {
        categoryProducts[catName] = { category: catName, slug: product.category.slug, products: [] };
      }
      categoryProducts[catName].products.push(product);
    }

    return NextResponse.json({
      banners,
      categories,
      featuredByCategory: Object.values(categoryProducts),
      dealOfTheDay: dealProducts,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch home data' }, { status: 500 });
  }
}
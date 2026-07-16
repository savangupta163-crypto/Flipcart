import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const deals = searchParams.get('deals');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const all = searchParams.get('all') === 'true';
    const where: Record<string, unknown> = all ? {} : { inStock: true };

    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (search) where.name = { contains: search };
    if (featured === 'true') where.isFeatured = true;
    if (deals === 'true') where.isDealOfDay = true;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true, subCategory: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, price, mrp, images, categoryId, subCategoryId, features, rating, reviewCount, inStock, isFeatured, isDealOfDay, brand, seller } = body;

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: 'Name, slug, price, and categoryId are required' }, { status: 400 });
    }

    const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        mrp: parseFloat(mrp) || parseFloat(price),
        discount,
        images: JSON.stringify(images || []),
        categoryId,
        subCategoryId: subCategoryId || null,
        features: JSON.stringify(features || []),
        rating: rating || 4.0,
        reviewCount: reviewCount || 0,
        inStock: inStock ?? true,
        isFeatured: isFeatured ?? false,
        isDealOfDay: isDealOfDay ?? false,
        brand: brand || '',
        seller: seller || '',
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, description, price, mrp, images, categoryId, subCategoryId, features, rating, reviewCount, inStock, isFeatured, isDealOfDay, brand, seller } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (price !== undefined) {
      data.price = parseFloat(price);
      if (mrp) {
        data.mrp = parseFloat(mrp);
        data.discount = Math.round(((parseFloat(mrp) - parseFloat(price)) / parseFloat(mrp)) * 100);
      }
    }
    if (images !== undefined) data.images = JSON.stringify(images);
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (subCategoryId !== undefined) data.subCategoryId = subCategoryId || null;
    if (features !== undefined) data.features = JSON.stringify(features);
    if (rating !== undefined) data.rating = rating;
    if (reviewCount !== undefined) data.reviewCount = reviewCount;
    if (inStock !== undefined) data.inStock = inStock;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (isDealOfDay !== undefined) data.isDealOfDay = isDealOfDay;
    if (brand !== undefined) data.brand = brand;
    if (seller !== undefined) data.seller = seller;

    const product = await db.product.update({
      where: { id },
      data,
    });
    return NextResponse.json(product);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
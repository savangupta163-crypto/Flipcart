import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // 👈 Add this line

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const all = searchParams.get('all') === 'true';
    const where = categoryId
      ? (all ? { categoryId } : { categoryId, active: true })
      : (all ? {} : { active: true });

    const subcategories = await db.subCategory.findMany({
      where,
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(subcategories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, image, categoryId, order, active } = body;

    if (!name || !slug || !categoryId) {
      return NextResponse.json({ error: 'Name, slug, and categoryId are required' }, { status: 400 });
    }

    const subcategory = await db.subCategory.create({
      data: { name, slug, image: image || '', categoryId, order: order ?? 0, active: active ?? true },
    });
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create subcategory';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, image, categoryId, order, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const subcategory = await db.subCategory.update({
      where: { id },
      data: { name, slug, image, categoryId, order, active },
    });
    return NextResponse.json(subcategory);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update subcategory';
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

    await db.subCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete subcategory';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // 👈 Add this line

export async function GET() {
  try {
    const banners = await db.banner.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, image, link, order, active } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const banner = await db.banner.create({
      data: { title, subtitle: subtitle || '', image: image || '', link: link || '', order: order ?? 0, active: active ?? true },
    });
    return NextResponse.json(banner, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create banner';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, subtitle, image, link, order, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const banner = await db.banner.update({
      where: { id },
      data: { title, subtitle, image, link, order, active },
    });
    return NextResponse.json(banner);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update banner';
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

    await db.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete banner';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
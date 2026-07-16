import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ items: [], total: 0, subtotal: 0 }, { status: 200 });
    }

    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalMrp = cartItems.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);

    return NextResponse.json({ items: cartItems, total: cartItems.length, subtotal, totalMrp, savings: totalMrp - subtotal });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, productId, quantity } = body;

    if (!sessionId || !productId) {
      return NextResponse.json({ error: 'sessionId and productId are required' }, { status: 400 });
    }

    const existing = await db.cartItem.findFirst({ where: { sessionId, productId } });

    if (existing) {
      const updated = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: (existing.quantity || 1) + (quantity || 1) },
        include: { product: true },
      });
      return NextResponse.json(updated);
    }

    const cartItem = await db.cartItem.create({
      data: { sessionId, productId, quantity: quantity || 1 },
      include: { product: true },
    });
    return NextResponse.json(cartItem, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to add to cart';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, quantity } = body;

    if (!id || quantity === undefined) {
      return NextResponse.json({ error: 'ID and quantity are required' }, { status: 400 });
    }

    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    const cartItem = await db.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });
    return NextResponse.json(cartItem);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update cart item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      await db.cartItem.deleteMany({ where: { sessionId } });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID or sessionId is required' }, { status: 400 });
    }

    await db.cartItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to remove from cart';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
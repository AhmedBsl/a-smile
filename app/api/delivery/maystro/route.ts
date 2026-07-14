import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, shipment } = body;

    if (!token) {
      return NextResponse.json({ error: 'Missing Maystro API token' }, { status: 400 });
    }

    const { customerName, customerPhone, customerEmail, wilaya, commune, address, notes, items, codAmount } = shipment;

    const response = await fetch('https://api.maystro.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        full_name: customerName,
        phone: customerPhone,
        email: customerEmail || '',
        wilaya: wilaya,
        commune: commune,
        address: address,
        comment: notes || '',
        total: codAmount,
        type: 'cash_on_delivery',
        products: items.map((item: { name: string; quantity: number; price: number }) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json({
        success: false,
        error: data.message || data.error || `Maystro API error: ${response.status}`,
        raw: data,
      });
    }

    return NextResponse.json({
      success: true,
      trackingNumber: data.tracking || data.order_id || data.id,
      raw: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Maystro shipment',
    });
  }
}

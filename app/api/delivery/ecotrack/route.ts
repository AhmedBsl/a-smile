import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, shipment } = body;

    if (!token) {
      return NextResponse.json({ error: 'Missing Ecotrack API token' }, { status: 400 });
    }

    const { customerName, customerPhone, customerEmail, wilaya, commune, address, notes, items, codAmount } = shipment;

    const response = await fetch('https://api.ecotrack.dz/v1/shipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipient_name: customerName,
        recipient_phone: customerPhone,
        recipient_email: customerEmail || '',
        destination_wilaya: wilaya,
        destination_commune: commune,
        destination_address: address,
        notes: notes || '',
        cod_amount: codAmount,
        delivery_type: 'home',
        items: items.map((item: { name: string; quantity: number; price: number }) => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json({
        success: false,
        error: data.message || data.error || `Ecotrack API error: ${response.status}`,
        raw: data,
      });
    }

    return NextResponse.json({
      success: true,
      trackingNumber: data.tracking_number || data.reference || data.id,
      raw: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Ecotrack shipment',
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, token, shipment } = body;

    if (!apiKey || !token) {
      return NextResponse.json({ error: 'Missing Yalidine API key or token' }, { status: 400 });
    }

    const { customerName, customerPhone, customerEmail, wilaya, commune, address, notes, items, codAmount } = shipment;

    const response = await fetch('https://api.yalidine.app/v1/parcel/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        product_code: 1,
        cod: codAmount,
        price: codAmount,
        destination_name: customerName,
        destination_phone: customerPhone,
        destination_email: customerEmail || '',
        destination_address: `${address}, ${commune}, ${wilaya}`,
        wilaya_code: wilaya,
        commune: commune,
        note: notes || '',
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json({
        success: false,
        error: data.message || data.error || `Yalidine API error: ${response.status}`,
        raw: data,
      });
    }

    return NextResponse.json({
      success: true,
      trackingNumber: data.id_traking || data.tracking || data.id,
      raw: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Yalidine shipment',
    });
  }
}

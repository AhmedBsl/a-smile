import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiId, token, shipment } = body;

    if (!apiId || !token) {
      return NextResponse.json({ error: 'Missing ZR Express API ID or token' }, { status: 400 });
    }

    const { customerName, customerPhone, customerEmail, wilaya, commune, address, notes, items, codAmount } = shipment;

    const response = await fetch('https://api.zr-express.com/api/v1/colis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Api-Id': apiId,
      },
      body: JSON.stringify({
        client_name: customerName,
        client_phone: customerPhone,
        client_email: customerEmail || '',
        wilaya: wilaya,
        commune: commune,
        adresse: address,
        note: notes || '',
        montant: codAmount,
        type_livraison: 'domicile',
        produits: items.map((item: { name: string; quantity: number; price: number }) => ({
          nom: item.name,
          quantite: item.quantity,
          prix: item.price,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json({
        success: false,
        error: data.message || data.error || `ZR Express API error: ${response.status}`,
        raw: data,
      });
    }

    return NextResponse.json({
      success: true,
      trackingNumber: data.tracking || data.numero || data.id,
      raw: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ZR Express shipment',
    });
  }
}

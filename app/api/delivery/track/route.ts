import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carrier, trackingNumber, credentials } = body;

    if (!carrier || !trackingNumber) {
      return NextResponse.json({ error: 'Missing carrier or tracking number' }, { status: 400 });
    }

    let trackingData: { status: string; statusLabel: string; events: { date: string; status: string; location?: string; details?: string }[] } | null = null;

    switch (carrier) {
      case 'yalidine': {
        if (!credentials?.apiKey || !credentials?.token) {
          return NextResponse.json({ error: 'Missing Yalidine credentials' }, { status: 400 });
        }
        const res = await fetch(`https://api.yalidine.app/v1/parcel/id_traking/${trackingNumber}/`, {
          headers: {
            'Authorization': `Token ${credentials.token}`,
            'X-Api-Key': credentials.apiKey,
          },
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          return NextResponse.json({ error: data.message || data.error || 'Yalidine tracking failed' });
        }
        trackingData = {
          status: mapYalidineStatus(data.etat),
          statusLabel: data.etat || 'Unknown',
          events: (data.historique || []).map((e: { date: string; etat: string; localisation?: string }) => ({
            date: e.date,
            status: e.etat,
            location: e.localisation,
          })),
        };
        break;
      }

      case 'zr-express': {
        if (!credentials?.apiId || !credentials?.token) {
          return NextResponse.json({ error: 'Missing ZR Express credentials' }, { status: 400 });
        }
        const res = await fetch(`https://api.zr-express.com/api/v1/colis/${trackingNumber}`, {
          headers: {
            'Authorization': `Bearer ${credentials.token}`,
            'X-Api-Id': credentials.apiId,
          },
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          return NextResponse.json({ error: data.message || data.error || 'ZR Express tracking failed' });
        }
        trackingData = {
          status: mapZRStatus(data.statut),
          statusLabel: data.statut || 'Unknown',
          events: (data.suivi || []).map((e: { date: string; statut: string; lieu?: string }) => ({
            date: e.date,
            status: e.statut,
            location: e.lieu,
          })),
        };
        break;
      }

      case 'ecotrack': {
        if (!credentials?.token) {
          return NextResponse.json({ error: 'Missing Ecotrack credentials' }, { status: 400 });
        }
        const res = await fetch(`https://api.ecotrack.dz/v1/shipments/${trackingNumber}/track`, {
          headers: {
            'Authorization': `Bearer ${credentials.token}`,
          },
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          return NextResponse.json({ error: data.message || data.error || 'Ecotrack tracking failed' });
        }
        trackingData = {
          status: mapEcotrackStatus(data.status),
          statusLabel: data.status || 'Unknown',
          events: (data.history || []).map((e: { date: string; status: string; location?: string; description?: string }) => ({
            date: e.date,
            status: e.status,
            location: e.location,
            details: e.description,
          })),
        };
        break;
      }

      case 'maystro': {
        if (!credentials?.token) {
          return NextResponse.json({ error: 'Missing Maystro credentials' }, { status: 400 });
        }
        const res = await fetch(`https://api.maystro.com/v1/orders/${trackingNumber}/status`, {
          headers: {
            'Authorization': `Bearer ${credentials.token}`,
          },
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          return NextResponse.json({ error: data.message || data.error || 'Maystro tracking failed' });
        }
        trackingData = {
          status: mapMaystroStatus(data.state),
          statusLabel: data.state || 'Unknown',
          events: (data.statuses || []).map((e: { created_at: string; state: string; location?: string; description?: string }) => ({
            date: e.created_at,
            status: e.state,
            location: e.location,
            details: e.description,
          })),
        };
        break;
      }

      default:
        return NextResponse.json({ error: `Unsupported carrier: ${carrier}` }, { status: 400 });
    }

    return NextResponse.json({
      carrier,
      trackingNumber,
      ...trackingData,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Tracking request failed',
    });
  }
}

function mapYalidineStatus(status: string): 'pending' | 'in-transit' | 'delivered' | 'returned' | 'unknown' {
  const s = (status || '').toLowerCase();
  if (s.includes('livré') || s.includes('delivered')) return 'delivered';
  if (s.includes('transit') || s.includes('route') || s.includes('expédi')) return 'in-transit';
  if (s.includes('retour') || s.includes('return')) return 'returned';
  if (s.includes('en attente') || s.includes('pending') || s.includes('créé')) return 'pending';
  return 'unknown';
}

function mapZRStatus(status: string): 'pending' | 'in-transit' | 'delivered' | 'returned' | 'unknown' {
  const s = (status || '').toLowerCase();
  if (s.includes('livré') || s.includes('delivered')) return 'delivered';
  if (s.includes('transit') || s.includes('en route')) return 'in-transit';
  if (s.includes('retour') || s.includes('return')) return 'returned';
  if (s.includes('en attente') || s.includes('enregistré')) return 'pending';
  return 'unknown';
}

function mapEcotrackStatus(status: string): 'pending' | 'in-transit' | 'delivered' | 'returned' | 'unknown' {
  const s = (status || '').toLowerCase();
  if (s.includes('delivered') || s.includes('completed')) return 'delivered';
  if (s.includes('transit') || s.includes('dispatched') || s.includes('picked')) return 'in-transit';
  if (s.includes('return') || s.includes('failed')) return 'returned';
  if (s.includes('pending') || s.includes('created') || s.includes('registered')) return 'pending';
  return 'unknown';
}

function mapMaystroStatus(status: string): 'pending' | 'in-transit' | 'delivered' | 'returned' | 'unknown' {
  const s = (status || '').toLowerCase();
  if (s.includes('livré') || s.includes('delivered')) return 'delivered';
  if (s.includes('transit') || s.includes('en route') || s.includes('expédié')) return 'in-transit';
  if (s.includes('retour') || s.includes('return') || s.includes('annulé')) return 'returned';
  if (s.includes('en attente') || s.includes('enregistré') || s.includes('crée')) return 'pending';
  return 'unknown';
}

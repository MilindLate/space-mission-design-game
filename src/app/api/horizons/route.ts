import { NextRequest, NextResponse } from 'next/server';

interface HorizonsApiResponse {
  result: string;
  signature?: {
    version: string;
    source: string;
  };
}

interface PositionResponse {
  body: string;
  jd: number;
  position: { x: number; y: number; z: number };
  velocity: { vx: number; vy: number; vz: number };
  unit: string;
}

interface ErrorResponse {
  error: string;
  fallback: boolean;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<PositionResponse | ErrorResponse>> {
  const { searchParams } = new URL(request.url);
  const command = searchParams.get('command');
  const startTime = searchParams.get('startTime');
  const stopTime = searchParams.get('stopTime');

  if (!command || !startTime || !stopTime) {
    return NextResponse.json(
      { error: 'Missing required query params: command, startTime, stopTime', fallback: true },
      { status: 200 }
    );
  }

  try {
    const params = new URLSearchParams({
      format: 'json',
      COMMAND: command,
      OBJ_DATA: 'NO',
      MAKE_EPHEM: 'YES',
      EPHEM_TYPE: 'VECTORS',
      CENTER: '@sun',
      START_TIME: startTime,
      STOP_TIME: stopTime,
      STEP_SIZE: '1d',
      OUT_UNITS: 'AU-D',
      CSV_FORMAT: 'YES',
    });

    const horizonsUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`;

    const response = await fetch(horizonsUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `JPL Horizons API returned status ${response.status}`, fallback: true },
        { status: 200 }
      );
    }

    const data = (await response.json()) as HorizonsApiResponse;

    if (!data.result) {
      return NextResponse.json(
        { error: 'No result field in JPL Horizons response', fallback: true },
        { status: 200 }
      );
    }

    // Extract the ephemeris data between $$SOE and $$EOE markers
    const soeIndex = data.result.indexOf('$$SOE');
    const eoeIndex = data.result.indexOf('$$EOE');

    if (soeIndex === -1 || eoeIndex === -1) {
      return NextResponse.json(
        { error: 'Could not find $$SOE/$$EOE markers in Horizons result', fallback: true },
        { status: 200 }
      );
    }

    const ephemerisBlock = data.result.slice(soeIndex + '$$SOE'.length, eoeIndex).trim();
    const lines = ephemerisBlock.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'No ephemeris data rows found between $$SOE and $$EOE', fallback: true },
        { status: 200 }
      );
    }

    // First CSV row: jd, calendar_date, x, y, z, vx, vy, vz, ...
    const fields = lines[0].split(',').map((f) => f.trim());

    if (fields.length < 8) {
      return NextResponse.json(
        { error: `Expected ≥8 CSV fields, got ${fields.length}: "${lines[0]}"`, fallback: true },
        { status: 200 }
      );
    }

    const jd = parseFloat(fields[0]);
    // fields[1] is calendar date string (skipped)
    const x = parseFloat(fields[2]);
    const y = parseFloat(fields[3]);
    const z = parseFloat(fields[4]);
    const vx = parseFloat(fields[5]);
    const vy = parseFloat(fields[6]);
    const vz = parseFloat(fields[7]);

    if ([jd, x, y, z, vx, vy, vz].some(isNaN)) {
      return NextResponse.json(
        { error: `Failed to parse numeric fields from row: "${lines[0]}"`, fallback: true },
        { status: 200 }
      );
    }

    return NextResponse.json({
      body: command,
      jd,
      position: { x, y, z },
      velocity: { vx, vy, vz },
      unit: 'AU',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Unexpected error: ${message}`, fallback: true },
      { status: 200 }
    );
  }
}

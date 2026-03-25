import { NextRequest, NextResponse } from "next/server";
import { calculateBirthChart } from "@/lib/astrology";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute, latitude, longitude, utcOffset } = body;

    if (!year || !month || !day) {
      return NextResponse.json(
        { error: "Yıl, ay ve gün bilgileri gereklidir." },
        { status: 400 }
      );
    }

    const birthChart = calculateBirthChart(
      Number(year),
      Number(month),
      Number(day),
      Number(hour) ?? 12,
      Number(minute) ?? 0,
      Number(latitude) || 39.9334,
      Number(longitude) || 32.8597,
      Number(utcOffset) ?? 3
    );

    return NextResponse.json({
      success: true,
      data: birthChart
    });
  } catch {
    return NextResponse.json(
      { error: "Hesaplama yapılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

import { appendWish, listWishes } from "@/lib/google/wishes";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const wishes = await listWishes();
    return NextResponse.json({ wishes });
  } catch (error) {
    console.error("[wishes:get]", error);
    return NextResponse.json(
      { error: "Could not load wishes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      guestName?: string;
      wishText?: string;
    };

    const guestName = body.guestName?.trim() ?? "";
    const wishText = body.wishText?.trim() ?? "";

    if (!guestName || !wishText) {
      return NextResponse.json(
        { error: "Name and wish are required" },
        { status: 400 },
      );
    }

    const wish = await appendWish({
      guestName: guestName.slice(0, 80),
      wishText: wishText.slice(0, 600),
    });

    return NextResponse.json({ wish }, { status: 201 });
  } catch (error) {
    console.error("[wishes:post]", error);
    return NextResponse.json(
      { error: "Could not save wish" },
      { status: 500 },
    );
  }
}

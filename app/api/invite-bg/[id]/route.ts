import { getInviteById } from "@/lib/google/guests";
import { downloadDriveImage, extractDriveFileId } from "@/lib/google/drive-image";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface InviteBackgroundRouteProps {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: InviteBackgroundRouteProps,
) {
  const invite = await getInviteById(params.id);
  if (!invite?.bgUrl) {
    return NextResponse.json({ error: "Background not found" }, { status: 404 });
  }

  const fileId = extractDriveFileId(invite.bgUrl);
  if (!fileId) {
    return NextResponse.json(
      { error: "Invalid Google Drive image URL" },
      { status: 422 },
    );
  }

  const image = await downloadDriveImage(fileId);

  return new NextResponse(image.buffer, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}

import { getInviteById } from "@/lib/google/guests";
import {
  downloadDriveImage,
  downloadPublicDriveImage,
  extractDriveFileId,
} from "@/lib/google/drive-image";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const IMAGE_CACHE_CONTROL = "public, max-age=300, stale-while-revalidate=3600";

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

  try {
    const image = await downloadDriveImage(fileId);

    return new NextResponse(image.buffer, {
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": IMAGE_CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error("[invite-bg] Drive API download failed", {
      inviteId: params.id,
      fileId,
      error,
    });

    try {
      const image = await downloadPublicDriveImage(fileId);

      return new NextResponse(image.buffer, {
        headers: {
          "Content-Type": image.mimeType,
          "Cache-Control": IMAGE_CACHE_CONTROL,
        },
      });
    } catch (fallbackError) {
      console.error("[invite-bg] Public Drive download failed", {
        inviteId: params.id,
        fileId,
        fallbackError,
      });

      return NextResponse.json(
        { error: "Could not load invite background" },
        { status: 502 },
      );
    }
  }
}

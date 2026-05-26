import { getGoogleDriveFolderId } from "@/lib/google/auth";
import { getDriveAuthClient } from "@/lib/google/drive-client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 1024 * 1024 * 1024;
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];

function sanitizeFileName(fileName: string) {
  const cleanName = fileName
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();

  return cleanName || "wedding-media";
}

function isAllowedMimeType(mimeType: string) {
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
  } | null;

  const fileName = sanitizeFileName(String(body?.fileName ?? ""));
  const mimeType = String(body?.mimeType ?? "").trim();
  const fileSize = Number(body?.fileSize ?? 0);

  if (!fileName || !mimeType || !Number.isFinite(fileSize)) {
    return NextResponse.json({ error: "Invalid upload metadata" }, { status: 400 });
  }

  if (!isAllowedMimeType(mimeType)) {
    return NextResponse.json(
      { error: "Only image and video files are allowed" },
      { status: 415 },
    );
  }

  if (fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File is too large or empty" },
      { status: 413 },
    );
  }

  const auth = getDriveAuthClient();
  const authHeaders = await auth.getRequestHeaders();
  const datedName = `${new Date().toISOString().replace(/[:.]/g, "-")} ${fileName}`;

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        ...Object.fromEntries(
          Object.entries(authHeaders).map(([key, value]) => [key, String(value)]),
        ),
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(fileSize),
      },
      body: JSON.stringify({
        name: datedName,
        parents: [getGoogleDriveFolderId()],
        mimeType,
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: "Failed to create upload session", message },
      { status: 502 },
    );
  }

  const uploadUrl = response.headers.get("location");
  if (!uploadUrl) {
    return NextResponse.json(
      { error: "Google Drive did not return upload URL" },
      { status: 502 },
    );
  }

  return NextResponse.json({ uploadUrl });
}

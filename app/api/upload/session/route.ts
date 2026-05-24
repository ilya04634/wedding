/**
 * POST /api/upload/session
 * Создаёт resumable upload session в Google Drive и возвращает Upload URL клиенту.
 * Реализация: Шаг 4.
 *
 * Тело запроса (план): { fileName: string; mimeType: string; fileSize: number }
 * Ответ (план): { uploadUrl: string }
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Шаг 4" },
    { status: 501 },
  );
}

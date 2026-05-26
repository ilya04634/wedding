"use client";

import { Button } from "@/components/ui/button";
import { UploadFileItem } from "@/components/upload/upload-file-item";
import { cn } from "@/lib/utils";
import { Camera, ImagePlus, Upload } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";

export type UploadFileStatus = "pending" | "uploading" | "done" | "error";

export interface UploadFileState {
  id: string;
  file: File;
  progress: number;
  status: UploadFileStatus;
  error?: string;
}

const ACCEPT = "image/*,video/*";

function createFileId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function uploadFileToDrive(
  file: File,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const sessionResponse = await fetch("/api/upload/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
        }),
      });

      const session = (await sessionResponse.json().catch(() => null)) as
        | { uploadUrl?: string; error?: string; message?: string }
        | null;

      if (!sessionResponse.ok || !session?.uploadUrl) {
        reject(
          new Error(
            session?.error ||
              session?.message ||
              "Не удалось подготовить загрузку",
          ),
        );
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", session.uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve();
          return;
        }

        reject(new Error(`Google Drive вернул ошибку ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error("Сеть прервала загрузку"));
      xhr.send(file);
    } catch (error) {
      reject(error);
    }
  });
}

export function UploadZone() {
  const inputId = useId();
  const cameraInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFileState[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/"),
    );

    setFiles((prev) => {
      const existing = new Set(prev.map((item) => item.id));
      const next = [...prev];
      for (const file of list) {
        const id = createFileId(file);
        if (!existing.has(id)) {
          next.push({ id, file, progress: 0, status: "pending" });
        }
      }
      return next;
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const updateFile = useCallback((id: string, patch: Partial<UploadFileState>) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...patch } : file)),
    );
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files.length) {
        addFiles(event.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const startUpload = useCallback(async () => {
    const pending = files.filter(
      (file) => file.status === "pending" || file.status === "error",
    );
    if (!pending.length) return;

    for (const item of pending) {
      updateFile(item.id, {
        status: "uploading",
        progress: 0,
        error: undefined,
      });

      try {
        await uploadFileToDrive(item.file, (progress) =>
          updateFile(item.id, { progress }),
        );
        updateFile(item.id, { status: "done", progress: 100 });
      } catch (error) {
        updateFile(item.id, {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Не удалось загрузить файл",
        });
      }
    }
  }, [files, updateFile]);

  const hasUploadable = files.some(
    (file) => file.status === "pending" || file.status === "error",
  );
  const isUploading = files.some((file) => file.status === "uploading");

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          isDragging
            ? "border-neutral-900 bg-neutral-50"
            : "border-neutral-300 bg-neutral-50/50 hover:border-neutral-400 hover:bg-neutral-50",
        )}
      >
        <ImagePlus className="mb-3 h-10 w-10 text-neutral-400" aria-hidden />
        <p className="text-sm font-medium text-neutral-800">
          Перетащите файлы сюда
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          или выберите фото и видео из галереи
        </p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <input
        ref={cameraInputRef}
        id={cameraInputId}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" aria-hidden />
          Снять
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
        >
          Выбрать
        </Button>
        <Button
          type="button"
          disabled={!hasUploadable || isUploading}
          onClick={startUpload}
        >
          <Upload className="mr-2 h-4 w-4" aria-hidden />
          {isUploading ? "Загрузка..." : "Загрузить"}
        </Button>
      </div>

      {files.length > 0 ? (
        <ul className="space-y-3" aria-live="polite">
          {files.map((file) => (
            <UploadFileItem
              key={file.id}
              file={file}
              onRemove={removeFile}
            />
          ))}
        </ul>
      ) : null}

      <p className="text-center text-xs text-neutral-500">
        Файлы загружаются напрямую в Google Drive. Большие видео могут
        загружаться несколько минут.
      </p>
    </div>
  );
}

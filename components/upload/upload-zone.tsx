"use client";

import { Button } from "@/components/ui/button";
import { UploadFileItem } from "@/components/upload/upload-file-item";
import { cn } from "@/lib/utils";
import { ImagePlus, Upload } from "lucide-react";
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

export function UploadZone() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFileState[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );

    setFiles((prev) => {
      const existing = new Set(prev.map((p) => p.id));
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
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  /** Демо-прогресс на Шаге 2; на Шаге 4 — реальная загрузка в Google Drive */
  const startDemoUpload = useCallback(async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (!pending.length) return;

    await Promise.all(
      pending.map(async (item) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "uploading", progress: 0 } : f,
          ),
        );

        for (let p = 0; p <= 100; p += 10) {
          await new Promise((r) => setTimeout(r, 120));
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, progress: p } : f,
            ),
          );
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "done", progress: 100 } : f,
          ),
        );
      }),
    );
  }, [files]);

  const hasPending = files.some((f) => f.status === "pending");
  const isUploading = files.some((f) => f.status === "uploading");

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
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
          или нажмите, чтобы выбрать фото и видео
        </p>
        <p className="mt-3 text-xs text-neutral-400">
          На телефоне откроется галерея или камера
        </p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          className="sm:flex-1"
          onClick={() => inputRef.current?.click()}
        >
          Выбрать файлы
        </Button>
        <Button
          type="button"
          className="sm:flex-1"
          disabled={!hasPending || isUploading}
          onClick={startDemoUpload}
        >
          <Upload className="mr-2 h-4 w-4" aria-hidden />
          {isUploading ? "Загрузка…" : "Загрузить (демо)"}
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
        На Шаге 4 файлы будут загружаться напрямую в Google Drive (resumable
        upload), без лимита Vercel 4.5 MB.
      </p>
    </div>
  );
}

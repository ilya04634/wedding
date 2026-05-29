"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadFileItem } from "@/components/upload/upload-file-item";
import { cn } from "@/lib/utils";
import { ImagePlus, Images, Upload } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";

export type UploadFileStatus = "pending" | "uploading" | "done" | "error";

export interface UploadFileState {
  id: string;
  file: File;
  progress: number;
  status: UploadFileStatus;
  caption: string;
  error?: string;
  stage?: string;
}

const ACCEPT = "image/*,video/*";

function createFileId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function parseGoogleUploadError(xhr: XMLHttpRequest) {
  if (!xhr.responseText) return `Не удалось завершить загрузку. Код ошибки: ${xhr.status}`;

  try {
    const data = JSON.parse(xhr.responseText) as {
      error?: { message?: string };
    };
    return data.error?.message || `Не удалось завершить загрузку. Код ошибки: ${xhr.status}`;
  } catch {
    return `Не удалось завершить загрузку. Код ошибки: ${xhr.status}`;
  }
}

function uploadFileToDrive(
  file: File,
  uploaderName: string,
  uploadNote: string,
  onProgress: (progress: number) => void,
  onStage: (stage: string) => void,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let lastProgress = 0;
    const setProgress = (progress: number) => {
      lastProgress = Math.max(lastProgress, progress);
      onProgress(lastProgress);
    };

    try {
      onStage("Подготавливаем файл");
      const sessionResponse = await fetch("/api/upload/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          uploaderName,
          uploadNote,
        }),
      });

      const session = (await sessionResponse.json().catch(() => null)) as
        | { uploadUrl?: string; error?: string; message?: string }
        | null;

      if (!sessionResponse.ok || !session?.uploadUrl) {
        reject(
          new Error("Не удалось начать загрузку. Попробуйте еще раз"),
        );
        return;
      }

      onStage("Загружаем файл");
      setProgress(1);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", session.uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.timeout = 30 * 60 * 1000;

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        setProgress(Math.round((event.loaded / event.total) * 100));
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onStage("Готово");
          setProgress(100);
          resolve();
          return;
        }

        reject(new Error(parseGoogleUploadError(xhr)));
      };

      xhr.onerror = () => {
        if (lastProgress >= 100) {
          onStage("Готово");
          resolve();
          return;
        }

        reject(new Error("Загрузка прервалась. Попробуйте еще раз"));
      };
      xhr.ontimeout = () =>
        reject(new Error("Загрузка заняла слишком много времени. Попробуйте еще раз"));
      xhr.send(file);
    } catch (error) {
      reject(error);
    }
  });
}

export function UploadZone() {
  const inputId = useId();
  const uploaderNameId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFileState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploaderName, setUploaderName] = useState("");

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
          next.push({ id, file, caption: "", progress: 0, status: "pending" });
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
        stage: "В очереди",
      });

      try {
        await uploadFileToDrive(
          item.file,
          uploaderName.trim(),
          item.caption.trim(),
          (progress) => updateFile(item.id, { progress }),
          (stage) => updateFile(item.id, { stage }),
        );
        updateFile(item.id, { status: "done", progress: 100 });
      } catch (error) {
        updateFile(item.id, {
          status: "error",
          stage: "Не удалось загрузить",
          error:
            error instanceof Error
              ? error.message
              : "Не удалось загрузить файл",
        });
      }
    }
  }, [files, updateFile, uploaderName]);

  const hasUploadable = files.some(
    (file) => file.status === "pending" || file.status === "error",
  );
  const isUploading = files.some((file) => file.status === "uploading");

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-4 border-y border-[#3f8059]/30 bg-transparent py-5">
        <div className="space-y-2">
          <Label htmlFor={uploaderNameId}>Ваше имя</Label>
          <Input
            id={uploaderNameId}
            value={uploaderName}
            onChange={(event) => setUploaderName(event.target.value)}
            placeholder="Например: Иван"
            maxLength={80}
          />
        </div>
        <p className="text-xs text-[#24340d]/60">
          Необязательно. Название для каждого файла можно будет указать после выбора.
        </p>
      </div>

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
          "flex cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-9 text-center transition-colors sm:px-6 sm:py-12",
          isDragging
            ? "border-[#3f8059] bg-white/55"
            : "border-[#3f8059]/45 bg-white/20 hover:border-[#3f8059]/70 hover:bg-white/40",
        )}
      >
        <ImagePlus className="mb-3 h-10 w-10 text-[#3f8059]" aria-hidden />
        <p className="font-display text-sm font-medium uppercase tracking-[0.08em] text-[#24340d]">
          Перетащите файлы сюда
        </p>
        <p className="mt-1 text-xs text-[#24340d]/60">
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

      <div className="flex justify-center">
        <Button
          type="button"
          variant="secondary"
          className="w-full border-[#3f8059]/40 bg-transparent font-display uppercase tracking-[0.08em] text-[#24340d] hover:bg-white/45 sm:w-auto"
          onClick={() => inputRef.current?.click()}
        >
          <Images className="mr-2 h-4 w-4" aria-hidden />
          Добавить фото/видео
        </Button>
      </div>

      {files.length > 0 ? (
        <div className="space-y-4">
          <ul className="space-y-3" aria-live="polite">
            {files.map((file) => (
              <UploadFileItem
                key={file.id}
                file={file}
                onCaptionChange={(caption) => updateFile(file.id, { caption })}
                onRemove={removeFile}
              />
            ))}
          </ul>
          <Button
            type="button"
            className="w-full bg-[#3f8059] font-display uppercase tracking-[0.08em] text-[#fbf3d9] hover:bg-[#326a49]"
            disabled={!hasUploadable || isUploading}
            onClick={startUpload}
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden />
            {isUploading ? "Загружаем..." : "Загрузить файлы"}
          </Button>
        </div>
      ) : null}

      <p className="text-center text-xs text-[#24340d]/60">
        После выбора подпишите файлы, если хотите, и нажмите загрузку. Большие видео
        могут загружаться несколько минут.
      </p>
    </div>
  );
}


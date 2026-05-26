import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/utils";
import { FileImage, FileVideo, X } from "lucide-react";
import type { UploadFileState } from "./upload-zone";

interface UploadFileItemProps {
  file: UploadFileState;
  onCaptionChange: (caption: string) => void;
  onRemove: (id: string) => void;
}

export function UploadFileItem({
  file,
  onCaptionChange,
  onRemove,
}: UploadFileItemProps) {
  const isVideo = file.file.type.startsWith("video/");
  const Icon = isVideo ? FileVideo : FileImage;
  const canEditCaption = file.status === "pending" || file.status === "error";

  const statusLabel =
    file.status === "pending"
      ? "Ожидание"
      : file.status === "uploading"
        ? "Загрузка…"
        : file.status === "done"
          ? "Готово"
          : "Ошибка";

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {file.file.name}
              </p>
              <p className="text-xs text-neutral-500">
                {formatFileSize(file.file.size)} · {statusLabel}
              </p>
              {file.stage ? (
                <p className="mt-1 text-xs text-neutral-500">{file.stage}</p>
              ) : null}
            </div>
            {file.status === "pending" || file.status === "error" ? (
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label={`Удалить ${file.file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <Input
            className="mt-3"
            value={file.caption}
            onChange={(event) => onCaptionChange(event.target.value)}
            disabled={!canEditCaption}
            maxLength={120}
            aria-label={`Название или комментарий для ${file.file.name}`}
            placeholder="Название или комментарий: первый танец, церемония..."
          />
          <Progress
            className="mt-3"
            value={file.progress}
            label={file.status === "uploading" ? "Прогресс" : undefined}
          />
          {file.error ? (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {file.error}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

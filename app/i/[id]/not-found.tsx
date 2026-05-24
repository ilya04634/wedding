import Link from "next/link";

export default function InviteNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-medium text-neutral-900">
        Приглашение не найдено
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Проверьте ссылку или обратитесь к организаторам.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-neutral-900 underline"
      >
        На главную
      </Link>
    </main>
  );
}

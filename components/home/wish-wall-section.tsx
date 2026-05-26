import { MessageCircleHeart } from "lucide-react";

export function WishWallSection() {
  return (
    <section className="px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#f4d03f]/35 bg-[#fff9db]/55 p-8 text-center shadow-[0_20px_70px_rgba(52,49,45,0.06)] backdrop-blur-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-[#8a9a7a] shadow-sm">
          <MessageCircleHeart className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#8a9a7a]">
          Wish wall
        </p>
        <h2 className="font-display mt-3 text-4xl text-[#34312d] sm:text-5xl">
          Стена пожеланий
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#746f66]">
          Здесь позже появится формат пожеланий от гостей. Обсудим с ведущим и
          включим механику ближе к празднику.
        </p>
      </div>
    </section>
  );
}

import { FlowerLineArt } from "@/components/home/line-art";

export function DressCodeSection() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-14 sm:px-8 sm:py-20">
      <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.22),_rgba(231,151,150,0)_72%)]" />
      <div className="mx-auto grid max-w-5xl items-center gap-7 rounded-3xl border border-[#8a9a7a]/15 bg-white/55 px-5 py-8 shadow-[0_18px_55px_rgba(52,49,45,0.06)] backdrop-blur-sm sm:gap-10 sm:rounded-[2rem] sm:px-10 sm:py-10 md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex justify-center">
          <FlowerLineArt className="h-40 w-full max-w-56 text-[#8a9a7a] sm:h-56 sm:max-w-72" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#e79796] sm:text-xs sm:tracking-[0.24em]">
            Dress code
          </p>
          <h2 className="font-display mt-3 text-3xl leading-tight text-[#34312d] sm:text-5xl">
            Без строгих цветов
          </h2>
          <p className="mt-5 text-balance text-xl leading-snug text-[#34312d] sm:text-3xl">
            Приходите красивые и счастливые 🤗
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#746f66]">
            Главное настроение дня - легкость, улыбки и ощущение летнего сада.
          </p>
        </div>
      </div>
    </section>
  );
}

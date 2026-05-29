import Image from "next/image";

function MiniFlower({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 34" fill="none" aria-hidden>
      <path
        d="M14 28 C22 17 33 17 42 28 C50 18 62 18 70 28 C78 17 90 17 98 28"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {[20, 42, 64, 86].map((x) => (
        <path
          key={x}
          d={`M${x} 19 C${x - 6} 10 ${x + 6} 10 ${x} 19 Z M${x} 19 C${x - 7} 24 ${x - 8} 14 ${x} 19 Z M${x} 19 C${x + 7} 24 ${x + 8} 14 ${x} 19 Z`}
          stroke="currentColor"
          strokeWidth="0.9"
        />
      ))}
    </svg>
  );
}

export function DressCodeSection() {
  return (
    <section className="wedding-paper relative isolate overflow-hidden px-4 py-20 sm:px-8 sm:py-24">
      <Image
        src="/wedding-design/wildflowers-corner.png"
        alt=""
        width={675}
        height={900}
        className="pointer-events-none absolute -left-20 top-24 z-0 w-36 opacity-30 mix-blend-multiply sm:-left-8 sm:top-0 sm:w-64 sm:opacity-85"
      />
      <Image
        src="/wedding-design/wildflowers-stem.png"
        alt=""
        width={600}
        height={900}
        className="pointer-events-none absolute -right-14 bottom-0 z-0 w-32 opacity-35 mix-blend-multiply sm:-right-8 sm:w-56 sm:opacity-85"
      />
      <div className="relative z-10 mx-auto max-w-md text-[#24340d]">
        <div className="text-center">
          <h2 className="font-display text-4xl uppercase tracking-[0.08em] sm:text-5xl">
            Дресс-код
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2 text-[#3f8059]">
            <span className="h-px w-12 bg-[#3f8059]/70" />
            <span className="font-script text-4xl leading-none sm:text-5xl">
              dress-code
            </span>
          </div>
        </div>

        <div className="mx-auto mt-9 max-w-[18rem] text-left">
          <p className="font-display text-lg uppercase leading-5 tracking-[0.04em]">
            Без строгих цветов приходите красивые и счастливые
          </p>
          <p className="mt-5 text-xl leading-7 text-[#3f8059]">
            Главное настроение дня - легкость, улыбки и ощущение летнего сада.
          </p>
          <div className="mt-4 flex justify-center text-[#24340d]">
            <MiniFlower className="h-9 w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}

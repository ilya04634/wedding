import Image from "next/image";

function MiniFlower({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 34" fill="none" aria-hidden>
      <path
        d="M14 28 C22 17 33 17 42 28 C50 18 62 18 70 28 C78 17 90 17 98 28"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
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
    <section className="wedding-paper relative isolate overflow-hidden px-6 py-20 text-[#050500] sm:px-8 sm:py-24">
      <Image
        src="/wedding-design/figma-dress-corner-flower.png"
        alt=""
        width={768}
        height={1024}
        className="pointer-events-none absolute -left-12 -top-12 z-0 w-48 opacity-95 mix-blend-multiply sm:left-[18%] sm:top-0 sm:w-64"
      />

      <div className="relative z-10 mx-auto max-w-sm text-left sm:max-w-md">
        <header className="pt-8 text-center">
          <h2 className="font-display text-[2.35rem] uppercase leading-none tracking-[0.08em] sm:text-5xl">
            Дресс-код
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2 text-[#397c57]">
            <span className="h-px w-16 bg-[#397c57]/75" />
            <span className="font-script text-[3.2rem] leading-none sm:text-6xl">
              dress-code
            </span>
          </div>
        </header>

        <div className="mx-auto mt-10 max-w-[17rem] sm:max-w-sm">
          <p className="font-display text-[1.35rem] uppercase leading-[1.12] tracking-[0.04em] sm:text-3xl">
            Без строгих цветов приходите красивые и счастливые
          </p>
          <p className="mt-5 font-display text-[1.25rem] leading-[1.35] tracking-[0.02em] text-[#397c57] sm:text-2xl">
            Главное настроение дня - легкость, улыбки и ощущение летнего сада.
          </p>
        </div>

        <div className="mt-14 flex justify-center text-[#050500]">
          <MiniFlower className="h-10 w-32" />
        </div>
      </div>
    </section>
  );
}

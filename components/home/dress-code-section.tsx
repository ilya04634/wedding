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
    <section className="wedding-paper relative isolate overflow-hidden px-4 py-16 sm:px-8 sm:py-24">
      <Image
        src="/wedding-design/wildflowers-corner.png"
        alt=""
        width={675}
        height={900}
        className="pointer-events-none absolute -left-8 top-0 w-48 opacity-85 mix-blend-multiply sm:w-64"
      />
      <Image
        src="/wedding-design/wildflowers-stem.png"
        alt=""
        width={600}
        height={900}
        className="pointer-events-none absolute -right-8 bottom-0 w-40 opacity-85 mix-blend-multiply sm:w-56"
      />
      <div className="mx-auto max-w-md text-[#24340d]">
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

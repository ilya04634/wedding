interface LineArtProps {
  className?: string;
}

export function FlowerLineArt({ className }: LineArtProps) {
  return (
    <svg
      viewBox="0 0 260 220"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M127 206C127 159 128 128 130 91M130 91C104 60 96 33 112 20C126 8 147 25 130 91ZM130 91C156 59 183 49 193 67C203 86 174 112 130 91ZM130 91C105 104 75 99 75 78C75 57 112 61 130 91ZM130 91C126 66 146 39 165 43C185 48 169 83 130 91ZM130 91C158 98 181 124 166 139C151 154 123 128 130 91ZM130 91C101 123 73 136 61 120C48 103 87 84 130 91Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RingsLineArt({ className }: LineArtProps) {
  return (
    <svg
      viewBox="0 0 240 90"
      fill="none"
      className={className}
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 45H68C78 45 83 37 87 31" />
        <path d="M86 31C99 10 138 13 168 36C191 54 194 77 176 82C153 88 113 65 91 45C84 39 82 35 86 31Z" />
        <path d="M92 37C111 26 145 31 169 48C185 60 186 74 174 77C154 82 120 64 99 47" />
        <path d="M166 38C184 22 211 27 224 47C239 70 224 94 199 99C175 104 154 89 152 67C151 54 157 45 166 38Z" />
        <path d="M166 52C181 38 203 41 214 55C228 72 213 91 194 91C174 91 159 78 160 64C161 58 163 54 166 52Z" />
        <path d="M153 68C158 57 169 50 180 48" />
        <path d="M218 46C225 45 231 45 236 45" />
      </g>
    </svg>
  );
}

export function ChampagneLineArt({ className }: LineArtProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <path
        d="M36 16C31 36 32 50 43 59C51 66 63 58 60 45L52 16H36ZM84 16C89 36 88 50 77 59C69 66 57 58 60 45L68 16H84ZM50 60V94M70 60V94M39 94H61M59 94H81M35 34C43 37 51 36 57 32M85 34C77 37 69 36 63 32"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArchLineArt({ className }: LineArtProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <path
        d="M24 98V58C24 34 40 18 60 18C80 18 96 34 96 58V98M37 98V59C37 42 47 31 60 31C73 31 83 42 83 59V98M17 98H103M35 45C25 44 17 37 14 28M85 45C95 44 103 37 106 28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CakeLineArt({ className }: LineArtProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <path
        d="M34 98H86C93 98 98 93 98 86V74H22V86C22 93 27 98 34 98ZM32 74V59C32 54 36 50 41 50H79C84 50 88 54 88 59V74M46 50V38C46 30 52 24 60 24C68 24 74 30 74 38V50M23 82C33 88 43 78 53 84C63 90 73 79 86 84"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

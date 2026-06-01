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
      viewBox="0 0 340 150"
      fill="none"
      className={className}
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 76H86C101 76 110 64 114 49C123 16 163 8 201 27C226 39 245 59 258 78C266 60 282 46 302 47C325 48 338 76 329 103C318 136 278 152 241 135C213 122 201 96 210 75C218 57 237 62 258 78" />
        <path d="M116 47C137 -4 230 19 258 78C273 109 251 134 211 122C178 112 137 93 119 69C114 62 113 54 116 47Z" />
        <path d="M105 66C126 41 174 40 214 63C242 79 259 101 249 116C236 137 184 113 151 90C128 74 110 71 105 66Z" />
        <path d="M254 64C273 37 309 39 322 64C337 94 316 133 280 139C245 144 218 122 219 91C219 71 234 58 254 64Z" />
        <path d="M238 100C251 78 281 55 301 67C323 81 310 120 275 129C248 136 226 125 219 105" />
        <path d="M258 78C276 71 296 70 312 78H337" />
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

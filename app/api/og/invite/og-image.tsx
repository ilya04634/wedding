import { ImageResponse } from "next/og";

interface InviteOgImageOptions {
  inviteName: string;
}

export function renderInviteOgImage({ inviteName }: InviteOgImageOptions) {
  const title = `Приглашаем ${inviteName}`;
  const titleSize = inviteName.length > 30 ? 58 : inviteName.length > 18 ? 66 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 14% 18%, rgba(244,208,63,0.22), transparent 26%), radial-gradient(circle at 84% 22%, rgba(138,154,122,0.2), transparent 28%), radial-gradient(circle at 72% 88%, rgba(231,151,150,0.13), transparent 30%), linear-gradient(135deg, #fbf3d9 0%, #f6edcf 100%)",
          color: "#4f5609",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d="M-35 497C156 363 150 206 58 145C-25 90 95 5 250 64C405 123 425 228 575 141C751 39 843 52 1005 119C1129 171 1093 325 1193 406"
            stroke="#8A9A7A"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.22"
          />
          <path
            d="M104 117C141 88 178 100 194 134C159 144 132 137 104 117Z"
            stroke="#8A9A7A"
            strokeWidth="5"
            opacity="0.85"
          />
          <path
            d="M1010 80C1046 51 1080 62 1097 94C1064 103 1038 98 1010 80Z"
            stroke="#E79796"
            strokeWidth="5"
            opacity="0.82"
          />
          <path
            d="M978 528C1012 502 1040 519 1051 548C1023 552 1000 544 978 528Z"
            stroke="#8A9A7A"
            strokeWidth="5"
            opacity="0.72"
          />
        </svg>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 54,
            justifyContent: "center",
            padding: "54px 78px",
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              width: 430,
            }}
          >
            <div
              style={{
                color: "#8a9a7a",
                fontFamily: "serif",
                fontSize: 30,
                letterSpacing: 8,
                textTransform: "uppercase",
              }}
            >
              личное письмо
            </div>

            <svg
              width="430"
              height="300"
              viewBox="0 0 430 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 24px 32px rgba(79,86,9,0.16))" }}
            >
              <rect x="46" y="34" width="338" height="192" rx="22" fill="#FFFBF1" />
              <rect
                x="18"
                y="82"
                width="394"
                height="184"
                rx="24"
                fill="#F1E4BE"
                stroke="#C9C591"
                strokeWidth="2"
              />
              <path d="M19 91L215 190L411 91" fill="#FBF3D9" opacity="0.94" />
              <path d="M18 83L215 190L412 83" stroke="#C9C591" strokeWidth="2" />
              <path d="M18 266L164 152" stroke="#C9C591" strokeWidth="2" />
              <path d="M412 266L266 152" stroke="#C9C591" strokeWidth="2" />
              <path d="M18 266L215 164L412 266" fill="#EBDCAB" opacity="0.88" />
              <circle cx="215" cy="151" r="40" fill="#78820D" />
              <circle cx="215" cy="151" r="32" stroke="#FBF3D9" strokeWidth="2" opacity="0.58" />
              <path
                d="M199 164C203 145 216 136 232 141C221 147 214 155 211 169M204 157C212 159 223 156 230 149"
                stroke="#FBF3D9"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 590,
            }}
          >
            <div
              style={{
                color: "#8a9a7a",
                fontFamily: "serif",
                fontSize: 38,
                fontStyle: "italic",
                lineHeight: 1,
              }}
            >
              Илья и Дарья
            </div>
            <div
              style={{
                color: "#4f5609",
                fontFamily: "serif",
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 0.98,
              }}
            >
              {title}
            </div>
            <div
              style={{
                color: "#6f765f",
                fontFamily: "serif",
                fontSize: 38,
                lineHeight: 1.12,
              }}
            >
              на летнюю свадьбу
            </div>
          </div>
        </div>
      </div>
    ),
    {
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      },
      width: 1200,
      height: 630,
    },
  );
}

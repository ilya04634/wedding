import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { toAccusativeInviteName } from "@/lib/invite/russian-accusative";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawName = searchParams.get("name")?.trim();
  const shouldDecline = searchParams.get("decline") !== "0";
  const inviteName = rawName
    ? shouldDecline
      ? toAccusativeInviteName(rawName)
      : rawName
    : "дорогих гостей";
  const title = `Приглашаем ${inviteName}`;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 18% 12%, rgba(244,208,63,0.24), transparent 25%), radial-gradient(circle at 82% 18%, rgba(138,154,122,0.22), transparent 28%), radial-gradient(circle at 76% 84%, rgba(231,151,150,0.14), transparent 30%), linear-gradient(135deg, #fbf3d9 0%, #f6edcf 100%)",
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
          height="1200"
          viewBox="0 0 1200 1200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d="M92 900C278 705 262 503 158 413C54 323 168 176 337 248C477 308 510 450 665 348C848 228 889 101 1040 204C1181 300 1048 521 1112 660C1176 800 1052 948 926 885"
            stroke="#8A9A7A"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.24"
          />
          <path
            d="M220 290C255 265 283 279 294 308C265 312 242 305 220 290Z"
            stroke="#8A9A7A"
            strokeWidth="5"
          />
          <path
            d="M940 180C976 151 1010 162 1027 194C994 203 968 198 940 180Z"
            stroke="#E79796"
            strokeWidth="5"
          />
          <path
            d="M954 912C988 886 1016 903 1027 932C999 936 976 928 954 912Z"
            stroke="#8A9A7A"
            strokeWidth="5"
          />
        </svg>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            paddingTop: 78,
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#8a9a7a",
              fontFamily: "serif",
              fontSize: 48,
              lineHeight: 1,
            }}
          >
            персональная ссылка
          </div>

          <div
            style={{
              display: "flex",
              height: 390,
              position: "relative",
              width: 690,
            }}
          >
            <div
              style={{
                background: "rgba(79,86,9,0.18)",
                borderRadius: 32,
                filter: "blur(24px)",
                height: 280,
                left: 0,
                position: "absolute",
                top: 112,
                width: 690,
              }}
            />
            <div
              style={{
                background: "#fffaf0",
                border: "2px solid rgba(138,154,122,0.28)",
                borderRadius: 30,
                height: 255,
                left: 58,
                position: "absolute",
                top: 42,
                width: 574,
              }}
            />
            <div
              style={{
                background: "linear-gradient(180deg, #f7edc7 0%, #efe2b5 100%)",
                border: "2px solid rgba(138,154,122,0.28)",
                borderRadius: 34,
                display: "flex",
                height: 280,
                left: 0,
                overflow: "hidden",
                position: "absolute",
                top: 110,
                width: 690,
              }}
            >
              <div
                style={{
                  borderBottom: "140px solid transparent",
                  borderLeft: "345px solid rgba(251,243,217,0.88)",
                  borderTop: "140px solid transparent",
                  height: 0,
                  left: 0,
                  position: "absolute",
                  top: 0,
                  width: 0,
                }}
              />
              <div
                style={{
                  borderBottom: "140px solid transparent",
                  borderRight: "345px solid rgba(251,243,217,0.88)",
                  borderTop: "140px solid transparent",
                  height: 0,
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: 0,
                }}
              />
              <div
                style={{
                  borderBottom: "142px solid rgba(241,226,180,0.95)",
                  borderLeft: "345px solid transparent",
                  borderRight: "345px solid transparent",
                  bottom: 0,
                  height: 0,
                  position: "absolute",
                  width: 0,
                }}
              />
            </div>
            <div
              style={{
                borderBottom: "136px solid transparent",
                borderLeft: "345px solid transparent",
                borderRight: "345px solid transparent",
                borderTop: "136px solid rgba(248,239,211,0.94)",
                height: 0,
                left: 0,
                position: "absolute",
                top: 110,
                width: 0,
              }}
            />
            <div
              style={{
                alignItems: "center",
                background: "#78820d",
                border: "5px solid rgba(255,248,218,0.85)",
                borderRadius: 999,
                color: "#fff8da",
                display: "flex",
                fontFamily: "serif",
                fontSize: 70,
                height: 108,
                justifyContent: "center",
                left: 291,
                position: "absolute",
                top: 220,
                width: 108,
              }}
            >
              Д
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxWidth: 1040,
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#4f5609",
                fontFamily: "serif",
                fontSize: inviteName.length > 28 ? 74 : 92,
                lineHeight: 0.96,
              }}
            >
              {title}
            </div>
            <div
              style={{
                color: "#8a9a7a",
                fontFamily: "serif",
                fontSize: 56,
                fontStyle: "italic",
                lineHeight: 1,
              }}
            >
              Илья и Дарья
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
    },
  );
}

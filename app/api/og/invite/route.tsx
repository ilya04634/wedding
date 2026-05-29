import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawName = searchParams.get("name")?.trim();
  const inviteName = rawName || "дорогих гостей";
  const title = `Приглашение для ${inviteName}`;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 18% 12%, rgba(244,208,63,0.2), transparent 24%), radial-gradient(circle at 82% 18%, rgba(138,154,122,0.2), transparent 27%), radial-gradient(circle at 76% 84%, rgba(231,151,150,0.14), transparent 30%), linear-gradient(135deg, #fbf3d9 0%, #f6edcf 100%)",
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
            d="M80 500C236 352 239 230 159 180C68 123 195 52 320 112C439 169 470 265 610 205C789 128 772 38 919 90C1045 135 984 265 1108 330C1214 386 1085 510 1000 492"
            stroke="#8A9A7A"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.24"
          />
          <path
            d="M210 145C233 129 251 139 258 158C239 160 224 156 210 145Z"
            stroke="#8A9A7A"
            strokeWidth="3"
          />
          <path
            d="M960 118C984 99 1007 106 1018 127C996 133 979 130 960 118Z"
            stroke="#E79796"
            strokeWidth="3"
          />
          <path
            d="M1000 492C1023 475 1041 486 1048 505C1029 507 1014 502 1000 492Z"
            stroke="#8A9A7A"
            strokeWidth="3"
          />
        </svg>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            paddingTop: 28,
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#8a9a7a",
              fontFamily: "serif",
              fontSize: 34,
              lineHeight: 1,
            }}
          >
            персональная ссылка
          </div>

          <div
            style={{
              display: "flex",
              height: 310,
              position: "relative",
              width: 560,
            }}
          >
            <div
              style={{
                background: "rgba(79,86,9,0.18)",
                borderRadius: 32,
                filter: "blur(24px)",
                height: 230,
                left: 0,
                position: "absolute",
                top: 88,
                width: 560,
              }}
            />
            <div
              style={{
                background: "#fffaf0",
                border: "2px solid rgba(138,154,122,0.28)",
                borderRadius: 24,
                height: 205,
                left: 46,
                position: "absolute",
                top: 42,
                width: 468,
              }}
            />
            <div
              style={{
                background: "linear-gradient(180deg, #f7edc7 0%, #efe2b5 100%)",
                border: "2px solid rgba(138,154,122,0.28)",
                borderRadius: 28,
                display: "flex",
                height: 230,
                left: 0,
                overflow: "hidden",
                position: "absolute",
                top: 95,
                width: 560,
              }}
            >
              <div
                style={{
                  borderBottom: "115px solid transparent",
                  borderLeft: "280px solid rgba(251,243,217,0.88)",
                  borderTop: "115px solid transparent",
                  height: 0,
                  left: 0,
                  position: "absolute",
                  top: 0,
                  width: 0,
                }}
              />
              <div
                style={{
                  borderBottom: "115px solid transparent",
                  borderRight: "280px solid rgba(251,243,217,0.88)",
                  borderTop: "115px solid transparent",
                  height: 0,
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: 0,
                }}
              />
              <div
                style={{
                  borderBottom: "116px solid rgba(241,226,180,0.95)",
                  borderLeft: "280px solid transparent",
                  borderRight: "280px solid transparent",
                  bottom: 0,
                  height: 0,
                  position: "absolute",
                  width: 0,
                }}
              />
            </div>
            <div
              style={{
                borderBottom: "112px solid transparent",
                borderLeft: "280px solid transparent",
                borderRight: "280px solid transparent",
                borderTop: "112px solid rgba(248,239,211,0.94)",
                height: 0,
                left: 0,
                position: "absolute",
                top: 95,
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
                fontSize: 56,
                height: 88,
                justifyContent: "center",
                left: 236,
                position: "absolute",
                top: 180,
                width: 88,
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
                fontSize: inviteName.length > 28 ? 58 : 72,
                lineHeight: 0.95,
              }}
            >
              {title}
            </div>
            <div
              style={{
                color: "#8a9a7a",
                fontFamily: "serif",
                fontSize: 44,
                fontStyle: "italic",
                lineHeight: 1,
              }}
            >
              Дарья и Илья
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

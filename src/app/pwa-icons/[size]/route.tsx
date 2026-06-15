import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function RabbitIcon({ size }: { size: number }) {
  const s = size;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #1a3a1a 0%, #2d5a2d 60%, #3a7a3a 100%)",
        borderRadius: s * 0.22,
        position: "relative",
      }}
    >
      {/* Cercle de fond */}
      <div
        style={{
          width: s * 0.72,
          height: s * 0.72,
          borderRadius: "50%",
          background: "rgba(168, 213, 162, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `${s * 0.02}px solid rgba(168, 213, 162, 0.3)`,
        }}
      >
        {/* Oreilles du lapin */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            gap: s * 0.08,
            top: s * 0.14,
          }}
        >
          <div
            style={{
              width: s * 0.1,
              height: s * 0.22,
              background: "#a8d5a2",
              borderRadius: s * 0.06,
            }}
          />
          <div
            style={{
              width: s * 0.1,
              height: s * 0.22,
              background: "#a8d5a2",
              borderRadius: s * 0.06,
            }}
          />
        </div>
        {/* Tête du lapin */}
        <div
          style={{
            width: s * 0.28,
            height: s * 0.24,
            background: "#a8d5a2",
            borderRadius: "50%",
            marginTop: s * 0.1,
          }}
        />
      </div>
      {/* Texte CG */}
      <div
        style={{
          color: "rgba(168, 213, 162, 0.9)",
          fontSize: s * 0.13,
          fontWeight: 800,
          letterSpacing: s * 0.005,
          marginTop: s * 0.02,
        }}
      >
        CuniGestion
      </div>
    </div>
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { size: string } }
) {
  const size = parseInt(params.size) || 192;

  // Captures d'écran
  if (params.size === "screenshot-wide") {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%)",
          }}
        >
          <div style={{ color: "#a8d5a2", fontSize: 64, fontWeight: 900 }}>
            CuniGestion
          </div>
        </div>
      ),
      { width: 1280, height: 720 }
    );
  }

  if (params.size === "screenshot-narrow") {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%)",
          }}
        >
          <div style={{ color: "#a8d5a2", fontSize: 64, fontWeight: 900 }}>
            CuniGestion
          </div>
        </div>
      ),
      { width: 720, height: 1280 }
    );
  }

  return new ImageResponse(<RabbitIcon size={size} />, {
    width: size,
    height: size,
  });
}

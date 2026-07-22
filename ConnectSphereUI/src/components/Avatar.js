import React from "react";

export default function Avatar({ initials, color, background = "#ffffff", size = 40, online = false, dotColor = "#43E97B", image = null }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: image ? "#ffffff" : "f7f0f0",
        border: `2px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: size * 0.35, color,
        fontFamily: "'emoji",
        overflow: "hidden",
      }}>
        {image ? (
          <img
            src={image}
            alt={initials || "avatar"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : initials}
      </div>
      {online && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: size * 0.25, height: size * 0.25,
          borderRadius: "50%", background: dotColor,
          border: "2px solid white",
        }} />
      )}
    </div>
  );
}

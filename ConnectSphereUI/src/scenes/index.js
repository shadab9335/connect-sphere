import React from "react";

const Scene = ({ emoji, label, color }) => (
  <div style={{
    height: 90, background: `linear-gradient(135deg, ${color}22, ${color}44)`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  }}>
    <span style={{ fontSize: 36 }}>{emoji}</span>
    <span style={{ fontWeight: 800, fontSize: 16, color, fontFamily: "'Syne', sans-serif" }}>{label}</span>
  </div>
);

export const CricketScene  = () => <Scene emoji="🏏" label="Cricket"     color="#6C63FF" />;
export const MoviesScene   = () => <Scene emoji="🎬" label="Movies"      color="#FF6584" />;
export const TravelScene   = () => <Scene emoji="✈️" label="Travel"      color="#43E97B" />;
export const RunningScene  = () => <Scene emoji="🏃" label="Running"     color="#FF6584" />;
export const CyclingScene  = () => <Scene emoji="🚴" label="Cycling"     color="#38BDF8" />;
export const ChessScene    = () => <Scene emoji="♟️" label="Chess"       color="#FFB347" />;
export const GamingScene   = () => <Scene emoji="🎮" label="Gaming"      color="#6C63FF" />;

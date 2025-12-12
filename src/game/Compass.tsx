import React from "react";
import type { CompassProps, Direction } from "./types/roomTypes";

export const RoomCompass: React.FC<CompassProps> = ({ exits }) => {
  const active = new Set(exits.map((d) => d.toLowerCase()));
  const CARDINAL_POINTS = "60,22 59,60 61,60";
  const DIAGONAL_POINTS = "60,30 59,60 61,60";
  const armClass = (dir: Direction) =>
    active.has(dir) ? "compass-arm compass-arm--active" : "compass-arm";
  const labelClass = (dir: "up" | "down") =>
    active.has(dir) ? "compass-label compass-label--active" : "compass-label";

  return (
    <div className="room-compass">
      {/* Up (upper-left) */}
      <div
        className={`room-compass-label room-compass-label--u ${labelClass(
          "up"
        )}`}
      >
        <svg viewBox="0 0 10 10" className="compass-icon" aria-hidden="true">
          <polyline
            points="5,1 1,5 3,5 3,9 7,9 7,5 9,5 5,1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Down (lower-right) */}
      <div
        className={`room-compass-label room-compass-label--d ${labelClass(
          "down"
        )}`}
      >
        <svg viewBox="0 0 10 10" className="compass-icon" aria-hidden="true">
          <polyline
            points="5,9 1,5 3,5 3,1 7,1 7,5 9,5 5,9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <svg
        className="room-compass-svg"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        {/* Outer circle */}
        <circle cx="60" cy="60" r="58" className="compass-circle" />
        {/* N */}
        <text x="60" y="18" textAnchor="middle" className="compass-n-label">
          N
        </text>
        {/* Needle Shapes — each is a thin triangle */}
        {/* N */}
        <polygon
          className={armClass("north")}
          fill={"var(--crt-color)"}
          points={CARDINAL_POINTS}
        />

        {/* E */}
        <polygon
          className={armClass("east")}
          points={CARDINAL_POINTS}
          fill={"none"}
          transform="rotate(90 60 60)"
        />

        {/* S */}
        <polygon
          className={armClass("south")}
          points={CARDINAL_POINTS}
          fill={"none"}
          transform="rotate(180 60 60)"
        />

        {/* W */}
        <polygon
          className={armClass("west")}
          points={CARDINAL_POINTS}
          fill={"none"}
          transform="rotate(270 60 60)"
        />

        {/* NE (diagonal, shorter) */}
        <polygon
          className={armClass("northeast")}
          points={DIAGONAL_POINTS}
          fill={"none"}
          transform="rotate(45 60 60)"
        />

        {/* SE */}
        <polygon
          className={armClass("southeast")}
          points={DIAGONAL_POINTS}
          fill={"none"}
          transform="rotate(135 60 60)"
        />

        {/* SW */}
        <polygon
          className={armClass("southwest")}
          points={DIAGONAL_POINTS}
          fill={"none"}
          transform="rotate(225 60 60)"
        />

        {/* NW */}
        <polygon
          className={armClass("northwest")}
          points={DIAGONAL_POINTS}
          fill={"none"}
          transform="rotate(315 60 60)"
        />
      </svg>
    </div>
  );
};

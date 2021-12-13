import React from "react";
import _ from "lodash";

// const fontSize = 10;

function pts(sideCount, radius) {
  const angle = 360 / sideCount;
  const vertexIndices = range(sideCount);
  const offsetDeg = 180 - (180 - angle) / 2;
  const offset = degreesToRadians(offsetDeg);

  return vertexIndices.map((index) => {
    return {
      theta: offset + degreesToRadians(angle * index),
      r: radius
    };
  });
}

function range(count) {
  return Array.from(Array(count).keys());
}

function degreesToRadians(angleInDegrees) {
  return (Math.PI * angleInDegrees) / 180;
}

function polygon([cx, cy], sideCount, radius) {
  return pts(sideCount, radius).map(({ r, theta }) => [
    cx + r * Math.cos(theta),
    cy + r * Math.sin(theta)
  ]);
  // .join(" ");
}

function interpolate([v1, v2], ratio) {
  return v1 + (v2 - v1) * ratio;
}

export default function Lettegon({
  id,
  complete,
  sideCount,
  sideSize,
  makePolygon
}) {
  if (!makePolygon) {
    return (
      <div
        style={{
          fontWeight: 100,
          fontSize: 20,
          // width: "200px",
          letterSpacing: 4,
          fontFamily: "monospace",
          background: complete ? "yellow" : "none"
        }}
      >
        {id.replaceAll("|", " . ")}
      </div>
    );
  }

  // console.log(id)
  // thanks to https://codepen.io/winkerVSbecks/pen/wrZQQm
  const generatePolygon = () => {
    const radius = 50 + (sideCount - 2) * 10 + (sideSize - 1) * 20;

    const s = 2 * radius + 50;
    // const res = polygon([0, 0], sideCount, radius);
    const points = polygon([s / 2, s / 2], sideCount, radius);
    // console.log(points);
    return (
      <svg viewBox={`0 0 ${s} ${s}`} stroke="#111" fill="none" stroke-width="2">
        <polygon points={points} />
        {points.map(([x1, y1], vtxIdx) => {
          const letters = id.split("|")[vtxIdx].split("");
          // console.log(letters);
          const nextPtIdx = (vtxIdx + 1) % points.length;
          const [x2, y2] = points[nextPtIdx];

          return letters.map((letter, ltrIdx) => {
            if (!/[A-Z]/.test(letter)) return;
            // console.log("!!", x2,y2)
            const x = interpolate([x1, x2], (ltrIdx + 1) / (sideSize + 1));
            const y = interpolate([y1, y2], (ltrIdx + 1) / (sideSize + 1));

            // todo: determine how this gets calculated...
            const offset = 5.5;
            return (
              <>
                <circle key={"c" + letter} cx={x} cy={y} r={10} fill="white" />
                <text
                  key={letter}
                  x={x - offset}
                  y={y + offset}
                  stroke="none"
                  fill="blue"
                  strokeWidth={1}
                >
                  {letter}
                </text>
              </>
            );
          });
        })}
      </svg>
    );
  };

  return (
    <div
      style={{
        fontWeight: 100,
        // fontSize: {fontSize},
        fontSize: 18,
        // width: "200px",
        // letterSpacing: 4,
        fontFamily: "monospace",
        background: complete ? "yellow" : "none"
      }}
    >
      {generatePolygon()}
    </div>
  );
}

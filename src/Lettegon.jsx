import React from "react";
import { useInView } from "react-intersection-observer";
// import _ from "lodash";

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
  letters
}) {
  const letterCoords = {};

  const radius = 50 + (sideCount - 2) * 10 + (sideSize - 1) * 20;
  // console.log(radius);
  // console.log(id)

  // thanks to https://codepen.io/winkerVSbecks/pen/wrZQQm
  const generatePolygon = () => {
    const s = 2 * radius + 50;
    // const res = polygon([0, 0], sideCount, radius);
    const points = polygon([s / 2, s / 2], sideCount, radius);
    // console.log(points);

    const Letters = generateLetters(points);
    // get Lines AFTER Letters so letterCoord map generates
    const Lines = generateLines(points);
    return (
      <svg
        viewBox={`0 0 ${s} ${s}`}
        stroke="#111"
        fill="none"
        strokeWidth="1.8"
      >
        <polygon points={points} />
        {Lines}
        {Letters}
      </svg>
    );
  };

  const generateLetters = (points) => {
    return points.map(([x1, y1], vtxIdx) => {
      const letters = id.split("|")[vtxIdx].split("");
      // console.log(letters);
      const nextPtIdx = (vtxIdx + 1) % points.length;
      const [x2, y2] = points[nextPtIdx];

      return letters.map((letter, ltrIdx) => {
        if (!/[A-Z]/.test(letter)) return null;
        // console.log("!!", x2,y2)
        const x = interpolate([x1, x2], (ltrIdx + 1) / (sideSize + 1));
        const y = interpolate([y1, y2], (ltrIdx + 1) / (sideSize + 1));

        // todo: determine how this gets calculated...
        const offset = 5.5;
        letterCoords[letter] = { x, y };
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
    });
  };

  const generateLines = (points) => {
    const lettersArray = letters.split("");
    return lettersArray.map((letter, ltrIdx) => {
      // console.log("!", letter, ltrIdx)
      if (!/[A-Z]/.test(letter)) return null;
      if (ltrIdx === letters.length - 1) return null;

      const { x: x1, y: y1 } = letterCoords[letter];
      const nextLtr = lettersArray[ltrIdx + 1];
      const { x: x2, y: y2 } = letterCoords[nextLtr];
      // console.log("!!", x2,y2)
      // console.log("**", ltrCoords, nextCoords)
      return (
        <line
          style={{
            animationDelay: `${ltrIdx * 0.08}s`
          }}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="purple"
          strokeWidth="1.2"
        />
      );
    });
  };

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0
  });

  return (
    <div
      ref={ref}
      style={{
        display: "inline-block",
        fontWeight: 100,
        // fontSize: {fontSize},
        fontSize: 18,
        maxWidth: "600px",
        minWidth: "400px",
        margin: "auto",
        // letterSpacing: 4,
        fontFamily: "monospace",
        background: complete ? "yellow" : "none"
      }}
    >
      {inView ? (
        generatePolygon()
      ) : (
        <div
          style={{
            // pushes raw id out of view and also gives it a height
            // equal to its width (like the svgs) so scroll position
            // is accurately estimated
            paddingTop: "100%"
          }}
        >
          {/* TODO: mui spinner? */}
          {/* {id.replaceAll("|", " . ")} */}
        </div>
      )}
    </div>
  );
}

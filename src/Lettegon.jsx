import { Box, Button, Link } from "@mui/material";
import React from "react";
import { useInView } from "react-intersection-observer";
import _ from "lodash";
import { CONFIG_PARAM, SOLUTION_PARAM } from "./consts";
import { encrypter } from "./utils";

// const fontSize = 10;

function pts(sideCount, radius) {
  const angle = 360 / sideCount;
  const vertexIndices = range(sideCount);
  const offsetDeg = 180 - (180 - angle) / 2;
  const offset = degreesToRadians(offsetDeg);

  return vertexIndices.map((index) => {
    return {
      theta: offset + degreesToRadians(angle * index),
      r: radius,
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
    cy + r * Math.sin(theta),
  ]);
  // .join(" ");
}

function interpolate([v1, v2], ratio) {
  return v1 + (v2 - v1) * ratio;
}

export default function Lettegon({
  id,
  complete,
  // sideCount,
  // sideSize,
  onClickLetter = _.noop,
  letters,
  editMode,
  setSelectedLettegon = _.noop,
  solution = [],
}) {
  const sideCount = id.split("|").length;
  const sideSize = id.split("|")[0].length;

  const [config, setConfig] = React.useState(id);
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
        <polygon fill="#f0fffc" points={points} />
        {Lines}
        {Letters}
      </svg>
    );
  };

  const generateLetters = (points) => {
    return points.map(([x1, y1], vtxIdx) => {
      const letters = config.split("|")[vtxIdx].split("");
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
          <g key={letter} onClick={() => onClickLetter(letter)}>
            <circle cx={x} cy={y} r={10} fill="white" />
            <text
              x={x - offset}
              y={y + offset}
              stroke="none"
              fill="blue"
              strokeWidth={1}
            >
              {letter}
            </text>
          </g>
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
          key={"letter-" + ltrIdx}
          style={{
            animationDelay: `${ltrIdx * 0.1}s`,
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

  const getEditTools = () => {
    if (!editMode) return null;
    // console.log(config);
    const sideArray = config.split("|");
    const shuffleable = sideArray[0].length > 1;

    const shuffle = (sideIdx) => {
      let newSideArray = [...sideArray];

      if (sideIdx === null) {
        while (_.isEqual(newSideArray, sideArray)) {
          newSideArray = _.shuffle(newSideArray);
        }
        setConfig(newSideArray.join("|"));
        return;
      }

      const side = newSideArray[sideIdx];
      let newSide = side;
      while (newSide === side) {
        newSide = _.shuffle(side.split("")).join("");
      }
      newSideArray[sideIdx] = newSide;
      setConfig(newSideArray.join("|"));
    };

    return (
      <Box sx={{ m: 3, mb: 0 }}>
        Shuffle:
        <Button onClick={() => shuffle(null)}>Sides</Button>
        <Box display="flex">
          {shuffleable &&
            sideArray.map((side, i) => {
              // console.log(letters,)
              return (
                <Button key={i} onClick={() => shuffle(i)}>
                  {side}
                </Button>
              );
            })}
        </Box>
      </Box>
    );
  };

  const getShareableLink = () => {
    if (!editMode) return null;
    const sol = encrypter(solution.join(","));
    const url = `${window.location.origin}/play?${CONFIG_PARAM}=${config}&${SOLUTION_PARAM}=${sol}`;
    return (
      <Link target="_blank" rel="noreferrer" href={url}>
        click here to play this lettegon
      </Link>
    );
  };

  const handleSelect = () => {
    if (!complete || editMode) return;

    setSelectedLettegon(id);
  };

  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
  });
  // const [toRender, setToRender] = React.useState(false);
  // React.useEffect(() => {
  //   // if (inView) setToRender(inView);
  //   setTimeout(() => {
  //     setToRender(inView);
  //   }, inView ? 0 : 1000);
  // }, [inView]);

  return (
    <div
      ref={editMode ? null : ref}
      className="lettegon"
      key={config}
      onClick={handleSelect}
      style={{
        flexBasis: 350,
        flexGrow: 1,
        maxWidth: 600,
        fontWeight: 100,
        fontSize: 18,
        margin: "auto",
        fontFamily: "monospace",
        background: complete ? "rgb(255 238 184)" : "none",
      }}
    >
      {inView || editMode ? (
        <>
          {getEditTools()}
          {generatePolygon()}
          {getShareableLink()}
        </>
      ) : (
        <div
          style={{
            // pushes raw id out of view and also gives it a height
            // equal to its width (like the svgs) so scroll position
            // is accurately estimated
            paddingTop: "100%",
          }}
        >
          {/* TODO: mui spinner? */}
          {/* {id.replaceAll("|", " . ")} */}
        </div>
      )}
    </div>
  );
}

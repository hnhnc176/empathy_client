import React from "react";

export default function Curved() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <svg viewBox="0 0 800 300" className="w-[90%] max-w-4xl">
        <defs>
          <path
            id="curve"
            d="M 100,200 A 300,150 0 0,1 700,200"
            fill="transparent"
          />
        </defs>

        <text
          fill="none"
          stroke="#0f3a23"
          strokeWidth="1"
          fontSize="80"
          fontWeight="bold"
        >
          <textPath href="#curve" startOffset="0%">
            Let’s talk!
          </textPath>
        </text>

        <text
          fill="#0f3a23"
          fontSize="80"
          fontWeight="bold"
        >
          <textPath href="#curve" startOffset="0%">
            Let’s talk!
          </textPath>
        </text>
      </svg>
    </div>
  );
};


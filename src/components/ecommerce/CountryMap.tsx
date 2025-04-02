import React from "react";
import { coMill } from "@react-jvectormap/colombia";
import dynamic from "next/dynamic";

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

interface CountryMapProps {
  points: {
    latLng: [number, number];
    name: string;
  }[];
}

const CountryMap: React.FC<CountryMapProps> = ({ points }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <VectorMap
        map={coMill}
        backgroundColor="transparent"
        markers={points}
        markerStyle={{
          initial: {
            fill: "#465FFF",
            stroke: "#ffffff",
            strokeWidth: 1,
          },
        }}
        regionStyle={{
          initial: {
            fill: "#D0D5DD",
          },
          hover: {
            fill: "#465FFF",
          },
        }}
        zoomOnScroll={true}
        zoomAnimate={true}
      />
    </div>
  );
};

export default CountryMap;
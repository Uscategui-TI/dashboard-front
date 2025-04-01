import React from "react";
import { worldMill } from "@react-jvectormap/world";
import dynamic from "next/dynamic";

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

// Define the component props
interface CountryMapProps {
  points: {
    latLng: [number, number];
    name: string;
  }[];
}

const CountryMap: React.FC<CountryMapProps> = ({ points }) => {
  return (
    <VectorMap
      map={worldMill}
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
      zoomMax={10}
      zoomMin={1}
    />
  );
};

export default CountryMap;
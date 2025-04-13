import React from "react";
import dynamic from "next/dynamic";
import { coMill } from "@react-jvectormap/colombia";

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

interface CountryMapProps {
  points: {
    latLng: [number, number];
    name: string;
    count: number;
  }[];
}

const CountryMap: React.FC<CountryMapProps> = ({ points }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <VectorMap
        map={coMill as any}
        backgroundColor="transparent"
        markers={points}
        focusOn={{
          x: 0.52,
          y: 0.52,
          scale: 9, // Zoom centrado en Bogotá
          animate: true,
        }}
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
        onMarkerTipShow={(event, label, index) => {
          const point = points[Number(index)];
          (label as any).html(`<strong>${point.name}</strong><br/>${point.count} prospectos`);
        }}
      />
    </div>
  );
};

export default CountryMap;
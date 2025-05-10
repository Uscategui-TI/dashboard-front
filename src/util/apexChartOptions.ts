import { ApexOptions } from "apexcharts";

export const defaultBarChartOptions = (categories: string[]): ApexOptions => ({
  colors: ["#465fff"],
  chart: {
    fontFamily: "Outfit, sans-serif",
    type: "bar",
    height: 180,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "39%",
      borderRadius: 5,
      borderRadiusApplication: "end",
    },
  },
  dataLabels: { enabled: false },
  stroke: {
    show: true,
    width: 4,
    colors: ["transparent"],
  },
  xaxis: {
    categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  legend: {
    show: true,
    position: "top",
    horizontalAlign: "left",
    fontFamily: "Outfit",
  },
  yaxis: { title: { text: undefined } },
  grid: {
    yaxis: { lines: { show: true } },
  },
  fill: { opacity: 1 },
  tooltip: {
    x: { show: false },
    y: { formatter: (val: number) => `${val}` },
  },
});

export const getGenderDonutChartOptions = (
    labels: string[],
    colors: string[] = ["#465FFF", "#6F7DFF"]
  ): ApexOptions => ({
    colors,
    labels,
    chart: { type: "donut", height: 330 },
    fill: { type: "solid" },
    plotOptions: { pie: { donut: { size: "70%" } } },
    legend: { position: "bottom" },
});
  
export const getChartOptionsLines = (categories: string[], viewMode: string): ApexOptions => ({
  chart: { type: "area", height: 310, toolbar: { show: false } },
  xaxis: {
    categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: ["#6B7280"] },
    },
  },
  yaxis: {
    labels: { style: { colors: ["#6B7280"] } },
  },
  stroke: {
    curve: "smooth",
    width: [2],
  },
  fill: {
    type: "gradient",
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0.1,
    },
  },
  dataLabels: { enabled: false },
  tooltip: { enabled: true },
  markers: {
    size: viewMode === "month" ? 4 : 6,
  },
  grid: {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  colors: ["#465FFF"],
});
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
    labels: string[] = ["Femenino", "Masculino"],
    colors: string[] = ["#465FFF", "#6F7DFF"]
  ): ApexOptions => ({
    colors,
    labels,
    chart: { type: "donut", height: 330 },
    fill: { type: "solid" },
    plotOptions: { pie: { donut: { size: "70%" } } },
    legend: { position: "bottom" },
  });
  
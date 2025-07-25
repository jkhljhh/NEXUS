"use client";

import { DataGraph } from "@/components/data-graph2";
type ChartType =
  | "bar"
  | "line"
  | "pie"
  | "donut"
  | "stackedBar"
  | "stackedArea"
  | "scatter"
  | "heatmap"
  | "treemap";

type ChartMeta = { title?: string; x_label?: string; y_label?: string };
type Graph = { type: ChartType; data: any; meta?: ChartMeta };

const barGraph: Graph = {
  type: "bar",
  data: {
    x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    y: [820, 932, 901, 934, 1290, 1330, 1320],
    name: "Sales",
  },
  meta: {
    title: "Weekly Sales",
    x_label: "Day",
    y_label: "Sales",
  },
};

const lineGraph: Graph = {
  type: "line",
  data: {
    x: ["Jan", "Feb", "Mar", "Apr", "May"],
    y: [200, 250, 280, 260, 300],
    name: "Revenue",
  },
  meta: {
    title: "Monthly Revenue",
    x_label: "Month",
    y_label: "Revenue",
  },
};

const pieGraph: Graph = {
  type: "pie",
  data: {
    labels: ["Apples", "Bananas", "Cherries"],
    values: [335, 310, 234],
    name: "Fruits",
  },
  meta: {
    title: "Fruits Pie Chart",
  },
};

const donutGraph: Graph = {
  type: "donut",
  data: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    values: [120, 200, 150, 100],
    name: "Quarters",
  },
  meta: {
    title: "Quarterly Distribution",
  },
};

const stackedBarGraph: Graph = {
  type: "stackedBar",
  data: {
    series: [
      { name: "Email", x: ["Mon", "Tue", "Wed"], y: [120, 132, 101] },
      { name: "Ads", x: ["Mon", "Tue", "Wed"], y: [220, 182, 191] },
    ],
  },
  meta: {
    title: "Stacked Bar (Email & Ads)",
    x_label: "Day",
    y_label: "Count",
  },
};

const stackedAreaGraph: Graph = {
  type: "stackedArea",
  data: {
    series: [
      { name: "Desktop", x: ["Mon", "Tue", "Wed"], y: [320, 332, 301] },
      { name: "Mobile", x: ["Mon", "Tue", "Wed"], y: [120, 132, 101] },
    ],
  },
  meta: {
    title: "Stacked Area (Desktop & Mobile)",
    x_label: "Day",
    y_label: "Count",
  },
};

const scatterGraph: Graph = {
  type: "scatter",
  data: {
    series: [
      {
        name: "Math Scores",
        x: [1, 2, 3, 4, 5],
        y: [56, 78, 88, 95, 99],
      },
      {
        name: "Science Scores",
        x: [1, 2, 3, 4, 5],
        y: [45, 85, 90, 93, 97],
      },
    ],
  },
  meta: {
    title: "Hours Studied vs Scores",
    x_label: "Hours Studied",
    y_label: "Score",
  },
};

const heatmapGraph: Graph = {
  type: "heatmap",
  data: {
    x: ["Mon", "Tue", "Wed"],
    y: ["Morning", "Afternoon", "Evening"],
    z: [
      [1, 2, 3],
      [2, 4, 6],
      [7, 8, 9],
    ],
    name: "Heat Intensity",
  },
  meta: {
    title: "Weekly Activity Heatmap",
    x_label: "Day",
    y_label: "Period",
  },
};

const treemapGraph: Graph = {
  type: "treemap",
  data: {
    children: [
      { name: "A", value: 10 },
      { name: "B", value: 20, children: [{ name: "B1", value: 5 }] },
      { name: "C", value: 30 },
    ],
  },
  meta: {
    title: "Sample Treemap",
  },
};

export default function TestPage() {
  return (
    <DataGraph
      data={[
        barGraph,
        lineGraph,
        pieGraph,
        donutGraph,
        stackedBarGraph,
        stackedAreaGraph,
        scatterGraph,
        heatmapGraph,
        treemapGraph,
      ]}
    />
  );
}

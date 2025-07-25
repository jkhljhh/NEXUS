"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReactECharts from "echarts-for-react";

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
type DataGraphProps = { data: Graph[] };

// --- Common chart option parts ---
const baseLabel = {
  nameLocation: "middle",
  nameTextStyle: { fontWeight: "bold" },
};
const baseGrid = { left: "2%", bottom: "2%", containLabel: true };
const baseToolbox = { feature: { saveAsImage: {} } };
const baseTooltip = { trigger: "axis" };
const baseXAxis = (data?: any, name?: string) => ({
  type: "category",
  data,
  name,
  axisLabel: {
    rotate: -15,
    formatter: (val: string) =>
      typeof val === "string" && val.length > 16 ? val.slice(0, 15) + "…" : val,
  },
  ...baseLabel,
});
const baseYAxis = (name?: string) => ({
  type: "value",
  name,
  ...baseLabel,
});

function getEChartOptions(graph: Graph, xLabel: string, yLabel: string) {
  // --- Bar ---
  if (graph.type === "bar") {
    return {
      grid: baseGrid,
      toolbox: baseToolbox,
      tooltip: baseTooltip,
      xAxis: baseXAxis(graph.data.x, xLabel),
      yAxis: baseYAxis(yLabel),
      series: [
        {
          name: graph.data.name || yLabel,
          type: "bar",
          data: graph.data.y,
          // No value labels
        },
      ],
    };
  }

  // --- Line ---
  if (graph.type === "line") {
    return {
      grid: baseGrid,
      toolbox: baseToolbox,
      tooltip: baseTooltip,
      xAxis: baseXAxis(graph.data.x, xLabel),
      yAxis: baseYAxis(yLabel),
      series: [
        {
          name: graph.data.name || yLabel,
          type: "line",
          data: graph.data.y,
          smooth: true,
          label: { show: true, position: "top" },
        },
      ],
    };
  }

  // --- Pie / Donut ---
  if (graph.type === "pie" || graph.type === "donut") {
    return {
      tooltip: { trigger: "item" },
      legend: { orient: "vertical", left: "left" },
      series: [
        {
          name: graph.data.name,
          type: "pie",
          radius: graph.type === "donut" ? ["40%", "70%"] : "65%",
          center: ["50%", "55%"],
          label: { show: true, formatter: "{b}: {c} ({d}%)" },
          data: graph.data.labels.map((label: string, i: number) => ({
            value: graph.data.values[i],
            name: label,
          })),
        },
      ],
    };
  }

  // --- Stacked Bar ---
  if (graph.type === "stackedBar") {
    return {
      grid: baseGrid,
      toolbox: baseToolbox,
      tooltip: { ...baseTooltip, axisPointer: { type: "shadow" } },
      legend: {},
      xAxis: baseXAxis(graph.data.series[0].x, xLabel),
      yAxis: baseYAxis(yLabel),
      series: graph.data.series.map((s: any) => ({
        name: s.name,
        type: "bar",
        stack: "total",
        data: s.y,
        label: { show: false },
      })),
    };
  }

  // --- Stacked Area ---
  if (graph.type === "stackedArea") {
    return {
      grid: baseGrid,
      toolbox: baseToolbox,
      tooltip: baseTooltip,
      legend: {},
      xAxis: {
        ...baseXAxis(graph.data.series[0].x, xLabel),
        boundaryGap: false,
      },
      yAxis: baseYAxis(yLabel),
      series: graph.data.series.map((s: any) => ({
        name: s.name,
        type: "line",
        stack: "total",
        areaStyle: {},
        data: s.y,
        label: { show: false },
        smooth: true,
      })),
    };
  }

  // --- Scatter, Multi-series ---
  if (graph.type === "scatter") {
    const series = (graph.data.series || []).map((s: any) => ({
      name: s.name,
      type: "scatter",
      symbolSize: 18,
      data: s.x.map((x: any, i: number) => [x, s.y[i]]),
      emphasis: { focus: "series" },
    }));
    return {
      grid: baseGrid,
      toolbox: baseToolbox,
      tooltip: {
        trigger: "item",
        formatter: (params: any) =>
          `${params.seriesName}<br />${xLabel}: ${params.value[0]}<br />${yLabel}: ${params.value[1]}`,
      },
      legend: { show: true },
      xAxis: { type: "value", name: xLabel, nameLocation: "middle" },
      yAxis: { type: "value", name: yLabel, nameLocation: "middle" },
      series,
    };
  }

  // --- Heatmap ---
  if (graph.type === "heatmap") {
    return {
      grid: { left: "4%", right: "2%", bottom: "10%", containLabel: true },
      toolbox: baseToolbox,
      tooltip: { position: "top" },
      xAxis: {
        type: "category",
        data: graph.data.x,
        name: xLabel,
        nameLocation: "middle",
      },
      yAxis: {
        type: "category",
        data: graph.data.y,
        name: yLabel,
        nameLocation: "middle",
      },
      visualMap: {
        min: Math.min(...graph.data.z.flat()),
        max: Math.max(...graph.data.z.flat()),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
      },
      series: [
        {
          name: graph.data.name || "Heatmap",
          type: "heatmap",
          data: graph.data.z.flatMap((row: number[], yIdx: number) =>
            row.map((z, xIdx) => [xIdx, yIdx, z]),
          ),
          label: { show: false },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" },
          },
        },
      ],
    };
  }

  // --- Treemap ---
  if (graph.type === "treemap") {
    return {
      toolbox: baseToolbox,
      tooltip: { trigger: "item", formatter: "{b}: {c}" },
      series: [
        {
          type: "treemap",
          data: graph.data.children,
          label: { show: true, formatter: "{b}" },
          upperLabel: { show: true, height: 30 },
          leafDepth: 1,
        },
      ],
    };
  }

  return {};
}

export function DataGraph({ data }: DataGraphProps) {
  if (!data?.length) return <div>No charts to display.</div>;

  return (
    <Tabs defaultValue={data[0].meta?.title ?? data[0].type}>
      <TabsList>
        {data.map((g, i) => (
          <TabsTrigger
            key={i}
            value={g.meta?.title ?? `${g.type}-${i}`}
            className="capitalize"
          >
            {g.type}
          </TabsTrigger>
        ))}
      </TabsList>
      {data.map((graph, idx) => {
        const xLabel = graph.meta?.x_label || "x";
        const yLabel = graph.meta?.y_label || "y";
        return (
          <TabsContent
            key={idx}
            value={graph.meta?.title ?? `${graph.type}-${idx}`}
          >
            <h6 className="font-medium mb-4">{graph.meta?.title}</h6>
            <ReactECharts
              style={{ width: "100%", height: 400 }}
              option={getEChartOptions(graph, xLabel, yLabel)}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

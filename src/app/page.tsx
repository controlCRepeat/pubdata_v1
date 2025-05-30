"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAndProcessData } from "../lib/dataService";
import { chartConfigs } from "../lib/chartConfigs";
import { ChartConfig, ChartDataset } from "../lib/types";
import { Line } from "react-chartjs-2";
// import Select, { MultiValue } from "react-select";
import Head from "next/head";
import Image from "next/image";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const pastelColors = [
  "#A8DADC", "#FFE066", "#FF6B6B", "#6A4C93", "#F7CAC9",
  "#92A8D1", "#F7786B", "#88B04B", "#D65076", "#45B8AC",
  "#EFC050", "#5B5EA6", "#9B2335", "#DFCFBE", "#55B4B0",
  "#E15D44", "#7FCDCD", "#BC243C", "#C3447A", "#009B77",
];

function ChartBlock({ config }: { config: ChartConfig; }) {
  const [data, setData] = useState<ChartDataset[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, categories } = await fetchAndProcessData(config);
      const parseDate = config.parseDateFn ?? ((d: unknown) => d as string);
      const uniqueDates = [
        ...new Set(data.map((d) => parseDate(d[config.dateKey])))
      ];

      setData(data);
      setCategories(categories);
      setDates(uniqueDates);
    } catch (err) {
      console.error("Error loading chart data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // show all categories, no filter
  // const filteredData = data.filter((d) =>
  //   selectedCategories.includes(d[config.categoryKey] as string)
  // );
  const filteredData = data;

  // Group-based color assignment
  const uniqueGroups = Array.from(
    new Set(chartConfigs.map((cfg) => cfg.group ?? cfg.id))
  )
  const groupIndex = uniqueGroups.indexOf(config.group ?? config.id)
  
  const chartData = {
    labels: dates,
    datasets: categories.map((cat, i) => {
      const catDataMap = new Map<string, number>()
      filteredData
        .filter((d) => d[config.categoryKey] === cat)
        .forEach((d) =>
          catDataMap.set(
            (config.parseDateFn?.(d[config.dateKey]) ?? d[config.dateKey]) as string,
            d[config.valueKey] as number
          )
        )

      const dataPoints = dates.map((label) => catDataMap.get(label) ?? null)

      const baseColorIndex = (groupIndex * 5 + i) % pastelColors.length

      return {
        label: cat,
        data: dataPoints,
        borderColor: pastelColors[baseColorIndex],
        backgroundColor: pastelColors[baseColorIndex] + "80",
        fill: true,
        spanGaps: true,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      }
    }),
  }

  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white", // legend text color
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          color: "white", // x axis ticks color
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // subtle white grid lines
        },
      },
      y: {
        display: true,
        beginAtZero: false,
        ticks: {
          color: "white", // y axis ticks color
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // subtle white grid lines
        },
      },
    },
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading {config.name}...</div>;
  }

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-semibold mb-2">{config.name}</h2>
      <div className="relative h-64">
        <div className="absolute inset-0">
          <Line data={chartData} options={chartOptions} />
        </div>
        <Image
          src="/watermark.png"
          alt="Watermark"
          width={40}
          height={40}
          className="pointer-events-none absolute top-1/2 left-1/2 opacity-20 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="text-sm text-gray-500 mt-2 text-center">
        Source:{" "}
        <a
          href={config.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {config.sourceLabel || config.sourceUrl}
        </a>
      </div>

      {/* Removed Filter Categories dropdown */}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Open Data Charts</title>
        <meta name="description" content="Interactive charts for open data" />
      </Head>

      <main className="py-24 px-10 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Open Data Charts</h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
        {chartConfigs.map((config, i) => (
          <ChartBlock key={config.id} config={config} />
        ))}
        </div>
      </main>
    </>
  );
}
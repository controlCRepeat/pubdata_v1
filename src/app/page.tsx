"use client";

import { useState, useEffect } from "react";
import { fetchAndProcessData } from "../lib/dataService";
import { chartConfigs } from "../lib/chartConfigs";
import { ChartConfig, ChartDataset } from "../lib/types";
import { Line } from "react-chartjs-2";
import Select from "react-select";
import Head from "next/head";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const pastelColors = [
  "#A8DADC", "#FFE066", "#FF6B6B", "#6A4C93", "#F7CAC9",
  "#92A8D1", "#F7786B", "#88B04B", "#D65076", "#45B8AC",
  "#EFC050", "#5B5EA6", "#9B2335", "#DFCFBE", "#55B4B0",
  "#E15D44", "#7FCDCD", "#BC243C", "#C3447A", "#009B77",
];

function ChartBlock({ config }: { config: ChartConfig }) {
  const [data, setData] = useState<ChartDataset[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  async function fetchChartData() {
    setIsLoading(true);
    try {
      const { data, categories } = await fetchAndProcessData(config);
      const parseDate = config.parseDateFn ?? ((d: any) => d);
      const uniqueDates = [
        ...new Set(data.map((d) => parseDate(d[config.dateKey])))
      ];

      setData(data);
      setCategories(categories);
      setDates(uniqueDates);
      setSelectedCategories(categories.slice(0, 3));
    } catch (err) {
      console.error("Error loading chart data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredData = data.filter((d) =>
    selectedCategories.includes(d[config.categoryKey] as string)
  );

  const chartData = {
    labels: dates,
    datasets: selectedCategories.map((cat) => {
      const catDataMap = new Map<string, number>();
      filteredData
        .filter((d) => d[config.categoryKey] === cat)
        .forEach((d) =>
          catDataMap.set(
            (config.parseDateFn?.(d[config.dateKey]) ?? d[config.dateKey]) as string,
            d[config.valueKey] as number
          )
        );

      const dataPoints = dates.map((label) => catDataMap.get(label) ?? null);
      const colorIndex = categories.indexOf(cat);

      return {
        label: cat,
        data: dataPoints,
        borderColor: pastelColors[colorIndex % pastelColors.length],
        backgroundColor: pastelColors[colorIndex % pastelColors.length],
        fill: false,
        spanGaps: true,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
      };
    }),
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const handleCategoryChange = (selected: readonly any[] | null) => {
    setSelectedCategories(selected ? selected.map((s) => s.value) : []);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
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
      },
      y: {
        display: true,
        beginAtZero: false,
      },
    },
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading {config.name}...</div>;
  }

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-semibold mb-2">{config.name}</h2>
      <div className="relative h-64"> {/* h-64 = 16rem = 256px */}
        <div className="absolute inset-0">
          <Line data={chartData} options={chartOptions} />
        </div>
        <img
          src="/watermark.png"
          alt="Watermark"
          className="pointer-events-none absolute top-1/2 left-1/2 w-10 h-10 opacity-20 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>


      <div className="text-sm text-gray-500 mt-2 text-center">
        Source: {config.tableName}
      </div>

      <div className="mt-4 w-full max-w-full">
        <label className="block mb-2 font-semibold text-gray-700">
          Filter Categories
        </label>
        <Select
          options={categoryOptions}
          value={categoryOptions.filter((opt) =>
            selectedCategories.includes(opt.value)
          )}
          onChange={handleCategoryChange}
          isMulti
          closeMenuOnSelect={false}
          className="text-black w-full"
          classNamePrefix="react-select"
          styles={{
            container: (provided) => ({ ...provided, width: "100%" }),
          }}
        />
      </div>
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
          {chartConfigs.map((config) => (
            <ChartBlock key={config.id} config={config} />
          ))}
        </div>
      </main>
    </>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAndProcessData } from "../lib/dataService";
import { ChartConfig, DataRow } from "../lib/types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  ChartOptions,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  TooltipItem,
  Legend,
} from "chart.js";
import Image from "next/image";
import { pastelColors } from "../lib/colourScheme";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PopulationPyramidChartProps {
  config: ChartConfig;
}

export default function PopulationPyramidChart({ config }: PopulationPyramidChartProps) {
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    try {
      // fetchAndProcessData applies your config.filterFn:
      // → keeps only SeriesNo starting with "2." or "3." and dates in 2024.
      const { data } = await fetchAndProcessData(config);
      setDataRows(data);
    } catch (err) {
      console.error("Error loading pyramid data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  if (isLoading) {
    return <div className="text-center p-4">Loading {config.name}…</div>;
  }

  // 1️⃣ Build a sorted list of unique age‐bracket strings (Category)
  const ageSet = new Set<string>();
  dataRows.forEach((row) => {
    ageSet.add(String(row[config.categoryKey]));
  });
  const ageGroups = Array.from(ageSet).sort((a, b) => {
    // Extract leading number from strings like "0-4 years", "5-9 years"
    const aNum = parseInt(a.replace(/^(\d+).*/, "$1"), 10);
    const bNum = parseInt(b.replace(/^(\d+).*/, "$1"), 10);
    return aNum - bNum;
  });

  // 2️⃣ For each age bracket, find the male (SeriesNo starts "2.") and female (SeriesNo starts "3.")
  const maleValues: (number | null)[] = [];
  const femaleValues: (number | null)[] = [];

  ageGroups.forEach((age) => {
    // Exactly match Category and SeriesNo prefix
    const maleRow = dataRows.find(
      (r) =>
        String(r[config.categoryKey]) === age &&
        String(r["SeriesNo"]).startsWith("2.")
    );
    const femaleRow = dataRows.find(
      (r) =>
        String(r[config.categoryKey]) === age &&
        String(r["SeriesNo"]).startsWith("3.")
    );

    const maleVal = maleRow ? Number(maleRow[config.valueKey]) : null;
    const femaleVal = femaleRow ? Number(femaleRow[config.valueKey]) : null;

    // Plot male as negative so the bar extends left
    maleValues.push(maleVal !== null ? -maleVal : null);
    femaleValues.push(femaleVal);
  });

  const chartData = {
    labels: ageGroups,
    datasets: [
      {
        label: "Males",
        data: maleValues,
        backgroundColor: pastelColors[0],
      },
      {
        label: "Females",
        data: femaleValues,
        backgroundColor: pastelColors[1],
      },
    ],
  };
  
  const chartOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
  
    interaction: {
      mode: "index",
      axis: "y",
      intersect: false,
    },
  
    scales: {
      x: {
        stacked: true,
        ticks: {
          callback: (value: number | string): string => {
            return Math.abs(Number(value)).toString();
          },
          color: "white",
        },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        stacked: true,
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  
    plugins: {
      legend: { position: "top", labels: { color: "white" } },
      tooltip: {
        axis: "y",
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context: TooltipItem<"bar">): string => {
            const raw = context.raw as number;
            const absValue = Math.abs(raw);
            return `${context.dataset.label}: ${absValue.toLocaleString()}`;
          },
        },
      },
      title: {
        display: false,
      },
    },
  };
  

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-semibold mb-2">{config.name}</h2>
      <div className="relative h-96">
        <div className="absolute inset-0">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <Image
          src="/watermark.png"
          alt="Watermark"
          width={60}
          height={60}
          className="pointer-events-none absolute top-1/2 left-1/2 opacity-30 transform -translate-x-1/2 -translate-y-1/2"
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
    </div>
  );
}

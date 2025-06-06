"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAndProcessData } from "../lib/dataService";
import { ChartConfig, DataRow } from "../lib/types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { pastelColors } from "../lib/colourScheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StackedBarChartProps {
  config: ChartConfig;
}

const CATEGORY_ORDER = [
  "HDB 1- And 2-Room Flats",
  "HDB 3-Room Flats",
  "HDB 4-Room Flats",
  "HDB 5-Room And Executive Flats",
  "Condominiums And Other Apartments",
  "Landed Properties",
  "Other Types Of Dwelling",
];

const EXCLUDE_CATEGORIES = [
  "Total HDB Dwellings",
  "Resident Households",
];

// Optional: helper to darken pastel colors slightly for more contrast
function darkenColor(hex: string, amount: number = 0.2): string {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

export default function StackedBarChart({ config }: StackedBarChartProps) {
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchAndProcessData(config);
      setDataRows(data);
    } catch (err) {
      console.error("Error loading stacked bar data:", err);
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

  const filteredRows = dataRows.filter(
    (row) =>
      !EXCLUDE_CATEGORIES.includes(String(row[config.categoryKey])) &&
      CATEGORY_ORDER.includes(String(row[config.categoryKey]))
  );

  const datesSet = new Set<string>();
  filteredRows.forEach((r) => datesSet.add(String(r[config.dateKey])));
  const dates = Array.from(datesSet).sort();

  const datasets = CATEGORY_ORDER.map((category, index) => {
    const dataByDate = dates.map((date) => {
      const row = filteredRows.find(
        (r) =>
          String(r[config.categoryKey]) === category &&
          String(r[config.dateKey]) === date
      );
      return row ? Number(row[config.valueKey]) : 0;
    });

    // Darken the pastel color a bit for better visibility
    const baseColor = darkenColor(pastelColors[index % pastelColors.length], 0.3);

    return {
      label: category,
      data: dataByDate,
      backgroundColor: baseColor,
      borderColor: "transparent",
      borderWidth: 0,
    };
  });

  const chartData = {
    labels: dates,
    datasets,
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x",
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        stacked: true,
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
    plugins: {
      legend: { position: "top", labels: { color: "white" } },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            const value = context.parsed.y ?? context.parsed;
            return `${context.dataset.label}: ${Number(value).toLocaleString()}`;
          },
        },
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="p-4 w-full" style={{ height: 400 }}>
      <h2 className="text-xl font-semibold mb-2">{config.name}</h2>
      <Bar data={chartData} options={chartOptions} />
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

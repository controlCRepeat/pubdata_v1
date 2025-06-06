"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAndProcessData } from "../lib/dataService";
import { chartConfigs } from "../lib/chartConfigs";
import { ChartConfig } from "../lib/types";
import { Line } from "react-chartjs-2"; // for all non-pyramid charts
import Head from "next/head";
import Image from "next/image";
import StackedBarChart from "../components/StackedBarChart";
import PopulationPyramidChart from "../components/PopulationPyramid";
import { pastelColors } from "../lib/colourScheme";

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
  Filler
);

const borderColor = pastelColors[2];

// Reusable spinner component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-24">
      <svg
        className="animate-spin h-8 w-8 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  );
}

function ChartBlock({ config }: { config: ChartConfig }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [groupedSeries, setGroupedSeries] = useState<Map<string, (number | null)[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { categories, uniqueDates, groupedSeries } = await fetchAndProcessData(config);
      setCategories(categories);
      setDates(uniqueDates);
      setGroupedSeries(groupedSeries);
    } catch (err) {
      console.error("Error loading chart data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const uniqueGroups = Array.from(new Set(chartConfigs.map((cfg) => cfg.group ?? cfg.id)));
  const groupIndex = uniqueGroups.indexOf(config.group ?? config.id);
  const baseColorIndex = groupIndex * categories.length;
  
  const chartData = {
    labels: dates,
    datasets: categories.map((cat, index) => {
      const series = groupedSeries?.get(cat) ?? [];
      const color = pastelColors[(baseColorIndex + index) % pastelColors.length];
      return {
        label: cat,
        data: series,
        borderColor: color,
        backgroundColor: color + "80",
        fill: true,
        spanGaps: true,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      };
    }),
  };
  

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
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
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        display: true,
        beginAtZero: false,
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 w-full" style={{ minHeight: 280 /* enough for title + chart + footer */ }}>
      <h2 className="text-xl font-semibold mb-2">{config.name}</h2>

      <div className="relative h-64">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="absolute inset-0">
              <Line data={chartData} options={chartOptions} />
            </div>
            <Image
              src="/watermark.png"
              alt="Watermark"
              width={60}
              height={60}
              className="pointer-events-none absolute top-1/2 left-1/2 opacity-30 transform -translate-x-1/2 -translate-y-1/2"
            />
          </>
        )}
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
          {chartConfigs.map((config) => {
            // Wrap each chart in a bordered container div
            const chartContent =
              config.id === "population_pyramid" ? (
                <PopulationPyramidChart key={config.id} config={config} />
              ) : config.id === "resident_dwellings" ? (
                <StackedBarChart key={config.id} config={config} />
              ) : (
                <ChartBlock key={config.id} config={config} />
              );

            return (
              <div
                key={config.id}
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: "rgba(0,0,0,0.2)", // optional subtle dark bg behind border
                }}
              >
                {chartContent}
              </div>
            );
          })}
          {/* <TableauEmbed /> */}
        </div>
      </main>
    </>
  );
}

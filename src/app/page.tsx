"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Line } from "react-chartjs-2";
import Select from "react-select";
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

const tableName = "inflation_data";

const pastelColors = [
  "#A8DADC", "#FFE066", "#FF6B6B", "#6A4C93", "#F7CAC9",
  "#92A8D1", "#F7786B", "#88B04B", "#D65076", "#45B8AC",
  "#EFC050", "#5B5EA6", "#9B2335", "#DFCFBE", "#55B4B0",
  "#E15D44", "#7FCDCD", "#BC243C", "#C3447A", "#009B77",
];

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    if (data) {
      setData(data);

      const uniqueCategories = Array.from(
        new Set(data.map((item: any) => item.Category))
      );
      setCategories(uniqueCategories);
      setSelectedCategories(uniqueCategories.slice(0, 3));
    }
  }

  const filteredData = data.filter((d: any) =>
    selectedCategories.includes(d.Category)
  );

  const labels = Array.from(
    new Set(filteredData.map((d: any) => d.Date))
  ).sort((a, b) => new Date(a + " 1").getTime() - new Date(b + " 1").getTime());

  const chartData = {
    labels,
    datasets: selectedCategories.map((cat) => {
      const catDataMap = new Map<string, number>();
      filteredData
        .filter((d: any) => d.Category === cat)
        .forEach((d: any) => catDataMap.set(d.Date, d.Value));

      const dataPoints = labels.map((label) => catDataMap.get(label) ?? null);
      const colorIndex = categories.indexOf(cat);

      return {
        label: cat,
        data: dataPoints,
        borderColor: pastelColors[colorIndex % pastelColors.length],
        backgroundColor: pastelColors[colorIndex % pastelColors.length],
        fill: false,
        spanGaps: true,
      };
    }),
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const selectedOptions = categoryOptions.filter((option) =>
    selectedCategories.includes(option.value)
  );

  const handleSelectChange = (selected: any) => {
    setSelectedCategories(selected.map((s: any) => s.value));
  };

  return (
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{tableName}</h1>

      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Values by Date & Category" },
          },
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        }}
      />

      {/* Category dropdown below the chart */}
      <div className="mt-6">
        <label className="block mb-2 font-semibold text-gray-700">
          Filter Categories
        </label>
        <Select
          options={categoryOptions}
          value={selectedOptions}
          onChange={handleSelectChange}
          isMulti
          closeMenuOnSelect={false}
          className="text-black"
          classNamePrefix="react-select"
        />
      </div>
    </main>
  );
}

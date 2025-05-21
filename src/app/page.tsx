"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Line } from "react-chartjs-2";
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

const tableName = "inflation_data"; // Change to your actual table name

export default function Home() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    let { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    if (data) {
      setData(data);

      // Extract unique categories for toggle options
      const uniqueCategories = Array.from(
        new Set(data.map((item: any) => item.Category))
      );
      setCategories(uniqueCategories);
      setSelectedCategories(uniqueCategories); // default all selected
    }
  }

  // Filter data based on selected categories
  const filteredData = data.filter((d: any) =>
    selectedCategories.includes(d.Category)
  );

  // Prepare data for the chart
  const chartData = {
    labels: filteredData.map((d: any) => d.Date),
    datasets: selectedCategories.map((cat, idx) => {
      const catData = filteredData
        .filter((d: any) => d.Category === cat)
        .map((d: any) => d.Value);
      const colors = [
        "rgba(75,192,192,1)",
        "rgba(255,99,132,1)",
        "rgba(54,162,235,1)",
        "rgba(255,206,86,1)",
        "rgba(153,102,255,1)",
      ];
      return {
        label: cat,
        data: catData,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length],
        fill: false,
      };
    }),
  };

  // Handle category toggle changes
  function toggleCategory(cat: string) {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  }

  return (
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{tableName}</h1>

      {/* Multi-select toggle for categories */}
      <div className="mb-6 flex gap-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-3 py-1 rounded border ${
              selectedCategories.includes(cat)
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chart */}
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Values by Date & Category" },
          },
        }}
      />
    </main>
  );
}

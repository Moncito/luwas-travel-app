'use client';

import { useState, useEffect } from "react";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";

const slides = ["Overview", "Gender", "Age", "Occupation", "Income", "Location"];

interface ChartData {
  labels: string[];
  data: number[];
}

interface Section {
  chart: ChartData;
  summary: string;
}

interface DemographicsData {
  gender?: Section;
  age?: Section;
  occupation?: Section;
  income?: Section;
  location?: Section;
}

export default function DemographicsAnalyticsChart() {
  const [data, setData] = useState<DemographicsData | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics/demographics", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load demographics");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("❌ Demographics fetch failed:", e);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  const safeLabels = (section?: Section) => section?.chart?.labels ?? [];
  const safeData = (section?: Section) => section?.chart?.data ?? [];
  const safeSummary = (section?: Section) => section?.summary ?? "No data available yet.";

  const percentageSummary = (labels: string[], data: number[]) => {
    const total = data.reduce((a, b) => a + b, 0);
    if (total === 0) return "No percentage data available yet.";
    return labels
      .map((label, i) => `${label}: ${(data[i] / total * 100).toFixed(1)}%`)
      .join(" • ");
  };

  // ─────────── OVERVIEW ───────────
  const renderOverview = () => {
    if (!data) return <p className="text-center text-gray-500">No data available</p>;

    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-center text-gray-800">Overall Demographics</h2>
        <p className="text-center text-gray-600 max-w-2xl leading-relaxed">
          A general overview of user demographics combining gender, age, occupation, income, and location.
          This gives a quick summary of your audience profile before diving deeper into specific categories.
        </p>

        {/* Summary cards */}
        <div
          className="
            grid 
            grid-cols-[repeat(auto-fit,minmax(240px,1fr))]
            gap-6 
            w-full
          "
        >
          <div className="p-5 bg-blue-50 rounded-xl shadow text-center hover:shadow-md transition">
            <h3 className="font-semibold text-gray-800">Gender</h3>
            <p className="text-sm text-gray-700">
              {percentageSummary(safeLabels(data.gender), safeData(data.gender))}
            </p>
          </div>

          <div className="p-5 bg-green-50 rounded-xl shadow text-center hover:shadow-md transition">
            <h3 className="font-semibold text-gray-800">Age</h3>
            <p className="text-sm text-gray-700">
              {percentageSummary(safeLabels(data.age), safeData(data.age))}
            </p>
          </div>

          <div className="p-5 bg-yellow-50 rounded-xl shadow text-center hover:shadow-md transition">
            <h3 className="font-semibold text-gray-800">Occupation</h3>
            <p className="text-sm text-gray-700">
              {percentageSummary(safeLabels(data.occupation), safeData(data.occupation))}
            </p>
          </div>

          <div className="p-5 bg-purple-50 rounded-xl shadow text-center hover:shadow-md transition">
            <h3 className="font-semibold text-gray-800">Income</h3>
            <p className="text-sm text-gray-700">
              {percentageSummary(safeLabels(data.income), safeData(data.income))}
            </p>
          </div>

          <div className="p-5 bg-pink-50 rounded-xl shadow text-center hover:shadow-md transition">
            <h3 className="font-semibold text-gray-800">Location</h3>
            <p className="text-sm text-gray-700">
              {percentageSummary(safeLabels(data.location), safeData(data.location))}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ─────────── INDIVIDUAL CHARTS ───────────
  const renderChart = () => {
    if (!data) return <p className="text-center text-gray-500">No data available</p>;

    const chartClass = "flex flex-col items-center justify-center h-full";

    const motionSettings = {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { duration: 0.4, ease: "easeOut" },
    };

    switch (slides[index]) {
      case "Overview":
        return renderOverview();

      case "Gender":
        return (
          <motion.div {...motionSettings} className={chartClass}>
            <h2 className="text-xl font-bold mb-4 text-center">Gender Distribution</h2>
            <div className="w-[260px] h-[260px] md:w-[300px] md:h-[300px]">
              <Pie
                data={{
                  labels: safeLabels(data.gender),
                  datasets: [
                    {
                      data: safeData(data.gender),
                      backgroundColor: ["#3b82f6", "#ec4899", "#fbbf24"],
                    },
                  ],
                }}
              />
            </div>
            <p className="mt-4 text-center text-sm text-gray-700 max-w-sm">
              {safeSummary(data.gender)} <br />
              <span className="font-medium">
                {percentageSummary(safeLabels(data.gender), safeData(data.gender))}
              </span>
            </p>
          </motion.div>
        );

      case "Age":
        return (
          <motion.div {...motionSettings} className={chartClass}>
            <h2 className="text-xl font-bold mb-4 text-center">Age Groups</h2>
            <div className="w-[400px] h-[280px]">
              <Bar
                data={{
                  labels: safeLabels(data.age),
                  datasets: [{ data: safeData(data.age), backgroundColor: "#3b82f6" }],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
            <p className="mt-4 text-center text-sm text-gray-700 max-w-sm">
              {safeSummary(data.age)} <br />
              <span className="font-medium">
                {percentageSummary(safeLabels(data.age), safeData(data.age))}
              </span>
            </p>
          </motion.div>
        );

      case "Occupation":
        return (
          <motion.div {...motionSettings} className={chartClass}>
            <h2 className="text-xl font-bold mb-4 text-center">Occupation</h2>
            <div className="w-[260px] h-[260px] md:w-[300px] md:h-[300px]">
              <Doughnut
                data={{
                  labels: safeLabels(data.occupation),
                  datasets: [
                    {
                      data: safeData(data.occupation),
                      backgroundColor: ["#10b981", "#6366f1", "#f59e0b"],
                    },
                  ],
                }}
              />
            </div>
            <p className="mt-4 text-center text-sm text-gray-700 max-w-sm">
              {safeSummary(data.occupation)} <br />
              <span className="font-medium">
                {percentageSummary(safeLabels(data.occupation), safeData(data.occupation))}
              </span>
            </p>
          </motion.div>
        );

      case "Income":
        return (
          <motion.div {...motionSettings} className={chartClass}>
            <h2 className="text-xl font-bold mb-4 text-center">Income Levels</h2>
            <div className="w-[260px] h-[260px] md:w-[300px] md:h-[300px]">
              <Pie
                data={{
                  labels: safeLabels(data.income),
                  datasets: [
                    {
                      data: safeData(data.income),
                      backgroundColor: ["#facc15", "#4ade80", "#ef4444"],
                    },
                  ],
                }}
              />
            </div>
            <p className="mt-4 text-center text-sm text-gray-700 max-w-sm">
              {safeSummary(data.income)} <br />
              <span className="font-medium">
                {percentageSummary(safeLabels(data.income), safeData(data.income))}
              </span>
            </p>
          </motion.div>
        );

      case "Location":
        return (
          <motion.div {...motionSettings} className={chartClass}>
            <h2 className="text-xl font-bold mb-4 text-center">User Locations</h2>
            <div className="w-[400px] h-[280px]">
              <Bar
                data={{
                  labels: safeLabels(data.location),
                  datasets: [{ data: safeData(data.location), backgroundColor: "#0ea5e9" }],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
            <p className="mt-4 text-center text-sm text-gray-700 max-w-sm">
              {safeSummary(data.location)} <br />
              <span className="font-medium">
                {percentageSummary(safeLabels(data.location), safeData(data.location))}
              </span>
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Loading demographics...</p>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
      {/* Slide container */}
      <div className="relative h-[550px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[index]}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="absolute w-full h-full flex items-center justify-center"
          >
            {renderChart()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={prev}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm"
        >
          ◀ Prev
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${
                i === index ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-sm"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}

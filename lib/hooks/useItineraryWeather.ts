import { useEffect, useState } from "react";

export function useItineraryWeather(title: string, location: string) {
  const [data, setData] = useState<{ bestTime: string; summary: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title || !location) return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/itineraries/weather-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, location }),
        });

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("❌ Failed to fetch AI weather data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [title, location]);

  return { data, loading };
}

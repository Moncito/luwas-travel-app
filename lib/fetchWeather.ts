export async function fetchWeather(
  lat: number,
  lon: number,
  date: string
): Promise<{ temp: number | null; condition: string; icon: string | null; fetchedAt: string }> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("Missing OpenWeather API key");

  const timestamp = Math.floor(new Date(date).getTime() / 1000);
  const now = Date.now();
  const isFuture = new Date(date).getTime() > now;

  const url = isFuture
    ? `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    : `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${apiKey}&units=metric`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API error");
  const data = await res.json();

  if (isFuture) {
    const forecasts = data.list || [];
    const target = forecasts.reduce((prev: any, curr: any) => {
      return Math.abs(curr.dt * 1000 - new Date(date).getTime()) <
        Math.abs(prev.dt * 1000 - new Date(date).getTime())
        ? curr
        : prev;
    }, forecasts[0]);

    return {
      temp: target?.main?.temp ?? null,
      condition: target?.weather?.[0]?.description ?? "Unknown",
      icon: target?.weather?.[0]?.icon ?? null,
      fetchedAt: new Date().toISOString(),
    };
  }

  return {
    temp: data.current?.temp ?? null,
    condition: data.current?.weather?.[0]?.description ?? "Unknown",
    icon: data.current?.weather?.[0]?.icon ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

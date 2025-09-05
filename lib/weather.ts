export async function fetchWeather(
  lat: number,
  lon: number,
  departureDate: string
) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENWEATHER_API_KEY");

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather data");

  const data = await res.json();

  // Find forecast closest to departureDate
  const target = new Date(departureDate).getTime();
  let closest = data.list[0];
  let minDiff = Math.abs(new Date(closest.dt_txt).getTime() - target);

  for (const forecast of data.list) {
    const diff = Math.abs(new Date(forecast.dt_txt).getTime() - target);
    if (diff < minDiff) {
      closest = forecast;
      minDiff = diff;
    }
  }

  return {
    condition: closest.weather[0].main,
    temperature: closest.main.temp,
    icon: closest.weather[0].icon,
    fetchedAt: new Date().toISOString(),
  };
}

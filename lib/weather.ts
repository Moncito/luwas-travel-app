export async function fetchWeatherForecast(destination: string, date: string) {
  try {
    // Optional: Replace this when you get a new API key
    throw new Error("Using fallback based on PH weather season.");
  } catch (error) {
    console.warn('⚠️ Weather API failed:', error.message);

    const month = new Date(date).getMonth(); // 0 = Jan, 11 = Dec

    if ([2, 3, 4].includes(month)) {
      // March to May
      return {
        avgTemp: 34,
        condition: 'Hot and Dry',
      };
    } else if ([5, 6, 7, 8, 9, 10].includes(month)) {
      // June to November
      return {
        avgTemp: 28,
        condition: 'Rainy and Humid',
      };
    } else {
      // December to February
      return {
        avgTemp: 26,
        condition: 'Cool and Cloudy',
      };
    }
  }
}

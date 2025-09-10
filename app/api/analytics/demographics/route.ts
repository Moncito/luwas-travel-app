import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

function formatSection(record: Record<string, number>, label: string) {
  const labels = Object.keys(record);
  const data = Object.values(record);

  const total = data.reduce((a, b) => a + b, 0);
  const topIndex = data.indexOf(Math.max(...data));
  const topLabel = labels[topIndex] || "Unknown";
  const topValue = data[topIndex] || 0;

  const summary =
    total > 0
      ? `${topLabel} is the most common ${label.toLowerCase()} with ${topValue} users.`
      : `No ${label.toLowerCase()} data available yet.`;

  return { chart: { labels, data }, summary };
}

export async function GET() {
  try {
    const snapshot = await db.collection("users").get();

    const gender: Record<string, number> = {};
    const ageGroups: Record<string, number> = {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0,
      Unknown: 0,
    };
    const occupation: Record<string, number> = {};
    const incomeLevel: Record<string, number> = {};
    const location: Record<string, number> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Gender
      const g = data.gender || "Unknown";
      gender[g] = (gender[g] || 0) + 1;

      // Age Groups
      if (data.age) {
        const age = Number(data.age);
        if (age >= 18 && age <= 24) ageGroups["18-24"]++;
        else if (age >= 25 && age <= 34) ageGroups["25-34"]++;
        else if (age >= 35 && age <= 44) ageGroups["35-44"]++;
        else if (age >= 45 && age <= 54) ageGroups["45-54"]++;
        else if (age >= 55) ageGroups["55+"]++;
        else ageGroups.Unknown++;
      } else {
        ageGroups.Unknown++;
      }

      // Occupation
      const o = data.occupation || "Unknown";
      occupation[o] = (occupation[o] || 0) + 1;

      // Income Level
      const income = data.incomeLevel || "Unknown";
      incomeLevel[income] = (incomeLevel[income] || 0) + 1;

      // Location
      const loc = data.address || "Unknown";
      location[loc] = (location[loc] || 0) + 1;
    });

    return NextResponse.json({
      gender: formatSection(gender, "Gender"),
      age: formatSection(ageGroups, "Age Group"),
      occupation: formatSection(occupation, "Occupation"),
      income: formatSection(incomeLevel, "Income Level"),
      location: formatSection(location, "Location"),
    });
  } catch (err) {
    console.error("🔥 Error in demographics API:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}

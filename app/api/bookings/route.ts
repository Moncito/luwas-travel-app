import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { fetchWeather } from "@/lib/weather";

interface Activity {
  id: string;
  title: string;
  price: number;
  day: number;
}

interface DestinationData {
  name: string;
  latitude: number;
  longitude: number;
  location?: string;
  description?: string;
  imageUrl?: string;
}

export async function GET() {
  try {
    const snapshot = await db
      .collection("bookings")
      .orderBy("createdAt", "desc")
      .get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create new booking (fixed or custom)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tripType, // "fixed" | "custom"
      destinationId,
      tripPackageId,
      activities = [],
      fullName,
      email,
      userId,
      phone,
      travelers = 1,
      departureDate,
      returnDate,
      specialRequests,
      type = "trip", // existing field ("trip" | "itinerary")
    } = body;

    if (!destinationId || !departureDate || !fullName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ 1. Fetch destination data
    const destDoc = await db.collection("destinations").doc(destinationId).get();
    if (!destDoc.exists) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    const destData = destDoc.data() as DestinationData;

    // ✅ 2. Fetch weather for travel date
    const weather = await fetchWeather(
      destData.latitude,
      destData.longitude,
      departureDate
    );

    // ✅ 3. Handle booking type logic
    let totalPrice = 0;
    let tripTitle = "";
    let selectedActivities: Activity[] = [];

    if (tripType === "fixed") {
      // 🧭 Fixed trip: use tripPackageId
      if (!tripPackageId) {
        return NextResponse.json(
          { error: "Missing tripPackageId for fixed trip" },
          { status: 400 }
        );
      }

      const packageDoc = await db
        .collection("tripPackages")
        .doc(tripPackageId)
        .get();

      if (!packageDoc.exists) {
        return NextResponse.json(
          { error: "Trip package not found" },
          { status: 404 }
        );
      }

      const pkgData = packageDoc.data();
      totalPrice = pkgData?.price || 0;
      tripTitle = pkgData?.title || `Trip to ${destData.name}`;
    } else if (tripType === "custom") {
      // ✨ Custom trip: compute from activities
      if (!Array.isArray(activities) || activities.length === 0) {
        return NextResponse.json(
          { error: "Custom trip must include at least one activity" },
          { status: 400 }
        );
      }

      selectedActivities = activities.map((a: Activity) => ({
        id: a.id,
        title: a.title,
        price: Number(a.price) || 0,
        day: a.day || 1,
      }));

      totalPrice = selectedActivities.reduce(
        (sum, act) => sum + act.price,
        0
      );
      tripTitle = `Custom Trip to ${destData.name}`;
    } else {
      return NextResponse.json(
        { error: "Invalid tripType. Must be 'fixed' or 'custom'" },
        { status: 400 }
      );
    }

    // ✅ 4. Create booking object
    const newBooking = {
      userId,
      fullName,
      email,
      phone: phone || "",
      destination: destData.name,
      destinationId,
      tripPackageId: tripPackageId || null,
      tripType,
      title: tripTitle,
      type, // "trip" | "itinerary"
      activities: selectedActivities,
      travelers,
      departureDate,
      returnDate: returnDate || "",
      specialRequests: specialRequests || "",
      totalPrice,
      status: "upcoming",
      weather,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // ✅ 5. Save to Firestore
    const docRef = await db.collection("bookings").add(newBooking);

    return NextResponse.json(
      { id: docRef.id, ...newBooking },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

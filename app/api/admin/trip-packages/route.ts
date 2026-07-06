import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

interface DailyScheduleItem {
  day: number;
  activities: string[];
}

function normalizeDailySchedule(input: unknown): DailyScheduleItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item, index) => {
      const day = Number((item as { day?: number })?.day) || index + 1;
      const activitiesRaw = (item as { activities?: unknown })?.activities;
      const activities = Array.isArray(activitiesRaw)
        ? activitiesRaw.map((a) => String(a).trim()).filter(Boolean)
        : [];

      return { day, activities };
    })
    .filter((item) => item.activities.length > 0);
}

async function isSessionAdmin(req: NextRequest): Promise<boolean> {
  const sessionToken = req.cookies.get("session")?.value;

  let uid = "";
  let claimAdmin = false;

  if (sessionToken) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionToken, true);
      uid = decoded.uid;
      claimAdmin = decoded.admin === true;
    } catch {
      // fall through to Bearer token check
    }
  }

  if (!uid) {
    const authHeader = req.headers.get("authorization") || "";
    const bearer = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!bearer) return false;

    const decoded = await adminAuth.verifyIdToken(bearer, true);
    uid = decoded.uid;
    claimAdmin = decoded.admin === true;
  }

  if (claimAdmin) return true;

  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;

  const data = userDoc.data() || {};
  const role = String(data.role || "").toLowerCase();
  return role === "admin" || data.admin === true || data.isAdmin === true;
}

export async function POST(req: NextRequest) {
  try {
    const admin = await isSessionAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const editId = typeof body.editId === "string" ? body.editId.trim() : "";
    const destinationId = String(body.destinationId || "").trim();
    const packageLocation = String(body.packageLocation || "").trim();
    const destinationName = String(body.destinationName || "").trim();
    const destinationLocation = String(body.destinationLocation || "").trim();
    const title = String(body.title || "").trim();
    const duration = String(body.duration || "").trim();
    const price = Number(body.price);
    const imageUrl = String(body.imageUrl || "").trim();
    const inclusions = Array.isArray(body.inclusions)
      ? body.inclusions.map((x: unknown) => String(x).trim()).filter(Boolean)
      : [];
    const dailySchedule = normalizeDailySchedule(body.dailySchedule);

    if (
      !destinationId ||
      !packageLocation ||
      !title ||
      !duration ||
      !Number.isFinite(price) ||
      price < 0 ||
      !imageUrl ||
      inclusions.length === 0 ||
      dailySchedule.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid trip package fields" },
        { status: 400 }
      );
    }

    const payload = {
      destinationId,
      packageLocation,
      destinationName,
      destinationLocation,
      title,
      duration,
      price,
      imageUrl,
      inclusions,
      dailySchedule,
    };

    if (editId) {
      await adminDb.collection("tripPackages").doc(editId).update({
        ...payload,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, id: editId, mode: "update" });
    }

    const docRef = await adminDb.collection("tripPackages").add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id, mode: "create" });
  } catch (error) {
    console.error("Error saving trip package:", error);
    return NextResponse.json(
      { error: "Failed to save trip package" },
      { status: 500 }
    );
  }
}

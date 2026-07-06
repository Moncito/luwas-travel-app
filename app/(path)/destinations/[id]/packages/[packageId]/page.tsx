// File: app/destinations/[id]/packages/[packageId]/page.tsx
import { db } from "@/firebase/admin";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageDetailClientContent from "./PackageDetailClientContent";

interface TripPackage {
  id: string;
  title: string;
  duration: string;
  description: string;
  price: number;
  inclusions: string[];
  dailySchedule: { day: number; activities: string[] }[];
  imageUrl?: string;
  destinationId: string;
  packageLocation?: string;
  destinationLocation?: string;
}

interface Props {
  params: Promise<{ id: string; packageId: string }>;
}

export default async function PackageDetailPage({ params }: Props) {
  const { id: destinationId, packageId } = await params;
  const destinationSnap = await db.collection("destinations").doc(destinationId).get();
  const destinationLocation = destinationSnap.exists
    ? destinationSnap.data()?.location || ""
    : "";

  const docSnap = await db.collection("tripPackages").doc(packageId).get();
  if (!docSnap.exists) return notFound();

  const rawPkg = docSnap.data() || {};
  if (rawPkg.destinationId !== destinationId) return notFound();

  const pkg: TripPackage = {
    id: docSnap.id,
    title: rawPkg.title || "",
    duration: rawPkg.duration || "",
    description: rawPkg.description || "",
    price: rawPkg.price || 0,
    inclusions: rawPkg.inclusions || [],
    dailySchedule: rawPkg.dailySchedule || [],
    imageUrl: rawPkg.imageUrl || "",
    destinationId: rawPkg.destinationId || "",
    packageLocation: rawPkg.packageLocation || "",
    destinationLocation: rawPkg.destinationLocation || "",
  };
  
  const packageLocationText =
    pkg.packageLocation || pkg.destinationLocation || destinationLocation || "Inside this destination";

  return (
    <>
      <Navbar />
      <PackageDetailClientContent 
        pkg={pkg} 
        destinationId={destinationId} 
        packageId={packageId} 
        packageLocationText={packageLocationText} 
      />
      <Footer />
    </>
  );
}

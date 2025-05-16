"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/client";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  sentiment: string;
  keywords: string[];
  createdAt: { seconds: number };
};

const sentimentColors: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  neutral: "bg-yellow-100 text-yellow-800",
  negative: "bg-red-100 text-red-800",
};

const sentimentIcons: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😞",
};

const ReviewList = ({ destinationId }: { destinationId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("destinationId", "==", destinationId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Review[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Review, "id">),
      }));
      setReviews(fetched);
    });

    return () => unsubscribe();
  }, [destinationId]);

  if (reviews.length === 0) return <p className="text-gray-500">No reviews yet. Be the first!</p>;

  return (
    <div className="space-y-4 mt-6">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-lg">{review.userName}</h3>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 font-medium">{review.rating} ⭐</span>
              <span
                className={`text-sm px-2 py-1 rounded-full font-medium ${sentimentColors[review.sentiment]}`}
              >
                {sentimentIcons[review.sentiment]} {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-gray-800">{review.comment}</p>

          {review.keywords?.length > 0 && (
            <p className="text-sm text-blue-500 mt-2 italic">
              Keywords: {review.keywords.join(", ")}
            </p>
          )}

          <p className="text-sm text-gray-400 mt-2">
            {new Date(review.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;

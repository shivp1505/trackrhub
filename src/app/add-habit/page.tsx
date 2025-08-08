"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import Link from "next/link";

export default function AddHabit() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Health");
  const [frequencyType, setFrequencyType] = useState("Daily"); // Daily / Weekly / Custom
  const [customInterval, setCustomInterval] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState("Days"); // Days / Weeks / Months
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setLoading(true);

    try {
      let frequencyData;

      if (frequencyType === "Custom") {
        frequencyData = {
          type: "Custom",
          interval: customInterval,
          unit: customUnit,
        };
      } else {
        frequencyData = { type: frequencyType };
      }

      await addDoc(collection(db, "habits"), {
        name,
        category,
        frequency: frequencyData,
        completed: false,
        userId: user.uid,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error adding habit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6">
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Add New Habit</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block mb-1 font-semibold">Habit Name</label>
            <input
              type="text"
              placeholder="e.g. Morning Workout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option>Health</option>
              <option>Work</option>
              <option>Personal</option>
              <option>Learning</option>
              <option>Other</option>
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block mb-1 font-semibold">Frequency</label>
            <select
              value={frequencyType}
              onChange={(e) => setFrequencyType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Custom</option>
            </select>
          </div>

          {/* Custom Frequency Options */}
          {frequencyType === "Custom" && (
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={customInterval}
                onChange={(e) => setCustomInterval(parseInt(e.target.value))}
                className="w-20 border border-gray-300 rounded px-3 py-2"
                required
              />
              <select
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              >
                <option>Days</option>
                <option>Weeks</option>
                <option>Months</option>
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Habit"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

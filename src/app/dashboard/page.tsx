"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";
import { FiSettings, FiTrash2 } from "react-icons/fi";

interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: {
    type: string;
    interval?: number;
    unit?: string;
  };
  completed: boolean;
  userId: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, Habit>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [statusMessages, setStatusMessages] = useState<Record<string, string>>({});

  const router = useRouter();

  const capitalizeFirst = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const formatFrequency = (freq: Habit["frequency"]) => {
    if (!freq || !freq.type) return "";
    if (freq.type === "Custom" && freq.interval && freq.unit) {
      return `Every ${freq.interval} ${freq.unit}`;
    }
    return freq.type;
  };

  const fetchHabits = async (userId: string) => {
    const q = query(collection(db, "habits"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const habitsData: Habit[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Habit, "id">),
    }));
    setHabits(habitsData);

    const initialValues: Record<string, Habit> = {};
    habitsData.forEach((habit) => {
      initialValues[habit.id] = { ...habit };
    });
    setEditValues(initialValues);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserName(userDocSnap.data().name || "");
        }
        fetchHabits(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isFormElement =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLSelectElement;
      if (editingMode && e.key === "Enter" && !isFormElement) {
        e.preventDefault();
        setEditingMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingMode]);

  let saveTimeouts: Record<string, NodeJS.Timeout> = {};

  const autoSaveHabit = (habitId: string) => {
    clearTimeout(saveTimeouts[habitId]);

    setSavingIds((prev) => [...new Set([...prev, habitId])]);
    setStatusMessages((prev) => ({ ...prev, [habitId]: "Saving..." }));

    saveTimeouts[habitId] = setTimeout(async () => {
      if (user) {
        const { name, category, frequency, completed } = editValues[habitId];
        await updateDoc(doc(db, "habits", habitId), {
          name,
          category,
          frequency,
          completed,
        });

        setSavingIds((prev) => prev.filter((id) => id !== habitId));
        setStatusMessages((prev) => ({ ...prev, [habitId]: "Saved" }));

        await fetchHabits(user.uid);

        setTimeout(() => {
          setStatusMessages((prev) => {
            const updated = { ...prev };
            delete updated[habitId];
            return updated;
          });
        }, 1500);
      }
    }, 400);
  };

  const handleChange = (habitId: string, field: keyof Habit, value: any) => {
    setEditValues((prev) => ({
      ...prev,
      [habitId]: { ...prev[habitId], [field]: value },
    }));
    autoSaveHabit(habitId);
  };

  const handleFrequencyChange = (
    habitId: string,
    key: keyof Habit["frequency"],
    value: any
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        frequency: {
          ...prev[habitId].frequency,
          [key]: value,
        },
      },
    }));
    autoSaveHabit(habitId);
  };

  const toggleCompletion = async (habitId: string, currentState: boolean) => {
    await updateDoc(doc(db, "habits", habitId), { completed: !currentState });
    if (user) fetchHabits(user.uid);
  };

  const deleteHabit = async () => {
    if (deleteTarget) {
      await deleteDoc(doc(db, "habits", deleteTarget));
      setDeleteTarget(null);
      if (user) fetchHabits(user.uid);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-black">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black flex flex-col">
      <header className="text-center mt-6">
        <h1 className="text-[32px] font-bold">Welcome to TrackrHub</h1>
      </header>

      <div className="flex flex-row flex-grow p-6">
        <div className="w-1/3">
          <h2 className="text-[28px] font-bold mb-6">Hi, {userName || "Name"}.</h2>

          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[20px] font-semibold">Today's Habits</h3>
              <button
                onClick={() => setEditingMode(!editingMode)}
                className={`text-gray-600 hover:text-gray-800 transition-transform duration-300 ${
                  editingMode ? "rotate-90" : ""
                }`}
                title="Edit Habits"
              >
                <FiSettings size={20} />
              </button>
            </div>

            {habits.length === 0 ? (
              <p className="text-black/70 mb-6">No habits yet.</p>
            ) : (
              <ul className="space-y-3 mb-6">
                {habits.map((habit) => (
                  <li
                    key={habit.id}
                    className={`flex flex-col gap-2 rounded transition-colors duration-500 ${
                      savingIds.includes(habit.id) ? "bg-yellow-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={habit.completed}
                        onChange={() => toggleCompletion(habit.id, habit.completed)}
                        className="w-6 h-6"
                        disabled={editingMode}
                      />

                      {editingMode ? (
                        <>
                          <input
                            type="text"
                            value={editValues[habit.id]?.name}
                            onChange={(e) =>
                              handleChange(habit.id, "name", e.target.value)
                            }
                            className="border border-gray-400 px-2 py-1 rounded w-full"
                          />
                          <button
                            onClick={() => setDeleteTarget(habit.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <div>
                          <span className="text-lg">
                            {capitalizeFirst(habit.name)}
                          </span>
                          <div className="text-sm text-gray-500">
                            {habit.category} – {formatFrequency(habit.frequency)}
                          </div>
                        </div>
                      )}
                    </div>

                    {editingMode && (
                      <div className="pl-9 flex flex-col gap-2">
                        <select
                          value={editValues[habit.id]?.category}
                          onChange={(e) =>
                            handleChange(habit.id, "category", e.target.value)
                          }
                          className="border border-gray-400 rounded px-2 py-1"
                        >
                          <option>Health</option>
                          <option>Work</option>
                          <option>Personal</option>
                          <option>Learning</option>
                          <option>Other</option>
                        </select>

                        <select
                          value={editValues[habit.id]?.frequency?.type}
                          onChange={(e) =>
                            handleFrequencyChange(habit.id, "type", e.target.value)
                          }
                          className="border border-gray-400 rounded px-2 py-1"
                        >
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Custom</option>
                        </select>

                        {editValues[habit.id]?.frequency?.type === "Custom" && (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min={1}
                              value={editValues[habit.id]?.frequency?.interval || 1}
                              onChange={(e) =>
                                handleFrequencyChange(
                                  habit.id,
                                  "interval",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-20 border border-gray-400 rounded px-2 py-1"
                            />
                            <select
                              value={editValues[habit.id]?.frequency?.unit || "Days"}
                              onChange={(e) =>
                                handleFrequencyChange(habit.id, "unit", e.target.value)
                              }
                              className="border border-gray-400 rounded px-2 py-1"
                            >
                              <option>Days</option>
                              <option>Weeks</option>
                              <option>Months</option>
                            </select>
                          </div>
                        )}

                        {/* ✅ Status message */}
                        {statusMessages[habit.id] && (
                          <p className="text-sm text-gray-500 italic mt-1">
                            {statusMessages[habit.id]}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <Link href="/add-habit">
              <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 w-full">
                Add Habit
              </button>
            </Link>
          </div>
        </div>

        <div className="flex-1"></div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-bold mb-4">Delete Habit</h2>
            <p className="mb-6">Are you sure you want to delete this habit?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={deleteHabit}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="absolute bottom-6 left-6 text-sm">
        Signed in as: <span className="font-semibold">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="ml-4 bg-[#4B4B4B] text-white px-3 py-1 rounded hover:bg-[#3A3A3A]"
        >
          Logout
        </button>
      </footer>
    </main>
  );
}

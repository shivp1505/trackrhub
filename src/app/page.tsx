import Link from "next/link";
import { Inter, Instrument_Sans } from "next/font/google";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Regular, Medium, Bold
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Regular, Medium, Bold
});

export default function Home() {
  return (
    <main className="min-h-screen bg-[#E5E5E5] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-[72px] py-[32px]">
        {/* Logo */}
        <h1
          className={`${instrumentSans.className} text-[65px] font-bold text-black`}
        >
          TrackrHub
        </h1>

        {/* Navigation Links */}
        <div
          className={`${inter.className} flex gap-[48px] text-[40px] text-black`}
        >
          <Link href="/signup" className="hover:underline">
            Sign Up
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-grow text-center px-4">
        {/* Slogan */}
        <h2
          className={`${instrumentSans.className} text-[100px] font-bold leading-[90px] text-black`}
        >
          Your Hub to <br /> Personal Growth
        </h2>

        {/* Under Slogan */}
        <p
          className={`${instrumentSans.className} font-medium text-[40px] text-black mt-[16px]`}
        >
          Trace Habits. Stay Consistent. Improve Daily
        </p>

        {/* Get Started Button */}
        <Link href="/signup">
          <button
            className="mt-[40px] bg-[#4B4B4B] text-white text-[40px] px-[42px] py-[12px] rounded-[12px] hover:bg-[#3a3a3a]"
            style={{ fontFamily: "Arial", fontWeight: "400" }}
          >
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}

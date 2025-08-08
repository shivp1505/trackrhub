import "./globals.css";
import { Instrument_Sans, Inter } from "next/font/google";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Regular, Medium, Bold
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Regular, Medium, Bold
});

export const metadata = {
  title: "TrackrHub",
  description: "Your Personal Growth Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.className}`}>{children}</body>
    </html>
  );
}

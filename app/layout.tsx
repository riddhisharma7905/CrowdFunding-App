import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BackIt — Crowdfunding Platform",
  description:
    "Where bold ideas meet passionate backers. Launch your project and bring your vision to life with community support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-black">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />

      </body>
    </html>
  );
}

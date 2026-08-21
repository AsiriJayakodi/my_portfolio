import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import CosmicBackground from "@/components/CosmicBackground/CosmicBackground";

export const metadata: Metadata = {
  title: "Asiri Indrajith Jayakodi | Portfolio",
  description: "BSc (Hons) in IT Undergraduate at University of Moratuwa. Frontend & Backend Developer, IoT Enthusiast.",
  keywords: [
    "Asiri Indrajith Jayakodi",
    "Asiri Indrajith",
    "Asiri Jayakodi",
    "University of Moratuwa",
    "Portfolio",
    "Web Developer",
    "Full Stack Developer",
    "Software Engineer Sri Lanka",
    "IoT Enthusiast"
  ],
  authors: [{ name: "Asiri Indrajith Jayakodi" }],
  openGraph: {
    title: "Asiri Indrajith Jayakodi | Portfolio",
    description: "BSc (Hons) in IT Undergraduate at University of Moratuwa. Frontend & Backend Developer, IoT Enthusiast.",
    url: "https://asiriindrajith.dev",
    siteName: "Asiri Indrajith Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asiri Indrajith Jayakodi | Portfolio",
    description: "BSc (Hons) in IT Undergraduate at University of Moratuwa. Frontend & Backend Developer, IoT Enthusiast.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <CosmicBackground />
        <SmoothScroll>
          <Navbar />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

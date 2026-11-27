import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CosmicBackground from "@/components/CosmicBackground/CosmicBackground";
import connectToDatabase from "@/lib/db";
import Profile from "@/models/Profile";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

function buildFaviconUrl(url: string, size: number): string {
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com/") || !url.includes(marker)) {
    return url;
  }
  const innerSize = Math.round(size * 0.92);
  const transform = `e_trim/c_fit,w_${innerSize},h_${innerSize}/c_pad,w_${size},h_${size}`;
  return url.replace(marker, `${marker}${transform}/`);
}

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl = "";
  try {
    await connectToDatabase();
    const profile = await Profile.findOne({}, { logoUrl: 1 }).lean<{ logoUrl?: string }>();
    if (profile?.logoUrl) {
      logoUrl = profile.logoUrl;
    }
  } catch {
    // Fallback when DB is unavailable during build
  }

  return {
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
    ...(logoUrl
      ? {
          icons: {
            icon: [
              { url: buildFaviconUrl(logoUrl, 64), sizes: "64x64", type: "image/png" },
              { url: buildFaviconUrl(logoUrl, 128), sizes: "128x128", type: "image/png" },
            ],
            shortcut: buildFaviconUrl(logoUrl, 64),
            apple: { url: buildFaviconUrl(logoUrl, 180), sizes: "180x180", type: "image/png" },
          },
        }
      : {}),
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
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      translate="no"
      data-theme="dark"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} notranslate`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preload" as="image" href="/profile-hero.png" type="image/png" fetchPriority="high" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('portfolio-theme');
                  var theme = saved ? saved : 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <CosmicBackground />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

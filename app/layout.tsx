import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CosmicBackground from "@/components/CosmicBackground/CosmicBackground";

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

export async function generateMetadata(): Promise<Metadata> {
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
    icons: {
      icon: [
        { url: "/api/assets/favicon-16.png?v=2", sizes: "16x16", type: "image/png" },
        { url: "/api/assets/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
        { url: "/api/assets/favicon-64.png?v=2", sizes: "64x64", type: "image/png" },
      ],
      shortcut: "/api/assets/favicon-32.png?v=2",
      apple: { url: "/api/assets/favicon-180.png?v=2", sizes: "180x180", type: "image/png" },
    },
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

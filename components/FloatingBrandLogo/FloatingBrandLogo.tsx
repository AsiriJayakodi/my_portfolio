"use client";

import { useEffect, useState } from "react";
import styles from "./FloatingBrandLogo.module.css";
import { fetchProfileData } from "@/lib/profileClient";

export default function FloatingBrandLogo({
  initialLogoUrl = "",
}: {
  initialLogoUrl?: string;
}) {
  const [logoUrl, setLogoUrl] = useState<string>(initialLogoUrl);

  useEffect(() => {
    let active = true;
    fetchProfileData(!initialLogoUrl)
      .then((data) => {
        if (active && data?.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      })
      .catch(() => {
        // Ignore fetch errors
      });
    return () => {
      active = false;
    };
  }, [initialLogoUrl]);

  if (!logoUrl) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <a
      href="#hero"
      onClick={handleClick}
      className={styles.brandLink}
      aria-label="Scroll to top"
      title="Back to top"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt="AJ Logo"
        className={styles.brandImg}
        draggable={false}
      />
    </a>
  );
}

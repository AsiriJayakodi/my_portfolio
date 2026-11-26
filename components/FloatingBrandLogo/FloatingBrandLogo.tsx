"use client";

import styles from "./FloatingBrandLogo.module.css";

export default function FloatingBrandLogo() {
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
        src="/aj-logo.png"
        alt="AJ Logo"
        className={styles.brandImg}
        draggable={false}
      />
    </a>
  );
}

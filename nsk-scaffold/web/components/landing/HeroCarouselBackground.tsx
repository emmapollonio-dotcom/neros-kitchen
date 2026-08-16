"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const SLIDES = [
  "/images/marketing/hero-risotto.webp",
  "/images/marketing/chef-plating.webp",
  "/images/marketing/dining-event.webp",
];

// Sfondo hero a schermo intero con crossfade automatico + dots, stile
// neroskitchen.co.uk (10 ago 2026). Isolato in un componente client a parte
// così Hero.tsx resta un server component per le traduzioni (getTranslations).
export function HeroCarouselBackground() {
  const [slide, setSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlide((prev) => (prev + 1) % SLIDES.length), 5500);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  return (
    <>
      <div className="absolute inset-0">
        {SLIDES.map((src, i) => (
          <div key={src} className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${slide === i ? "opacity-100" : "opacity-0"}`}>
            <Image src={src} alt="" fill sizes="100vw" priority={i === 0} className="object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--nsk-l-bg)] via-[var(--nsk-l-bg)]/55 to-[var(--nsk-l-bg)]/20" />
      </div>

      <div className="absolute bottom-7 inset-x-0 flex justify-center gap-3 z-10">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            onClick={() => {
              setSlide(i);
              startTimer();
            }}
            aria-label={`Slide ${i + 1}`}
            className="h-2.5 w-2.5 rounded-full transition-all"
            style={{ backgroundColor: slide === i ? "var(--nsk-l-accent)" : "rgba(255,255,255,0.3)" }}
          />
        ))}
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  index?: number;
  className?: string;
}

// Scroll-reveal one-shot come da spec: opacity 0 + translateY(28px) -> 1/0,
// .7s cubic-bezier(0.22,1,0.36,1), stagger ~80ms su index%4, IntersectionObserver
// che si disconnette dopo il primo trigger (threshold 0.15).
export function Reveal({ children, index = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-nsk ${
        visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
    >
      {children}
    </div>
  );
}

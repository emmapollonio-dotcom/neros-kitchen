"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { setTheme } from "@/app/actions/set-theme";
import type { AppTheme } from "@/lib/theme/theme";

interface Props {
  theme: AppTheme;
}

// Toggle chiaro/scuro per tutta l'app (nav condivisa), stesso pattern del
// LanguageSwitcher: server action scrive il cookie NSK_THEME letto da
// app/layout.tsx, poi router.refresh() rirenderizza col nuovo tema — niente
// stato client duplicato, <html> resta l'unica fonte di verità.
export function ThemeToggle({ theme }: Props) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDark = theme === "dark";

  function toggle() {
    const next: AppTheme = isDark ? "light" : "dark";
    startTransition(async () => {
      await setTheme(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={isDark ? t("themeToLight") : t("themeToDark")}
      className="flex h-9 w-9 items-center justify-center rounded-pill text-shell-fg-secondary transition hover:bg-shell-fg/10 hover:text-shell-fg disabled:opacity-60"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

import { useEffect, useState } from "react";

export function useTelegram() {
  const [tg] = useState(() => window.Telegram?.WebApp);

  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();

    const t = tg.themeParams;
    const root = document.documentElement;
    if (t.bg_color) root.style.setProperty("--tg-bg-color", t.bg_color);
    if (t.text_color) root.style.setProperty("--tg-text-color", t.text_color);
    if (t.hint_color) root.style.setProperty("--tg-hint-color", t.hint_color);
    if (t.link_color) root.style.setProperty("--tg-link-color", t.link_color);
    if (t.button_color) root.style.setProperty("--tg-button-color", t.button_color);
    if (t.button_text_color) root.style.setProperty("--tg-button-text-color", t.button_text_color);
    if (t.secondary_bg_color)
      root.style.setProperty("--tg-secondary-bg-color", t.secondary_bg_color);
  }, [tg]);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    isInsideTelegram: Boolean(tg && tg.initData),
    colorScheme: tg?.colorScheme ?? "light",
  };
}

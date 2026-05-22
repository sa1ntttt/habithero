const LEVEL_TITLES: Record<number, string> = {
  1: "Старт",
  2: "Новичок",
  3: "Стойкий",
  4: "Упорный",
  5: "Дисциплинированный",
  6: "Мастер",
  7: "Чемпион",
  8: "Легенда",
  9: "Герой",
  10: "Титан",
};

export function levelTitle(level: number): string {
  if (level in LEVEL_TITLES) return LEVEL_TITLES[level];
  if (level > 10) return "Легенда";
  return "Старт";
}

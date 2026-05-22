// Flat, single-color glyphs (Lucide-style stroke).
// Each takes size + color and renders a minimal SVG.

const stroke = (paths, { size = 28, color = 'currentColor', sw = 1.75, fill = 'none' } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const Glyphs = {
  // Dumbbell
  dumbbell: (p) => stroke(
    <>
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
      <path d="m21.5 21.5-1.4-1.4" />
      <path d="M3.9 3.9 2.5 2.5" />
      <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
    </>, p),

  // Water drop
  droplet: (p) => stroke(
    <path d="M12 2.69 6.34 8.35a8 8 0 1 0 11.32 0z" />, p),

  // Book
  book: (p) => stroke(
    <>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </>, p),

  // Lotus (stylized petals — three arches)
  lotus: (p) => stroke(
    <>
      <path d="M12 21c-5 0-9-3.5-9-7 2 0 3 .8 4 2 .5-2.5 2-4.5 5-7 3 2.5 4.5 4.5 5 7 1-1.2 2-2 4-2 0 3.5-4 7-9 7Z" />
      <path d="M12 9c-1.5 2-2.5 4-3 7" />
      <path d="M12 9c1.5 2 2.5 4 3 7" />
    </>, p),

  // Runner / footprints
  runner: (p) => stroke(
    <>
      <circle cx="14" cy="4.5" r="1.8" />
      <path d="M9 21l2.5-4.5 2-2.5-1.5-3 3-2 2 3h3" />
      <path d="m12 14-3.5 1.5L7 19" />
    </>, p),

  // Brain
  brain: (p) => stroke(
    <>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M12 5v13" />
    </>, p),

  // Pencil
  pencil: (p) => stroke(
    <>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </>, p),

  // Music note
  note: (p) => stroke(
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>, p),

  // Apple
  apple: (p) => stroke(
    <>
      <path d="M12 9c-1.5-3-4.5-3.5-6.5-2C3 8.5 2 12 4 16c1.5 3 4 5 6 5 1.2 0 1.5-.6 2-.6s.8.6 2 .6c2 0 4.5-2 6-5 2-4 1-7.5-1.5-9-2-1.5-5-1-6.5 2Z" />
      <path d="M12 9c0-2 .5-3.5 2-5" />
      <path d="M14 4c-1 0-2 .5-2.5 1.5" />
    </>, p),

  // Moon
  moon: (p) => stroke(
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />, p),

  // Sun
  sun: (p) => stroke(
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>, p),

  // Heart
  heart: (p) => stroke(
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />, p),

  // UI icons
  back: (p) => stroke(<><path d="m15 18-6-6 6-6" /></>, { ...p, sw: 2 }),
  check: (p) => stroke(<><path d="M20 6 9 17l-5-5" /></>, { ...p, sw: 2.4 }),
  bell: (p) => stroke(
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>, p),
  plus: (p) => stroke(<><path d="M5 12h14" /><path d="M12 5v14" /></>, { ...p, sw: 2 }),
  sparkle: (p) => stroke(
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />, p),
};

window.Glyphs = Glyphs;

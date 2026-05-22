// Flat 2D Lucide-style glyphs. Stroke-only, single color, ~24-28px in a 44px tinted square.

const stroke = (paths, { size = 26, sw = 2 } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const Icons = {
  // Dumbbell — fitness
  dumbbell: stroke(<>
    <path d="M6.5 6.5l11 11" />
    <path d="M21 21l-1-1" />
    <path d="M3 3l1 1" />
    <path d="M18 22l4-4" />
    <path d="M2 6l4-4" />
    <path d="M3 10l7-7" />
    <path d="M14 21l7-7" />
  </>),
  // Droplet — water
  droplet: stroke(<>
    <path d="M12 2.5s6.5 6 6.5 11a6.5 6.5 0 1 1-13 0c0-5 6.5-11 6.5-11z" />
  </>),
  // Book — reading
  book: stroke(<>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5V4.5z" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
  </>),
  // Lotus / sparkle — meditation
  lotus: stroke(<>
    <path d="M12 3v4" />
    <path d="M12 21c-4 0-8-2-8-6 2 0 4 1 5 2" />
    <path d="M12 21c4 0 8-2 8-6-2 0-4 1-5 2" />
    <path d="M12 21c-3 0-5-3-5-7 0-2 2-4 5-7 3 3 5 5 5 7 0 4-2 7-5 7z" />
  </>),
  // Running figure
  run: stroke(<>
    <circle cx="17" cy="4" r="2" />
    <path d="M15.5 9l-3 2-2 4 3 2 2 5" />
    <path d="M5 13l3-2 3 1" />
    <path d="M9 18l-3 4" />
  </>),
  // Salad / leaf — healthy eating
  leaf: stroke(<>
    <path d="M3.5 20.5c2-9 8-15 17-17-1 9-7 16-17 17z" />
    <path d="M3.5 20.5l9-9" />
  </>),
  // Languages / chat bubble with A
  languages: stroke(<>
    <path d="M5 8h6" />
    <path d="M8 5v3" />
    <path d="M5 12c0-1 1.5-4 3-4s3 3 3 4-1 2-3 2-3-1-3-2z" />
    <path d="M11.5 19h7l-3.5-9-3.5 9z" />
    <path d="M13 16h4" />
  </>),
  // Moon — sleep
  moon: stroke(<>
    <path d="M20.5 14a8.5 8.5 0 1 1-10.5-11 7 7 0 0 0 10.5 11z" />
  </>),
  // Nav icons
  home: stroke(<>
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z" />
  </>, { size: 22, sw: 1.8 }),
  list: stroke(<>
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </>, { size: 22, sw: 1.8 }),
  stats: stroke(<>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </>, { size: 22, sw: 1.8 }),
  users: stroke(<>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>, { size: 22, sw: 1.8 }),
  user: stroke(<>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>, { size: 22, sw: 1.8 }),
  chevron: stroke(<>
    <path d="M9 6l6 6-6 6" />
  </>, { size: 16, sw: 2 }),
  plus: stroke(<>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>, { size: 16, sw: 2.4 }),
  flame: stroke(<>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 3-1 3-3 0-1-.5-2-1-3 2 0 4 2 4 5a6 6 0 0 1-12 0c0-2 1-4 2-5 .5 1 1 2 1 3z" />
  </>, { size: 12, sw: 1.8 }),
};

window.Icons = Icons;

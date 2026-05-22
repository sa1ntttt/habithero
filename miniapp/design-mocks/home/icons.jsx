// HabitHero — flat 2D icon set (Linear / Notion style)
// Soft tinted rounded-square container + single-color minimal glyph.
// No gradients, no inner shadows, no outer glow.

// Per-tone palette: [accentSolid, bgRgbaTint]
const TONE = {
  fitness:    { accent: '#F97316', bg: 'rgba(249,115,22,0.14)' },
  water:      { accent: '#38BDF8', bg: 'rgba(56,189,248,0.14)' },
  reading:    { accent: '#F59E0B', bg: 'rgba(245,158,11,0.13)' },
  meditation: { accent: '#A78BFA', bg: 'rgba(167,139,250,0.14)' },
  running:    { accent: '#22D3EE', bg: 'rgba(34,211,238,0.14)' },
  fire:       { accent: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
  stats:      { accent: '#22D3EE', bg: 'rgba(34,211,238,0.12)' },
  trophy:     { accent: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  success:    { accent: '#34D399', bg: 'rgba(52,211,153,0.13)' },
  brand:      { accent: '#A78BFA', bg: 'rgba(167,139,250,0.14)' },
};

// ─── Flat rounded-square tile ─────────────────────────────────
function FlatTile({ tone = 'brand', size = 44, radius = 13, children, style = {} }) {
  const t = TONE[tone] || TONE.brand;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius,
        flexShrink: 0,
        background: t.bg,
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Glyphs — single accent color, ~1.8 stroke, minimalist ────
const sw = 1.8;

function GlyphDumbbell({ s = 22, c }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 10v4M5.5 8.5v7M18.5 8.5v7M21 10v4M8 12h8" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}
function GlyphDroplet({ s = 22, c }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5c2.6 3.4 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3.4-7.1 6-10.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
}
function GlyphBook({ s = 22, c }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 4h6v16H6.5A1.5 1.5 0 0 1 5 18.5v-14ZM19 4h-6v16h4.5a1.5 1.5 0 0 0 1.5-1.5v-14Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
}
function GlyphLotus({ s = 22, c }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5.5c-1.4 2.2-1.4 5 0 7.5 1.4-2.5 1.4-5.3 0-7.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M5 10c.5 2.6 2.8 4.8 6 5.5-.5-2.6-2.8-4.8-6-5.5ZM19 10c-.5 2.6-2.8 4.8-6 5.5.5-2.6 2.8-4.8 6-5.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M3.5 14c2 3 5.5 4.5 8.5 4.5s6.5-1.5 8.5-4.5" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}
function GlyphRunner({ s = 22, c }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="15.5" cy="4.5" r="1.8" stroke={c} strokeWidth={sw} />
      <path d="M7.5 20l2.5-4.5 2.5 1.5 1-4.5 2.5 2.5h2M9 12l2.5-3 3 1.5" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GlyphFire({ s = 20, c }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5c.8 2.4 3.5 3.8 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2 1.2-2.5 0 1.3.5 1.8 1 1.8-.2-1.8-.8-3 1.3-6.8Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
}
function GlyphBars({ s = 20, c }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 19v-5M12 19v-9M19 19v-13" stroke={c} strokeWidth={sw + 0.4} strokeLinecap="round" />
    </svg>
  );
}
function GlyphTrophy({ s = 20, c }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M8 6H5.5a2 2 0 0 0 2.5 3M16 6h2.5a2 2 0 0 1-2.5 3" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <path d="M12 12.5v3.5M9.5 19.5h5M10.5 17h3" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}
function GlyphCheck({ s = 18, color = 'white' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GlyphPlus({ s = 16, color = 'white' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Tile wrappers — flat, rounded-square, tinted ─────────────
function makeIcon(tone, Glyph) {
  return function Icon({ size = 44 }) {
    const radius = Math.round(size * 0.30);
    const glyphSize = Math.round(size * 0.62);
    return (
      <FlatTile tone={tone} size={size} radius={radius}>
        <Glyph s={glyphSize} c={TONE[tone].accent} />
      </FlatTile>
    );
  };
}

const IconDumbbell = makeIcon('fitness',    GlyphDumbbell);
const IconDroplet  = makeIcon('water',      GlyphDroplet);
const IconBook     = makeIcon('reading',    GlyphBook);
const IconLotus    = makeIcon('meditation', GlyphLotus);
const IconRunner   = makeIcon('running',    GlyphRunner);
const IconFire     = makeIcon('fire',       GlyphFire);
const IconBars     = makeIcon('stats',      GlyphBars);
const IconTrophy   = makeIcon('trophy',     GlyphTrophy);

// ─── Bottom nav — pure outlined glyphs, no containers ─────────
const NAV_ACTIVE = '#A78BFA';
const NAV_IDLE   = '#52525B';

function NavHome({ active }) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-7 8 7v8a1.5 1.5 0 0 1-1.5 1.5H15v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19v-8Z"
        stroke={c} strokeWidth="1.7" strokeLinejoin="round"
        fill={active ? 'rgba(167,139,250,0.15)' : 'none'} />
    </svg>
  );
}
function NavHabits({ active }) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h12M4 12h12M4 18h12" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="19.5" cy="6"  r="1.4" fill={c} />
      <circle cx="19.5" cy="12" r="1.4" fill={c} />
      <circle cx="19.5" cy="18" r="1.4" fill={c} />
    </svg>
  );
}
function NavStats({ active }) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 19v-4M12 19v-9M19 19v-14" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function NavFriends({ active }) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8.5" r="3" stroke={c} strokeWidth="1.7" />
      <circle cx="17" cy="10" r="2.2" stroke={c} strokeWidth="1.7" />
      <path d="M3.5 19c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 19c.3-1.7 1.5-2.8 3-2.8s2.4 1 2.7 2.3" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function NavProfile({ active }) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.2" stroke={c} strokeWidth="1.7" />
      <path d="M4.5 19.5c1-3.4 4-5 7.5-5s6.5 1.6 7.5 5" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

// ─── Header chevrons ──────────────────────────────────────────
function ChevLeft({ s = 17 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

Object.assign(window, {
  FlatTile, TONE,
  GlyphDumbbell, GlyphDroplet, GlyphBook, GlyphLotus, GlyphRunner,
  GlyphFire, GlyphBars, GlyphTrophy, GlyphCheck, GlyphPlus,
  IconDumbbell, IconDroplet, IconBook, IconLotus, IconRunner,
  IconFire, IconBars, IconTrophy,
  NavHome, NavHabits, NavStats, NavFriends, NavProfile,
  ChevLeft,
});

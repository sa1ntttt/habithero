import { NavLink } from "react-router-dom";

const NAV_ACTIVE = "#A78BFA";
const NAV_IDLE = "#52525B";

type GlyphProps = { active: boolean };

function NavHome({ active }: GlyphProps) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11l8-7 8 7v8a1.5 1.5 0 0 1-1.5 1.5H15v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19v-8Z"
        stroke={c}
        strokeWidth="1.7"
        strokeLinejoin="round"
        fill={active ? "rgba(167,139,250,0.15)" : "none"}
      />
    </svg>
  );
}

function NavHabits({ active }: GlyphProps) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h12M4 12h12M4 18h12" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="19.5" cy="6" r="1.4" fill={c} />
      <circle cx="19.5" cy="12" r="1.4" fill={c} />
      <circle cx="19.5" cy="18" r="1.4" fill={c} />
    </svg>
  );
}

function NavStats({ active }: GlyphProps) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 19v-4M12 19v-9M19 19v-14" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NavFriends({ active }: GlyphProps) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8.5" r="3" stroke={c} strokeWidth="1.7" />
      <circle cx="17" cy="10" r="2.2" stroke={c} strokeWidth="1.7" />
      <path
        d="M3.5 19c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4"
        stroke={c}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16 19c.3-1.7 1.5-2.8 3-2.8s2.4 1 2.7 2.3"
        stroke={c}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavProfile({ active }: GlyphProps) {
  const c = active ? NAV_ACTIVE : NAV_IDLE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.2" stroke={c} strokeWidth="1.7" />
      <path
        d="M4.5 19.5c1-3.4 4-5 7.5-5s6.5 1.6 7.5 5"
        stroke={c}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const items = [
  { to: "/", label: "Дом", Icon: NavHome, end: true },
  { to: "/habits", label: "Привычки", Icon: NavHabits, end: false },
  { to: "/stats", label: "Стата", Icon: NavStats, end: true },
  { to: "/friends", label: "Друзья", Icon: NavFriends, end: true },
  { to: "/profile", label: "Профиль", Icon: NavProfile, end: true },
];

export function Navigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-line"
      style={{
        background: "rgba(10,10,15,0.78)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto flex max-w-md px-1">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex flex-1 flex-col items-center gap-[3px] pt-2 pb-1.5 no-underline"
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 500,
                    color: isActive ? NAV_ACTIVE : "#71717A",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <span
                    className="absolute"
                    style={{
                      bottom: -2,
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: NAV_ACTIVE,
                      boxShadow: `0 0 8px ${NAV_ACTIVE}`,
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

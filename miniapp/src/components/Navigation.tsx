import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "🏠", title: "Дом" },
  { to: "/habits", label: "📋", title: "Привычки" },
  { to: "/stats", label: "📊", title: "Стата" },
  { to: "/friends", label: "👥", title: "Друзья" },
  { to: "/profile", label: "👤", title: "Профиль" },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-black/10 bg-tg-bg pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 text-[10px] ${
                  isActive ? "text-brand-600 font-semibold" : "text-tg-hint"
                }`
              }
            >
              <span className="text-xl leading-none">{it.label}</span>
              <span className="mt-1">{it.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

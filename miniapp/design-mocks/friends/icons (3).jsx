// Flat 2D Lucide-style icons (single-color glyphs).
// Each is a stateless component accepting {size, strokeWidth, className, style}.

const Icon = ({ children, size = 20, strokeWidth = 2, className = "", style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style}
    aria-hidden="true"
  >{children}</svg>
);

const IconShare    = (p) => <Icon {...p}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></Icon>;
const IconCopy     = (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>;
const IconHeartHandshake = (p) => <Icon {...p}>
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  <path d="m12 5 .5.5"/>
  <path d="M11 13l3 3 3-3"/>
</Icon>;
const IconChevronRight = (p) => <Icon {...p}><polyline points="9 18 15 12 9 6"/></Icon>;
const IconUsersRound = (p) => <Icon {...p}>
  <path d="M18 21a8 8 0 0 0-16 0"/>
  <circle cx="10" cy="8" r="5"/>
  <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>
</Icon>;
const IconPlus = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const IconDroplet = (p) => <Icon {...p}><path d="M12 2.69 5.64 9.04a8 8 0 1 0 12.72 0L12 2.69Z"/></Icon>;
const IconRun = (p) => <Icon {...p}>
  <circle cx="13" cy="4" r="2"/>
  <path d="m5 22 4-7 3 2 3-6 3 4 3-1"/>
  <path d="M9 10 7 14"/>
</Icon>;
const IconFlame = (p) => <Icon {...p}>
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
</Icon>;
const IconCheck = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>;
const IconCheckCircle = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
const IconMedal = (p) => <Icon {...p}>
  <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/>
  <path d="M11 12 5.12 2.2"/>
  <path d="m13 12 5.88-9.8"/>
  <path d="M8 7h8"/>
  <circle cx="12" cy="17" r="5"/>
  <path d="M12 18v-2h-.5"/>
</Icon>;
const IconActivity = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>;
const IconClipboardList = (p) => <Icon {...p}>
  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
</Icon>;
const IconHome = (p) => <Icon {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>;
const IconTarget = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const IconBarChart = (p) => <Icon {...p}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Icon>;
const IconUserCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.66a8 8 0 0 1 10 0"/></Icon>;
const IconUsers = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const IconStar = (p) => <Icon {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
const IconBolt = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;
const IconDots = (p) => <Icon {...p}><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></Icon>;
const IconX = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>;
const IconSparkle = (p) => <Icon {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></Icon>;
const IconSignal = (p) => <Icon {...p}>
  <rect x="2"  y="14" width="3" height="6" rx="1"/>
  <rect x="7"  y="11" width="3" height="9" rx="1"/>
  <rect x="12" y="8"  width="3" height="12" rx="1"/>
  <rect x="17" y="5"  width="3" height="15" rx="1"/>
</Icon>;
const IconWifi = (p) => <Icon {...p}>
  <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
  <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
  <line x1="12" y1="20" x2="12" y2="20"/>
</Icon>;
const IconBattery = (p) => <Icon {...p} strokeWidth={1.8}>
  <rect x="1" y="7" width="18" height="10" rx="2.2" ry="2.2"/>
  <line x1="22" y1="11" x2="22" y2="13"/>
  <rect x="3" y="9" width="14" height="6" rx="1" ry="1" fill="currentColor" stroke="none"/>
</Icon>;

Object.assign(window, {
  Icon, IconShare, IconCopy, IconHeartHandshake, IconChevronRight,
  IconUsersRound, IconPlus, IconDroplet, IconRun, IconFlame, IconCheck,
  IconCheckCircle, IconMedal, IconActivity, IconClipboardList,
  IconHome, IconTarget, IconBarChart, IconUserCircle, IconUsers,
  IconStar, IconBolt, IconDots, IconX, IconSparkle,
  IconSignal, IconWifi, IconBattery
});

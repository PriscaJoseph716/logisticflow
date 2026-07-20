import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  Hexagon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  Truck,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  "my-work": ClipboardList,
  "assign-work": UserPlus,
  fleet: Truck,
  shipments: Package,
  deliveries: MapPin,
  customers: Users,
  suppliers: Building2,
  maintenance: Wrench,
  billing: CreditCard,
  reports: BarChart3,
  settings: Settings,
};

function initials(name = "") {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "LF";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function Sidebar({
  items,
  currentPage,
  onNavigate,
  open,
  mobileOpen,
  isMobile,
  onClose,
  userName = "",
  userRole = "Owner",
  onLogout,
}) {
  const expanded = isMobile ? mobileOpen : open;
  const displayName = String(userName ?? "").trim() || "User";
  const displayRole = String(userRole ?? "").trim() || "Owner";

  return (
    <>
      {isMobile && mobileOpen ? <button type="button" className="sidebar-overlay" onClick={onClose} aria-label="Close sidebar" /> : null}
      <aside className={`sidebar ${expanded ? "open" : "collapsed"} ${isMobile ? "mobile" : "desktop"}`}>
        <div className="brand-block">
          <div className="brand-mark">
            <Hexagon size={18} />
          </div>
          <div className="brand-copy">
            <div className="brand-name">LOGISTICSFLOW</div>
            <div className="brand-tag">Smart Logistics SaaS</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = iconMap[item.id] ?? LayoutDashboard;
            const active = currentPage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${active ? "active" : ""}`}
                aria-label={item.label}
                title={!expanded && !isMobile ? item.label : undefined}
                data-tooltip={!expanded && !isMobile ? item.label : undefined}
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobile) onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="avatar" aria-hidden="true">
            {initials(displayName)}
          </div>
          <div className="sidebar-user-copy">
            <strong title={displayName}>{displayName}</strong>
            <span title={displayRole}>{displayRole}</span>
          </div>
          <button
            type="button"
            className="icon-button muted"
            aria-label="Log out"
            title={!expanded && !isMobile ? "Log out" : undefined}
            data-tooltip={!expanded && !isMobile ? "Log out" : undefined}
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                onNavigate("login");
              }
              if (isMobile) onClose();
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

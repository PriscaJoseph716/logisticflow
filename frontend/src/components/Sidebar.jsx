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
  PanelLeftClose,
  PanelLeftOpen,
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

export default function Sidebar({ items, currentPage, onNavigate, open, mobileOpen, isMobile, onToggle, onClose }) {
  const expanded = isMobile ? mobileOpen : open;

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
          <button
            type="button"
            className="icon-button sidebar-toggle-inline"
            onClick={onToggle}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
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
          <div className="avatar">LF</div>
          <div className="sidebar-user-copy">
            <strong>Ops Manager</strong>
            <span>Administrator</span>
          </div>
          <button
            type="button"
            className="icon-button muted"
            aria-label="Log out"
            title={!expanded && !isMobile ? "Log out" : undefined}
            data-tooltip={!expanded && !isMobile ? "Log out" : undefined}
            onClick={() => {
              onNavigate("login");
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

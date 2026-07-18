import {
  BarChart3,
  Building2,
  CreditCard,
  Hexagon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  Truck,
  Users,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  fleet: Truck,
  shipments: Package,
  deliveries: MapPin,
  customers: Users,
  suppliers: Building2,
  billing: CreditCard,
  reports: BarChart3,
  settings: Settings,
};

export default function Sidebar({ items, currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">
          <Hexagon size={18} />
        </div>
        <div>
          <div className="brand-name">LOGISTICSFLOW</div>
          <div className="brand-tag">Smart Logistics SaaS</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = iconMap[item.id];
          const active = currentPage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
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
        <button type="button" className="icon-button muted" onClick={() => onNavigate("login")}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

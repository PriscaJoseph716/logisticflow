import {
  CreditCard,
  LayoutDashboard,
  MapPin,
  Settings,
  Truck,
} from "lucide-react";

const defaultItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "fleet", label: "Fleet", icon: Truck },
  { id: "deliveries", label: "Track", icon: MapPin },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "More", icon: Settings },
];

const iconMap = Object.fromEntries(defaultItems.map((item) => [item.id, item.icon]));

export default function MobileNav({ currentPage, items = defaultItems, onNavigate }) {
  return (
    <nav className="mobile-nav">
      {items.map((item) => {
        const Icon = item.icon ?? iconMap[item.id] ?? LayoutDashboard;
        const active = currentPage === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item ${active ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

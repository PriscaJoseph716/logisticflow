import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Box,
  Building2,
  CheckCircle2,
  Clock3,
  Package,
  Phone,
  Plus,
  Route,
  Search,
  Settings,
  TrendingUp,
  Truck,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import { initialData, navigation } from "./data/mockData";

const translations = {
  en: {
    pages: {
      dashboard: "Dashboard",
      fleet: "Fleet",
      shipments: "Shipments",
      deliveries: "Deliveries",
      customers: "Customers",
      suppliers: "Suppliers",
      billing: "Billing",
      reports: "Reports",
      settings: "Settings",
    },
    nav: {
      dashboard: "Dashboard",
      fleet: "Fleet",
      shipments: "Shipments",
      deliveries: "Deliveries",
      customers: "Customers",
      suppliers: "Suppliers",
      billing: "Billing",
      reports: "Reports",
      settings: "Settings",
    },
    mobile: {
      dashboard: "Home",
      fleet: "Fleet",
      deliveries: "Track",
      billing: "Billing",
      settings: "More",
    },
    common: {
      save: "Save",
      saveChanges: "Save Changes",
      cancel: "Cancel",
      close: "Close",
      search: "Search",
      add: "Add",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      language: "Language",
      english: "English",
      swahili: "Swahili",
      all: "All",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      byDate: "By Date",
      date: "Date",
      cleared: "Cleared",
      fullyPaid: "Fully paid",
      remaining: "remaining",
      paid: "paid",
    },
    auth: {
      signupTag: "Launch your logistics workspace",
      signupTitle: "Create account",
      signupText: "Set up your operations hub for fleet, dispatch, billing, and reporting.",
      companyName: "Company name",
      email: "Email",
      password: "Password",
      createAccount: "Create account",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
      loginTag: "Real-time logistics control center",
      welcome: "Welcome back",
      loginText: "Sign in to monitor fleet activity, shipments, deliveries, and billing.",
      needAccount: "Need an account?",
      createOne: "Create one",
    },
    status: {
      active: "Active",
      maintenance: "Maintenance",
      pending: "Pending",
      transit: "In transit",
      delivered: "Delivered",
    },
    deliveryType: {
      warehouse: "Warehouse",
      distribution: "Distribution",
      hub: "Hub",
    },
    dashboard: {
      intro: "Everything moving across your logistics network today.",
      totalDeliveries: "Total Deliveries",
      revenueCollected: "Collected Revenue",
      outstanding: "Outstanding",
      activeFleet: "Active Fleet",
      operationsTitle: "Operations Overview",
      operationsText: "A simple summary of what the team needs to focus on today.",
      completedRuns: "Completed deliveries",
      transitRuns: "Deliveries in transit",
      pendingRuns: "Pending dispatch",
      activeCustomers: "Active customers",
      deliveryStatus: "Delivery Status",
      deliveryStatusText: "Current service distribution.",
      recentActivity: "Recent Activity",
      recentActivityText: "Live updates from your operations team.",
      viewAll: "View all",
      activity1Title: "Delivery completed",
      activity1Text: "LFG-2104 arrived at Abuja Retail Center",
      activity2Title: "Route optimized",
      activity2Text: "Tema to Kumasi lane shortened by 18 km",
      activity3Title: "Invoice paid",
      activity3Text: "SwiftMart Retail settled March invoice",
      activity4Title: "Vehicle maintenance",
      activity4Text: "LFG-4478 is unavailable pending inspection",
      time1: "3 min ago",
      time2: "20 min ago",
      time3: "1 hr ago",
      time4: "4 hrs ago",
    },
    fleet: {
      intro: "Manage vehicles, drivers, and route readiness.",
      addVehicle: "Add Vehicle",
      editVehicle: "Edit Vehicle",
      viewDetails: "View Details",
      deleteVehicle: "Delete Vehicle",
      allVehicles: "All",
      owned: "Owned",
      rented: "Rented",
      category: "Category",
      completedRoutes: "completed routes",
      setMaintenance: "Set maintenance",
      activate: "Activate",
      headTruckPlate: "Head truck plate",
      trailerPlate: "Container / trailer plate",
      driverContact: "Driver contact",
      licenseNumber: "License number",
      vehicleDetails: "Vehicle Details",
    },
    shipments: {
      intro: "Create and track shipments from origin to destination.",
      newShipment: "New Shipment",
      status: "Status",
      supplier: "Supplier",
      customer: "Customer",
      assignVehicle: "Assign Vehicle",
      availableVehicles: "Available vehicles",
      noAvailableVehicles: "No active vehicle is available right now.",
      emptyTitle: "No active shipments",
      emptyText: "Shipments will appear here once assigned.",
    },
    deliveries: {
      intro: "Review delivery history in a simple table view.",
      filterLabel: "Filter",
      origin: "Origin",
      destination: "Destination",
      vehicle: "Vehicle",
      quantity: "Quantity",
      historyDate: "Date",
      emptyTitle: "No deliveries found",
      emptyText: "No delivered shipments match this date filter.",
      eta: "ETA",
      start: "Start",
      complete: "Complete",
    },
    customers: {
      intro: "Keep customer profiles and contacts organized.",
      addCustomer: "Add Customer",
      editCustomer: "Edit Customer",
      customerId: "ID",
      shipmentsCount: "Shipments",
    },
    suppliers: {
      intro: "Manage cement suppliers and industry pricing.",
      addSupplier: "Add Supplier",
      editSupplier: "Edit Supplier",
      supplierId: "ID",
      buyingPrice: "Buying Price",
      sellingPrice: "Selling Price",
    },
    billing: {
      intro: "Track invoices, payments, and outstanding balances.",
      recordPayment: "Record Payment",
      totalOwed: "Total Owed",
      collected: "Collected",
      outstanding: "Outstanding",
    },
    reports: {
      intro: "Analytics for collections, shipment volume, and outstanding balances.",
      totalRevenue: "Total Revenue",
      orders: "Orders",
      avgOrder: "Average Order",
      collectionsTitle: "Collections Summary",
      collectionsText: "A simple billing snapshot without a graph.",
      paidInvoices: "Fully paid invoices",
      openInvoices: "Open invoices",
      clearedCustomers: "Cleared customers",
      outstandingByCustomer: "Outstanding by Customer",
      outstandingText: "Open balances that still need collection.",
    },
    settings: {
      intro: "Configure your workspace, team access, and contact details.",
      companyProfile: "Company Profile",
      supportEmail: "Support email",
      phone: "Phone",
      workspaceType: "Workspace type",
      teamRoles: "Team Roles",
      inviteUser: "Invite User",
      administrator: "Administrator",
      enterprise: "Enterprise logistics SaaS",
    },
    modal: {
      addVehicle: "Add Vehicle",
      editVehicle: "Edit Vehicle",
      vehicleDetails: "Vehicle Details",
      createShipment: "Create Shipment",
      addCustomer: "Add Customer",
      editCustomer: "Edit Customer",
      addSupplier: "Add Supplier",
      editSupplier: "Edit Supplier",
      recordPayment: "Record Payment",
      headPlateNumber: "Head truck plate number",
      trailerPlateNumber: "Container / trailer plate number",
      vehicleCategory: "Vehicle category",
      driverName: "Driver name",
      driverContact: "Driver contact",
      licenseNumber: "License number",
      origin: "Origin",
      destination: "Destination",
      quantity: "Quantity",
      vehicle: "Vehicle",
      customer: "Customer",
      supplier: "Supplier",
      amount: "Amount",
      location: "Location",
      phone: "Phone",
      buyingPrice: "Buying Price",
      sellingPrice: "Selling Price",
    },
    toast: {
      fillFleet: "Please complete all fleet fields",
      fleetAdded: "Fleet vehicle added",
      fleetUpdated: "Fleet vehicle updated",
      fleetDeleted: "Fleet vehicle deleted",
      confirmFleetDelete: "Delete this vehicle from the fleet?",
      fillShipment: "Please complete all shipment fields",
      shipmentCreated: "Shipment created",
      shipmentStatusUpdated: "Shipment status updated",
      fillCustomer: "Please complete all customer fields",
      customerAdded: "Customer added",
      customerUpdated: "Customer updated",
      fillSupplier: "Please complete all supplier fields",
      supplierAdded: "Supplier added",
      supplierUpdated: "Supplier updated",
      fillPayment: "Enter a customer and amount",
      paymentRecorded: "Payment recorded",
      signedIn: "Signed in successfully",
      workspaceCreated: "Workspace created successfully",
      deliveryUpdated: "Delivery updated",
    },
  },
  sw: {
    pages: {
      dashboard: "Dashibodi",
      fleet: "Magari",
      shipments: "Mizigo",
      deliveries: "Uwasilishaji",
      customers: "Wateja",
      suppliers: "Wasambazaji",
      billing: "Malipo",
      reports: "Ripoti",
      settings: "Mipangilio",
    },
    nav: {
      dashboard: "Dashibodi",
      fleet: "Magari",
      shipments: "Mizigo",
      deliveries: "Uwasilishaji",
      customers: "Wateja",
      suppliers: "Wasambazaji",
      billing: "Malipo",
      reports: "Ripoti",
      settings: "Mipangilio",
    },
    mobile: {
      dashboard: "Nyumbani",
      fleet: "Magari",
      deliveries: "Fuatilia",
      billing: "Malipo",
      settings: "Zaidi",
    },
    common: {
      save: "Hifadhi",
      saveChanges: "Hifadhi Mabadiliko",
      cancel: "Ghairi",
      close: "Funga",
      search: "Tafuta",
      add: "Ongeza",
      create: "Tengeneza",
      edit: "Hariri",
      delete: "Futa",
      view: "Tazama",
      language: "Lugha",
      english: "Kiingereza",
      swahili: "Kiswahili",
      all: "Zote",
      today: "Leo",
      thisWeek: "Wiki hii",
      thisMonth: "Mwezi huu",
      byDate: "Kwa tarehe",
      date: "Tarehe",
      cleared: "Imelipwa",
      fullyPaid: "Imelipwa yote",
      remaining: "imebaki",
      paid: "imelipwa",
    },
    auth: {
      signupTag: "Anzisha mfumo wako wa usafirishaji",
      signupTitle: "Fungua akaunti",
      signupText: "Sanidi kituo chako cha magari, dispatch, malipo na ripoti.",
      companyName: "Jina la kampuni",
      email: "Barua pepe",
      password: "Nenosiri",
      createAccount: "Tengeneza akaunti",
      alreadyHaveAccount: "Una akaunti tayari?",
      signIn: "Ingia",
      loginTag: "Kituo cha usimamizi wa usafirishaji kwa wakati halisi",
      welcome: "Karibu tena",
      loginText: "Ingia kufuatilia magari, mizigo, uwasilishaji na malipo.",
      needAccount: "Unahitaji akaunti?",
      createOne: "Tengeneza moja",
    },
    status: {
      active: "Hai",
      maintenance: "Matengenezo",
      pending: "Inasubiri",
      transit: "Njiani",
      delivered: "Imewasilishwa",
    },
    deliveryType: {
      warehouse: "Ghala",
      distribution: "Usambazaji",
      hub: "Kituo",
    },
    dashboard: {
      intro: "Hivi ndivyo vinavyoendelea kwenye mtandao wako wa usafirishaji leo.",
      totalDeliveries: "Jumla ya Uwasilishaji",
      revenueCollected: "Mapato Yaliyokusanywa",
      outstanding: "Deni Lililobaki",
      activeFleet: "Magari Hai",
      operationsTitle: "Muhtasari wa Uendeshaji",
      operationsText: "Muhtasari rahisi wa mambo muhimu ya kufuatilia leo.",
      completedRuns: "Uwasilishaji uliokamilika",
      transitRuns: "Uwasilishaji ulioko njiani",
      pendingRuns: "Dispatch zinazosubiri",
      activeCustomers: "Wateja hai",
      deliveryStatus: "Hali ya Uwasilishaji",
      deliveryStatusText: "Mgawanyo wa huduma kwa sasa.",
      recentActivity: "Shughuli za Karibuni",
      recentActivityText: "Taarifa za moja kwa moja kutoka kwa timu ya uendeshaji.",
      viewAll: "Ona zote",
      activity1Title: "Uwasilishaji umekamilika",
      activity1Text: "LFG-2104 imefika Abuja Retail Center",
      activity2Title: "Njia imeboreshwa",
      activity2Text: "Njia ya Tema hadi Kumasi imepunguzwa kwa km 18",
      activity3Title: "Ankara imelipwa",
      activity3Text: "SwiftMart Retail imelipa ankara ya Machi",
      activity4Title: "Gari kwenye matengenezo",
      activity4Text: "LFG-4478 halipatikani hadi ukaguzi ukamilike",
      time1: "dakika 3 zilizopita",
      time2: "dakika 20 zilizopita",
      time3: "saa 1 iliyopita",
      time4: "saa 4 zilizopita",
    },
    fleet: {
      intro: "Simamia magari, madereva na utayari wa safari.",
      addVehicle: "Ongeza Gari",
      editVehicle: "Hariri Gari",
      viewDetails: "Tazama Maelezo",
      deleteVehicle: "Futa Gari",
      allVehicles: "Yote",
      owned: "Yanayomilikiwa",
      rented: "Ya kukodi",
      category: "Aina",
      completedRoutes: "safari zilizokamilika",
      setMaintenance: "Weka matengenezo",
      activate: "Washa",
      headTruckPlate: "Namba ya kichwa cha lori",
      trailerPlate: "Namba ya kontena / tela",
      driverContact: "Mawasiliano ya dereva",
      licenseNumber: "Namba ya leseni",
      vehicleDetails: "Maelezo ya Gari",
    },
    shipments: {
      intro: "Tengeneza na fuatilia mizigo kutoka mwanzo hadi mwisho.",
      newShipment: "Mzigo Mpya",
      status: "Hali",
      supplier: "Msambazaji",
      customer: "Mteja",
      assignVehicle: "Pangia Gari",
      availableVehicles: "Magari yanayopatikana",
      noAvailableVehicles: "Hakuna gari hai linalopatikana kwa sasa.",
      emptyTitle: "Hakuna mizigo hai",
      emptyText: "Mizigo itaonekana hapa baada ya kupangiwa.",
    },
    deliveries: {
      intro: "Pitia historia ya uwasilishaji kwenye jedwali rahisi.",
      filterLabel: "Kichujio",
      origin: "Mwanzo",
      destination: "Mwisho",
      vehicle: "Gari",
      quantity: "Kiasi",
      historyDate: "Tarehe",
      emptyTitle: "Hakuna uwasilishaji uliopatikana",
      emptyText: "Hakuna mizigo iliyowasilishwa inayolingana na kichujio hiki cha tarehe.",
      eta: "Muda wa kufika",
      start: "Anza",
      complete: "Kamilisha",
    },
    customers: {
      intro: "Weka taarifa za wateja na mawasiliano kwa mpangilio.",
      addCustomer: "Ongeza Mteja",
      editCustomer: "Hariri Mteja",
      customerId: "ID",
      shipmentsCount: "Mizigo",
    },
    suppliers: {
      intro: "Simamia wasambazaji wa saruji na bei zao.",
      addSupplier: "Ongeza Msambazaji",
      editSupplier: "Hariri Msambazaji",
      supplierId: "ID",
      buyingPrice: "Bei ya kununua",
      sellingPrice: "Bei ya kuuza",
    },
    billing: {
      intro: "Fuatilia ankara, malipo na deni lililobaki.",
      recordPayment: "Rekodi Malipo",
      totalOwed: "Jumla ya Deni",
      collected: "Yaliyokusanywa",
      outstanding: "Linalobaki",
    },
    reports: {
      intro: "Ripoti za makusanyo, idadi ya mizigo na salio lililobaki.",
      totalRevenue: "Jumla ya Mapato",
      orders: "Maagizo",
      avgOrder: "Wastani wa Oda",
      collectionsTitle: "Muhtasari wa Makusanyo",
      collectionsText: "Muhtasari rahisi wa malipo bila grafu.",
      paidInvoices: "Ankara zilizolipwa",
      openInvoices: "Ankara wazi",
      clearedCustomers: "Wateja waliomaliza malipo",
      outstandingByCustomer: "Salio kwa Kila Mteja",
      outstandingText: "Madeni ambayo bado yanahitaji kukusanywa.",
    },
    settings: {
      intro: "Sanidi mfumo wako, ruhusa za timu na mawasiliano.",
      companyProfile: "Taarifa za Kampuni",
      supportEmail: "Barua pepe ya msaada",
      phone: "Simu",
      workspaceType: "Aina ya mfumo",
      teamRoles: "Majukumu ya Timu",
      inviteUser: "Alika Mtumiaji",
      administrator: "Msimamizi",
      enterprise: "Mfumo wa biashara wa usafirishaji",
    },
    modal: {
      addVehicle: "Ongeza Gari",
      editVehicle: "Hariri Gari",
      vehicleDetails: "Maelezo ya Gari",
      createShipment: "Tengeneza Mzigo",
      addCustomer: "Ongeza Mteja",
      editCustomer: "Hariri Mteja",
      addSupplier: "Ongeza Msambazaji",
      editSupplier: "Hariri Msambazaji",
      recordPayment: "Rekodi Malipo",
      headPlateNumber: "Namba ya kichwa cha lori",
      trailerPlateNumber: "Namba ya kontena / tela",
      vehicleCategory: "Aina ya gari",
      driverName: "Jina la dereva",
      driverContact: "Mawasiliano ya dereva",
      licenseNumber: "Namba ya leseni",
      origin: "Mwanzo",
      destination: "Mwisho",
      quantity: "Kiasi",
      vehicle: "Gari",
      customer: "Mteja",
      supplier: "Msambazaji",
      amount: "Kiasi cha fedha",
      location: "Mahali",
      phone: "Simu",
      buyingPrice: "Bei ya kununua",
      sellingPrice: "Bei ya kuuza",
    },
    toast: {
      fillFleet: "Tafadhali jaza taarifa zote za gari",
      fleetAdded: "Gari limeongezwa",
      fleetUpdated: "Taarifa za gari zimesasishwa",
      fleetDeleted: "Gari limefutwa",
      confirmFleetDelete: "Ufute gari hili kutoka kwenye mfumo?",
      fillShipment: "Tafadhali jaza taarifa zote za mzigo",
      shipmentCreated: "Mzigo umetengenezwa",
      shipmentStatusUpdated: "Hali ya mzigo imesasishwa",
      fillCustomer: "Tafadhali jaza taarifa zote za mteja",
      customerAdded: "Mteja ameongezwa",
      customerUpdated: "Taarifa za mteja zimesasishwa",
      fillSupplier: "Tafadhali jaza taarifa zote za msambazaji",
      supplierAdded: "Msambazaji ameongezwa",
      supplierUpdated: "Taarifa za msambazaji zimesasishwa",
      fillPayment: "Weka mteja na kiasi",
      paymentRecorded: "Malipo yamehifadhiwa",
      signedIn: "Umeingia kwa mafanikio",
      workspaceCreated: "Mfumo umetengenezwa kwa mafanikio",
      deliveryUpdated: "Uwasilishaji umesasishwa",
    },
  },
};

function formatMoney(value, language = "en") {
  const locale = language === "sw" ? "sw-TZ" : "en-TZ";
  return `TSh ${new Intl.NumberFormat(locale).format(value)}`;
}

function statusTone(status) {
  if (status === "active" || status === "delivered") return "green";
  if (status === "transit") return "blue";
  if (status === "maintenance") return "red";
  return "amber";
}

function initials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getVehiclePrimaryPlate(vehicle) {
  return vehicle.headPlate ?? vehicle.plate ?? "";
}

function getVehiclePlateLabel(vehicle) {
  const headPlate = vehicle.headPlate ?? vehicle.plate ?? "";
  const trailerPlate = vehicle.trailerPlate ?? "";
  return trailerPlate ? `${headPlate} / ${trailerPlate}` : headPlate;
}

function generateNextCustomerId(customers) {
  const maxNumber = customers.reduce((max, customer) => {
    const match = /(\d+)$/.exec(customer.id ?? "");
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  return `CUST-${String(maxNumber + 1).padStart(3, "0")}`;
}

function generateNextSupplierId(suppliers) {
  const maxNumber = suppliers.reduce((max, supplier) => {
    const match = /(\d+)$/.exec(supplier.id ?? "");
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  return `SUP-${String(maxNumber + 1).padStart(3, "0")}`;
}

function isDateInRange(dateValue, filter, selectedDate) {
  const date = new Date(dateValue);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return false;

  if (filter === "all") {
    return true;
  }

  if (filter === "today") {
    return date.toDateString() === now.toDateString();
  }

  if (filter === "week") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - now.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return date >= start && date < end;
  }

  if (filter === "month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  if (filter === "date") {
    return selectedDate ? dateValue === selectedDate : true;
  }

  return true;
}

function StatCard({ label, value, change, icon: Icon, tone = "brand" }) {
  return (
    <div className="glass-card stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon ${tone}`}>
          <Icon size={18} />
        </div>
        {change ? <span className={`stat-change ${change.startsWith("-") ? "down" : "up"}`}>{change}</span> : null}
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function LanguagePicker({ label, value, onChange, englishLabel, swahiliLabel }) {
  return (
    <label className="language-picker">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
        <option value="en">{englishLabel}</option>
        <option value="sw">{swahiliLabel}</option>
      </select>
    </label>
  );
}

function SearchBox({ label, value, onChange }) {
  return (
    <label className="search-box" aria-label={label}>
      <div className="search-input-wrap">
        <Search size={16} />
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} />
      </div>
    </label>
  );
}

function StatusBadge({ status, label }) {
  return (
    <span className={`status-badge ${statusTone(status)}`}>
      <span className="status-dot" />
      {label ?? status}
    </span>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty-state glass-card">
      <div className="empty-state-icon">
        <Icon size={24} />
      </div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function Toast({ toast, onClose }) {
  return (
    <div className={`toast ${toast.type}`}>
      {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span>{toast.message}</span>
      <button type="button" className="icon-button muted" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}

function Modal({ title, children, onClose, onSave, saveLabel = "Save", cancelLabel = "Cancel" }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card glass-elevated" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-button muted" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button type="button" className="button secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className="button primary" onClick={onSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem("logisticsflow-language") ?? "en";
  });
  const [appData, setAppData] = useState(initialData);
  const [toast, setToast] = useState(null);
  const [deliveryFilter, setDeliveryFilter] = useState("month");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [fleetFilter, setFleetFilter] = useState("all");
  const [pageSearch, setPageSearch] = useState({
    dashboard: "",
    fleet: "",
    shipments: "",
    deliveries: "",
    customers: "",
    suppliers: "",
    billing: "",
    reports: "",
    settings: "",
  });
  const [modal, setModal] = useState({ type: null });
  const [modalForm, setModalForm] = useState({});
  const t = translations[language];
  const searchValue = pageSearch[currentPage] ?? "";

  useEffect(() => {
    window.localStorage.setItem("logisticsflow-language", language);
  }, [language]);

  const totals = useMemo(() => {
    const revenue = appData.payments.reduce((sum, item) => sum + item.paid, 0);
    const outstanding = appData.payments.reduce((sum, item) => sum + (item.total - item.paid), 0);
    const deliveries = appData.shipments.filter((item) => item.status === "delivered").length;
    const activeFleet = appData.fleet.filter((item) => item.status === "active").length;
    const deliveredCount = appData.shipments.filter((item) => item.status === "delivered").length;
    const transitCount = appData.shipments.filter((item) => item.status === "transit").length;
    const pendingCount = appData.shipments.filter((item) => item.status === "pending").length;
    const clearedCustomers = appData.payments.filter((item) => item.paid >= item.total).length;

    return {
      revenue,
      outstanding,
      deliveries,
      activeFleet,
      deliveredCount,
      transitCount,
      pendingCount,
      clearedCustomers,
    };
  }, [appData]);

  const activeShipments = useMemo(
    () => appData.shipments.filter((item) => item.status !== "delivered"),
    [appData.shipments],
  );

  const availableVehicles = useMemo(() => {
    const assignedVehicles = new Set(
      appData.shipments
        .filter((item) => item.status !== "delivered")
        .map((item) => item.vehicle),
    );

    return appData.fleet.filter(
      (item) => item.status === "active" && !assignedVehicles.has(getVehiclePrimaryPlate(item)),
    );
  }, [appData.fleet, appData.shipments]);

  const filteredDeliveries = useMemo(() => {
    return appData.shipments
      .filter((item) => item.status === "delivered")
      .filter((item) => isDateInRange(item.date, deliveryFilter, deliveryDate));
  }, [appData.shipments, deliveryFilter, deliveryDate]);

  const filteredFleet = useMemo(() => {
    if (fleetFilter === "all") return appData.fleet;
    return appData.fleet.filter((item) => (item.ownership ?? "owned") === fleetFilter);
  }, [appData.fleet, fleetFilter]);

  const selectedFleetVehicle = useMemo(
    () => appData.fleet.find((item) => item.id === modal.vehicleId) ?? null,
    [appData.fleet, modal.vehicleId],
  );

  const translatedNavigation = useMemo(
    () => navigation.map((item) => ({ ...item, label: t.nav[item.id] ?? item.label })),
    [t],
  );

  const mobileNavItems = useMemo(
    () => [
      { id: "dashboard", label: t.mobile.dashboard },
      { id: "fleet", label: t.mobile.fleet },
      { id: "deliveries", label: t.mobile.deliveries },
      { id: "billing", label: t.mobile.billing },
      { id: "settings", label: t.mobile.settings },
    ],
    [t],
  );

  const activityFeed = [
    { icon: Truck, title: t.dashboard.activity1Title, text: t.dashboard.activity1Text, tone: "green", time: t.dashboard.time1 },
    { icon: Route, title: t.dashboard.activity2Title, text: t.dashboard.activity2Text, tone: "brand", time: t.dashboard.time2 },
    { icon: CheckCircle2, title: t.dashboard.activity3Title, text: t.dashboard.activity3Text, tone: "green", time: t.dashboard.time3 },
    { icon: AlertCircle, title: t.dashboard.activity4Title, text: t.dashboard.activity4Text, tone: "amber", time: t.dashboard.time4 },
  ];

  const filteredActivityFeed = useMemo(() => {
    const query = pageSearch.dashboard.trim().toLowerCase();
    if (!query) return activityFeed;
    return activityFeed.filter((item) => `${item.title} ${item.text} ${item.time}`.toLowerCase().includes(query));
  }, [activityFeed, pageSearch.dashboard]);

  const searchedFleet = useMemo(() => {
    const query = pageSearch.fleet.trim().toLowerCase();
    if (!query) return filteredFleet;
    return filteredFleet.filter((vehicle) =>
      [
        getVehiclePlateLabel(vehicle),
        vehicle.driver,
        vehicle.driverPhone,
        vehicle.licenseNumber,
        t.fleet[vehicle.ownership ?? "owned"],
        t.status[vehicle.status],
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [filteredFleet, pageSearch.fleet, t]);

  const searchedShipments = useMemo(() => {
    const query = pageSearch.shipments.trim().toLowerCase();
    if (!query) return activeShipments;
    return activeShipments.filter((shipment) =>
      [shipment.origin, shipment.customer, shipment.destination, shipment.vehicle, shipment.status, shipment.date]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [activeShipments, pageSearch.shipments]);

  const searchedDeliveries = useMemo(() => {
    const query = pageSearch.deliveries.trim().toLowerCase();
    if (!query) return filteredDeliveries;
    return filteredDeliveries.filter((shipment) =>
      [shipment.origin, shipment.customer, shipment.destination, shipment.vehicle, shipment.status, shipment.date]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [filteredDeliveries, pageSearch.deliveries]);

  const searchedCustomers = useMemo(() => {
    const query = pageSearch.customers.trim().toLowerCase();
    if (!query) return appData.customers;
    return appData.customers.filter((customer) =>
      [customer.name, customer.phone, customer.location].join(" ").toLowerCase().includes(query),
    );
  }, [appData.customers, pageSearch.customers]);

  const customerShipmentCounts = useMemo(() => {
    return appData.shipments.reduce((accumulator, shipment) => {
      if (!shipment.customerId) return accumulator;
      accumulator[shipment.customerId] = (accumulator[shipment.customerId] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [appData.shipments]);

  const searchedPayments = useMemo(() => {
    const query = pageSearch.billing.trim().toLowerCase();
    if (!query) return appData.payments;
    return appData.payments.filter((payment) =>
      [payment.customer, payment.date, payment.total, payment.paid].join(" ").toLowerCase().includes(query),
    );
  }, [appData.payments, pageSearch.billing]);

  const searchedSuppliers = useMemo(() => {
    const query = pageSearch.suppliers.trim().toLowerCase();
    if (!query) return appData.suppliers;
    return appData.suppliers.filter((supplier) =>
      [
        supplier.id,
        supplier.name,
        supplier.phone,
        supplier.location,
        supplier.buyingPrice,
        supplier.sellingPrice,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [appData.suppliers, pageSearch.suppliers]);

  const searchedOutstandingPayments = useMemo(() => {
    const outstandingPayments = appData.payments.filter((payment) => payment.paid < payment.total);
    const query = pageSearch.reports.trim().toLowerCase();
    if (!query) return outstandingPayments;
    return outstandingPayments.filter((payment) =>
      [payment.customer, payment.date, payment.total, payment.paid].join(" ").toLowerCase().includes(query),
    );
  }, [appData.payments, pageSearch.reports]);

  const searchedTeamMembers = useMemo(() => {
    const members = [
      { name: "Maya Johnson", role: "Admin" },
      { name: "Amina Yusuf", role: "Fleet Lead" },
      { name: "Leo Thompson", role: "Billing" },
    ];
    const query = pageSearch.settings.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => `${member.name} ${member.role}`.toLowerCase().includes(query));
  }, [pageSearch.settings]);

  const openModal = (type) => {
    if (type === "fleet") {
      setModalForm({
        ownership: "owned",
        headPlate: "",
        trailerPlate: "",
        driver: "",
        driverPhone: "",
        licenseNumber: "",
      });
      setModal({ type, mode: "create" });
      return;
    }
    if (type === "shipment") {
      const firstCustomer = appData.customers[0];
      const firstSupplier = appData.suppliers[0];
      setModalForm({
        supplierId: firstSupplier?.id ?? "",
        customerId: firstCustomer?.id ?? "",
        quantity: "",
        vehicle: getVehiclePrimaryPlate(availableVehicles[0] ?? {}),
      });
    }
    if (type === "customer") {
      setModalForm({ id: "", name: "", phone: "", location: "" });
      setModal({ type, mode: "create" });
      return;
    }
    if (type === "payment") {
      setModalForm({ customer: appData.customers[0]?.name ?? "", amount: "" });
    }
    if (type === "supplier") {
      setModalForm({ id: "", name: "", phone: "", location: "", buyingPrice: "", sellingPrice: "" });
      setModal({ type, mode: "create" });
      return;
    }

    setModal({ type });
  };

  const openFleetEditModal = (vehicle) => {
    setModalForm({
      ownership: vehicle.ownership ?? "owned",
      headPlate: vehicle.headPlate ?? vehicle.plate ?? "",
      trailerPlate: vehicle.trailerPlate ?? "",
      driver: vehicle.driver ?? "",
      driverPhone: vehicle.driverPhone ?? "",
      licenseNumber: vehicle.licenseNumber ?? "",
    });
    setModal({ type: "fleet", mode: "edit", vehicleId: vehicle.id });
  };

  const openFleetDetailsModal = (vehicle) => {
    setModal({ type: "fleetDetails", vehicleId: vehicle.id });
  };

  const openCustomerEditModal = (customer) => {
    setModalForm({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      location: customer.location,
    });
    setModal({ type: "customer", mode: "edit", customerId: customer.id });
  };

  const openSupplierEditModal = (supplier) => {
    setModalForm({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      location: supplier.location,
      buyingPrice: supplier.buyingPrice,
      sellingPrice: supplier.sellingPrice,
    });
    setModal({ type: "supplier", mode: "edit", supplierId: supplier.id });
  };

  const closeModal = () => {
    setModal({ type: null });
    setModalForm({});
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(null), 3200);
  };

  const updateForm = (event) => {
    const { name, value } = event.target;
    setModalForm((current) => ({ ...current, [name]: value }));
  };

  const handleModalSave = () => {
    if (modal.type === "fleet") {
      if (!modalForm.headPlate || !modalForm.trailerPlate || !modalForm.driver || !modalForm.driverPhone || !modalForm.licenseNumber) {
        showToast(t.toast.fillFleet, "error");
        return;
      }

      if (modal.mode === "edit" && modal.vehicleId) {
        setAppData((current) => ({
          ...current,
          fleet: current.fleet.map((item) =>
            item.id === modal.vehicleId
              ? {
                  ...item,
                  ownership: modalForm.ownership,
                  headPlate: modalForm.headPlate,
                  trailerPlate: modalForm.trailerPlate,
                  driver: modalForm.driver,
                  driverPhone: modalForm.driverPhone,
                  licenseNumber: modalForm.licenseNumber,
                }
              : item,
          ),
        }));
        closeModal();
        showToast(t.toast.fleetUpdated);
        return;
      }

      setAppData((current) => ({
        ...current,
        fleet: [
          ...current.fleet,
          {
            id: `f${Date.now()}`,
            ownership: modalForm.ownership,
            headPlate: modalForm.headPlate,
            trailerPlate: modalForm.trailerPlate,
            driver: modalForm.driver,
            driverPhone: modalForm.driverPhone,
            licenseNumber: modalForm.licenseNumber,
            status: "active",
            routes: 0,
          },
        ],
      }));
      closeModal();
      showToast(t.toast.fleetAdded);
      return;
    }

    if (modal.type === "shipment") {
      const selectedCustomer = appData.customers.find((item) => item.id === modalForm.customerId);
      const selectedSupplier = appData.suppliers.find((item) => item.id === modalForm.supplierId);

      if (!modalForm.supplierId || !modalForm.customerId || !modalForm.quantity || !modalForm.vehicle || !selectedCustomer || !selectedSupplier) {
        showToast(t.toast.fillShipment, "error");
        return;
      }

      setAppData((current) => ({
        ...current,
        shipments: [
          ...current.shipments,
          {
            id: `s${Date.now()}`,
            supplierId: selectedSupplier.id,
            origin: selectedSupplier.name,
            customerId: selectedCustomer.id,
            customer: selectedCustomer.name,
            destination: selectedCustomer.location,
            quantity: Number(modalForm.quantity),
            unit: "pallets",
            vehicle: modalForm.vehicle,
            date: new Date().toISOString().slice(0, 10),
            status: "pending",
          },
        ],
      }));
      closeModal();
      showToast(t.toast.shipmentCreated);
      return;
    }

    if (modal.type === "customer") {
      if (!modalForm.name || !modalForm.phone || !modalForm.location) {
        showToast(t.toast.fillCustomer, "error");
        return;
      }

      if (modal.mode === "edit" && modal.customerId) {
        setAppData((current) => {
          const existingCustomer = current.customers.find((item) => item.id === modal.customerId);
          const oldName = existingCustomer?.name ?? "";

          return {
            ...current,
            customers: current.customers.map((item) =>
              item.id === modal.customerId
                ? {
                    ...item,
                    name: modalForm.name,
                    phone: modalForm.phone,
                    location: modalForm.location,
                  }
                : item,
            ),
            shipments: current.shipments.map((shipment) =>
              shipment.customerId === modal.customerId
                ? {
                    ...shipment,
                    customer: modalForm.name,
                    destination: modalForm.location,
                  }
                : shipment,
            ),
            payments: current.payments.map((payment) =>
              payment.customer === oldName ? { ...payment, customer: modalForm.name } : payment,
            ),
          };
        });
        closeModal();
        showToast(t.toast.customerUpdated);
        return;
      }

      setAppData((current) => ({
        ...current,
        customers: [
          ...current.customers,
          {
            id: generateNextCustomerId(current.customers),
            name: modalForm.name,
            phone: modalForm.phone,
            location: modalForm.location,
          },
        ],
      }));
      closeModal();
      showToast(t.toast.customerAdded);
      return;
    }

    if (modal.type === "supplier") {
      if (!modalForm.name || !modalForm.phone || !modalForm.location || !modalForm.buyingPrice || !modalForm.sellingPrice) {
        showToast(t.toast.fillSupplier, "error");
        return;
      }

      if (modal.mode === "edit" && modal.supplierId) {
        setAppData((current) => ({
          ...current,
          suppliers: current.suppliers.map((item) =>
            item.id === modal.supplierId
              ? {
                  ...item,
                  name: modalForm.name,
                  phone: modalForm.phone,
                  location: modalForm.location,
                  buyingPrice: Number(modalForm.buyingPrice),
                  sellingPrice: Number(modalForm.sellingPrice),
                }
              : item,
          ),
          shipments: current.shipments.map((shipment) =>
            shipment.supplierId === modal.supplierId
              ? {
                  ...shipment,
                  origin: modalForm.name,
                }
              : shipment,
          ),
        }));
        closeModal();
        showToast(t.toast.supplierUpdated);
        return;
      }

      setAppData((current) => ({
        ...current,
        suppliers: [
          ...current.suppliers,
          {
            id: generateNextSupplierId(current.suppliers),
            name: modalForm.name,
            phone: modalForm.phone,
            location: modalForm.location,
            buyingPrice: Number(modalForm.buyingPrice),
            sellingPrice: Number(modalForm.sellingPrice),
          },
        ],
      }));
      closeModal();
      showToast(t.toast.supplierAdded);
      return;
    }

    if (modal.type === "payment") {
      const amount = Number(modalForm.amount);
      if (!modalForm.customer || !amount) {
        showToast(t.toast.fillPayment, "error");
        return;
      }

      setAppData((current) => {
        const existing = current.payments.find((payment) => payment.customer === modalForm.customer);

        if (existing) {
          return {
            ...current,
            payments: current.payments.map((payment) =>
              payment.customer === modalForm.customer
                ? { ...payment, paid: Math.min(payment.total, payment.paid + amount) }
                : payment,
            ),
          };
        }

        return {
          ...current,
          payments: [
            ...current.payments,
            {
              id: `p${Date.now()}`,
              customer: modalForm.customer,
              total: amount,
              paid: amount,
              date: new Date().toISOString().slice(0, 10),
            },
          ],
        };
      });
      closeModal();
      showToast(t.toast.paymentRecorded);
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setCurrentPage("dashboard");
    showToast(t.toast.signedIn);
  };

  const handleSignup = (event) => {
    event.preventDefault();
    setCurrentPage("dashboard");
    showToast(t.toast.workspaceCreated);
  };

  const toggleFleetStatus = (id) => {
    setAppData((current) => ({
      ...current,
      fleet: current.fleet.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "active" ? "maintenance" : "active" }
          : item,
      ),
    }));
  };

  const updateShipmentStatus = (id, nextStatus) => {
    setAppData((current) => ({
      ...current,
      shipments: current.shipments.map((item) =>
        item.id === id ? { ...item, status: nextStatus, date: new Date().toISOString().slice(0, 10) } : item,
      ),
    }));
    showToast(t.toast.shipmentStatusUpdated);
  };

  const deleteFleetVehicle = (id) => {
    if (!window.confirm(t.toast.confirmFleetDelete)) return;
    setAppData((current) => ({
      ...current,
      fleet: current.fleet.filter((item) => item.id !== id),
    }));
    closeModal();
    showToast(t.toast.fleetDeleted);
  };

  const advanceDelivery = (id) => {
    setAppData((current) => ({
      ...current,
      deliveries: current.deliveries.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "pending") return { ...item, status: "transit" };
        if (item.status === "transit") return { ...item, status: "delivered" };
        return item;
      }),
    }));
    showToast(t.toast.deliveryUpdated);
  };

  const authPage = currentPage === "login" || currentPage === "signup";

  const renderAuthCard = () => {
    if (currentPage === "signup") {
      return (
        <form className="auth-card glass-elevated" onSubmit={handleSignup}>
          <div className="auth-brand">
            <div className="brand-mark large">
              <Box size={20} />
            </div>
            <div>
              <strong>LOGISTICSFLOW</strong>
              <span>{t.auth.signupTag}</span>
            </div>
          </div>
          <div className="auth-copy">
            <h1>{t.auth.signupTitle}</h1>
            <p>{t.auth.signupText}</p>
          </div>
          <label>
            {t.auth.companyName}
            <input type="text" placeholder="LOGISTICSFLOW HQ" />
          </label>
          <label>
            {t.auth.email}
            <input type="email" placeholder="ops@logisticsflow.com" />
          </label>
          <label>
            {t.auth.password}
            <input type="password" placeholder="Minimum 8 characters" />
          </label>
          <button type="submit" className="button primary full">
            {t.auth.createAccount}
          </button>
          <p className="auth-switch">
            {t.auth.alreadyHaveAccount}{" "}
            <button type="button" className="inline-link" onClick={() => setCurrentPage("login")}>
              {t.auth.signIn}
            </button>
          </p>
        </form>
      );
    }

    return (
      <form className="auth-card glass-elevated" onSubmit={handleLogin}>
        <div className="auth-brand auth-brand-centered">
          <div className="brand-mark large">
            <Box size={20} />
          </div>
          <div className="auth-brand-stack">
            <strong>LOGISTICS FLOW</strong>
          </div>
        </div>
        <label>
          {t.auth.email}
          <input type="email" defaultValue="admin@logisticsflow.com" />
        </label>
        <label>
          {t.auth.password}
          <input type="password" defaultValue="password123" />
        </label>
        <button type="submit" className="button primary full">
          {t.auth.signIn}
        </button>
        <p className="auth-switch">
          {t.auth.needAccount}{" "}
          <button type="button" className="inline-link" onClick={() => setCurrentPage("signup")}>
            {t.auth.createOne}
          </button>
        </p>
      </form>
    );
  };

  const renderDashboard = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.dashboard}</h1>
          <p>{t.dashboard.intro}</p>
        </div>
        <div className="header-actions">
          <SearchBox
            label={t.common.search}
            value={pageSearch.dashboard}
            onChange={(value) => setPageSearch((current) => ({ ...current, dashboard: value }))}
          />
          <LanguagePicker
            label={t.common.language}
            value={language}
            onChange={setLanguage}
            englishLabel={t.common.english}
            swahiliLabel={t.common.swahili}
          />
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label={t.dashboard.totalDeliveries} value={totals.deliveries} change="+12.5%" icon={Truck} tone="brand" />
        <StatCard label={t.dashboard.revenueCollected} value={formatMoney(totals.revenue, language)} change="+8.2%" icon={TrendingUp} tone="green" />
        <StatCard label={t.dashboard.outstanding} value={formatMoney(totals.outstanding, language)} change="-3.1%" icon={Clock3} tone="amber" />
        <StatCard label={t.dashboard.activeFleet} value={`${totals.activeFleet}/${appData.fleet.length}`} icon={Zap} tone="brand" />
      </section>

      <section className="feature-grid">
        <div className="glass-card chart-card large">
          <div className="section-row">
            <div>
              <h3>{t.dashboard.operationsTitle}</h3>
              <p>{t.dashboard.operationsText}</p>
            </div>
          </div>
          <div className="summary-list">
            <div className="summary-row">
              <span>{t.dashboard.completedRuns}</span>
              <strong>{totals.deliveredCount}</strong>
            </div>
            <div className="summary-row">
              <span>{t.dashboard.transitRuns}</span>
              <strong>{totals.transitCount}</strong>
            </div>
            <div className="summary-row">
              <span>{t.dashboard.pendingRuns}</span>
              <strong>{totals.pendingCount}</strong>
            </div>
            <div className="summary-row">
              <span>{t.dashboard.activeCustomers}</span>
              <strong>{appData.customers.length}</strong>
            </div>
          </div>
        </div>

        <div className="glass-card chart-card">
          <div className="section-row">
            <div>
              <h3>{t.dashboard.deliveryStatus}</h3>
              <p>{t.dashboard.deliveryStatusText}</p>
            </div>
          </div>
          <div className="status-list">
            <div className="status-metric">
              <div>
                <strong>68%</strong>
                <span>{t.status.delivered}</span>
              </div>
              <div className="ring green">68%</div>
            </div>
            <div className="status-metric">
              <div>
                <strong>22%</strong>
                <span>{t.status.transit}</span>
              </div>
              <div className="ring blue">22%</div>
            </div>
            <div className="status-metric">
              <div>
                <strong>10%</strong>
                <span>{t.status.pending}</span>
              </div>
              <div className="ring amber">10%</div>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card activity-card">
        <div className="section-row">
          <div>
            <h3>{t.dashboard.recentActivity}</h3>
            <p>{t.dashboard.recentActivityText}</p>
          </div>
          <button type="button" className="inline-link">
            {t.dashboard.viewAll}
          </button>
        </div>
        <div className="activity-list">
          {filteredActivityFeed.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="activity-item">
                <div className={`activity-icon ${item.tone}`}>
                  <Icon size={16} />
                </div>
                <div className="activity-copy">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
                <time>{item.time}</time>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );

  const renderFleet = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.fleet}</h1>
          <p>{t.fleet.intro}</p>
        </div>
        <div className="header-actions">
          <SearchBox
            label={t.common.search}
            value={pageSearch.fleet}
            onChange={(value) => setPageSearch((current) => ({ ...current, fleet: value }))}
          />
          <button type="button" className="button primary" onClick={() => openModal("fleet")}>
            <Plus size={16} />
            {t.fleet.addVehicle}
          </button>
        </div>
      </section>

      <section className="pill-row">
        {["all", "owned", "rented"].map((type) => (
          <button
            key={type}
            type="button"
            className={`pill-button ${fleetFilter === type ? "active" : ""}`}
            onClick={() => setFleetFilter(type)}
          >
            {type === "all" ? t.fleet.allVehicles : t.fleet[type]}
          </button>
        ))}
      </section>

      <section className="card-grid three">
        {searchedFleet.map((vehicle) => (
          <article key={vehicle.id} className="glass-card info-card">
            <div className="card-head">
              <div className="inline-icon brand">
                <Truck size={18} />
              </div>
              <div>
                <strong>{getVehiclePlateLabel(vehicle)}</strong>
                <span>{vehicle.driver}</span>
              </div>
              <div className="fleet-badges">
                <span className={`category-badge ${vehicle.ownership ?? "owned"}`}>
                  {t.fleet[vehicle.ownership ?? "owned"]}
                </span>
                <StatusBadge status={vehicle.status} label={t.status[vehicle.status]} />
              </div>
            </div>
            <div className="card-foot">
              <span>{vehicle.routes} {t.fleet.completedRoutes}</span>
              <button type="button" className="inline-link" onClick={() => toggleFleetStatus(vehicle.id)}>
                {vehicle.status === "active" ? t.fleet.setMaintenance : t.fleet.activate}
              </button>
            </div>
            <div className="fleet-card-actions">
              <button type="button" className="inline-link" onClick={() => openFleetDetailsModal(vehicle)}>
                {t.fleet.viewDetails}
              </button>
              <button type="button" className="inline-link" onClick={() => openFleetEditModal(vehicle)}>
                {t.common.edit}
              </button>
              <button type="button" className="inline-link danger" onClick={() => deleteFleetVehicle(vehicle.id)}>
                {t.common.delete}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );

  const renderShipments = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.shipments}</h1>
          <p>{t.shipments.intro}</p>
        </div>
        <div className="header-actions">
          <SearchBox
            label={t.common.search}
            value={pageSearch.shipments}
            onChange={(value) => setPageSearch((current) => ({ ...current, shipments: value }))}
          />
          <button type="button" className="button primary" onClick={() => openModal("shipment")}>
            <Plus size={16} />
            {t.shipments.newShipment}
          </button>
        </div>
      </section>

      <section className={searchedShipments.length ? "card-grid two" : "empty-state-section"}>
        {searchedShipments.length ? (
          searchedShipments.map((shipment) => (
            <article key={shipment.id} className="glass-card info-card">
              <div className="card-head">
                <div className="card-copy">
                  <strong>{shipment.origin}</strong>
                  <span>{shipment.date}</span>
                </div>
                <StatusBadge status={shipment.status} label={t.status[shipment.status]} />
              </div>
              <div className="shipment-route">
                <ArrowUpRight size={16} />
                <span>{shipment.customer} - {shipment.destination}</span>
              </div>
              <div className="meta-row">
                <span>
                  <Package size={14} />
                  {shipment.quantity} {shipment.unit}
                </span>
                <span>
                  <Truck size={14} />
                  {shipment.vehicle}
                </span>
              </div>
              <div className="shipment-status-row">
                <label className="language-picker compact">
                  <span>{t.shipments.status}</span>
                  <select value={shipment.status} onChange={(event) => updateShipmentStatus(shipment.id, event.target.value)}>
                    <option value="pending">{t.status.pending}</option>
                    <option value="transit">{t.status.transit}</option>
                    <option value="delivered">{t.status.delivered}</option>
                  </select>
                </label>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state glass-card shipment-empty-state">
            <strong>{t.shipments.emptyTitle}</strong>
            <div className="empty-state-icon">
              <Package size={24} />
            </div>
          </div>
        )}
      </section>
    </div>
  );

  const renderDeliveries = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.deliveries}</h1>
          <p>{t.deliveries.intro}</p>
        </div>
        <div className="header-actions">
          <SearchBox
            label={t.common.search}
            value={pageSearch.deliveries}
            onChange={(value) => setPageSearch((current) => ({ ...current, deliveries: value }))}
          />
          <label className="language-picker compact">
            <span>{t.deliveries.filterLabel}</span>
            <select value={deliveryFilter} onChange={(event) => setDeliveryFilter(event.target.value)}>
              <option value="all">{t.common.all}</option>
              <option value="today">{t.common.today}</option>
              <option value="week">{t.common.thisWeek}</option>
              <option value="month">{t.common.thisMonth}</option>
              <option value="date">{t.common.byDate}</option>
            </select>
          </label>
          {deliveryFilter === "date" ? (
            <label className="language-picker compact">
              <span>{t.common.date}</span>
              <input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
            </label>
          ) : null}
        </div>
      </section>

      <section className="glass-card table-card">
        {searchedDeliveries.length ? (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>{t.deliveries.historyDate}</th>
                  <th>{t.deliveries.origin}</th>
                  <th>{t.deliveries.destination}</th>
                  <th>{t.deliveries.vehicle}</th>
                  <th>{t.deliveries.quantity}</th>
                  <th>{t.shipments.status}</th>
                </tr>
              </thead>
              <tbody>
                {searchedDeliveries.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{shipment.date}</td>
                    <td>{shipment.origin}</td>
                    <td>{shipment.customer} - {shipment.destination}</td>
                    <td>{shipment.vehicle}</td>
                    <td>{shipment.quantity} {shipment.unit}</td>
                    <td>
                      <StatusBadge status={shipment.status} label={t.status[shipment.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Route} title={t.deliveries.emptyTitle} text={t.deliveries.emptyText} />
        )}
      </section>
    </div>
  );

  const renderCustomers = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.customers}</h1>
          <p>{t.customers.intro}</p>
        </div>
        <div className="header-actions">
          <SearchBox
            label={t.common.search}
            value={pageSearch.customers}
            onChange={(value) => setPageSearch((current) => ({ ...current, customers: value }))}
          />
          <button type="button" className="button primary" onClick={() => openModal("customer")}>
            <Plus size={16} />
            {t.customers.addCustomer}
          </button>
        </div>
      </section>

      <section className="card-grid three">
        {searchedCustomers.map((customer) => (
          <article key={customer.id} className="glass-card info-card">
            <div className="card-head">
              <div className="avatar">{initials(customer.name)}</div>
              <div>
                <strong>{customer.name}</strong>
                <span>{customer.location}</span>
                <span>{t.customers.customerId}: {customer.id}</span>
              </div>
              <button type="button" className="inline-link" onClick={() => openCustomerEditModal(customer)}>
                {t.common.edit}
              </button>
            </div>
            <div className="customer-meta">
              <span>
                <Phone size={14} />
                {customer.phone}
              </span>
              <span>
                <Package size={14} />
                {customerShipmentCounts[customer.id] ?? 0} {t.customers.shipmentsCount}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );

  const renderSuppliers = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.suppliers}</h1>
          <p>{t.suppliers.intro}</p>
        </div>
        <div className="header-actions">
          <SearchBox
            label={t.common.search}
            value={pageSearch.suppliers}
            onChange={(value) => setPageSearch((current) => ({ ...current, suppliers: value }))}
          />
          <button type="button" className="button primary" onClick={() => openModal("supplier")}>
            <Plus size={16} />
            {t.suppliers.addSupplier}
          </button>
        </div>
      </section>

      <section className="card-grid three">
        {searchedSuppliers.map((supplier) => (
          <article key={supplier.id} className="glass-card info-card">
            <div className="card-head">
              <div className="inline-icon brand">
                <Building2 size={18} />
              </div>
              <div>
                <strong>{supplier.name}</strong>
                <span>{supplier.location}</span>
                <span>{t.suppliers.supplierId}: {supplier.id}</span>
              </div>
              <button type="button" className="inline-link" onClick={() => openSupplierEditModal(supplier)}>
                {t.common.edit}
              </button>
            </div>
            <div className="customer-meta">
              <span>
                <Phone size={14} />
                {supplier.phone}
              </span>
              <span>{t.suppliers.buyingPrice}: {formatMoney(supplier.buyingPrice, language)}</span>
              <span>{t.suppliers.sellingPrice}: {formatMoney(supplier.sellingPrice, language)}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );

  const renderBilling = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.billing}</h1>
          <p>{t.billing.intro}</p>
        </div>
        <div className="header-actions">
          <SearchBox
            label={t.common.search}
            value={pageSearch.billing}
            onChange={(value) => setPageSearch((current) => ({ ...current, billing: value }))}
          />
          <button type="button" className="button primary" onClick={() => openModal("payment")}>
            <Plus size={16} />
            {t.billing.recordPayment}
          </button>
        </div>
      </section>

      <section className="stats-grid compact">
        <StatCard label={t.billing.totalOwed} value={formatMoney(appData.payments.reduce((sum, item) => sum + item.total, 0), language)} icon={BarChart3} tone="brand" />
        <StatCard label={t.billing.collected} value={formatMoney(totals.revenue, language)} icon={CheckCircle2} tone="green" />
        <StatCard label={t.billing.outstanding} value={formatMoney(totals.outstanding, language)} icon={AlertCircle} tone="amber" />
      </section>

      <section className="list-stack">
        {searchedPayments.map((payment) => {
          const progress = Math.round((payment.paid / payment.total) * 100);
          const remaining = payment.total - payment.paid;

          return (
            <article key={payment.id} className="glass-card payment-card">
              <div className="section-row">
                <div>
                  <strong>{payment.customer}</strong>
                  <p>{payment.date}</p>
                </div>
                <div className="payment-amounts">
                  <strong>{formatMoney(payment.total, language)}</strong>
                  <span className={remaining > 0 ? "warning-text" : "success-text"}>
                    {remaining > 0 ? `${formatMoney(remaining, language)} ${t.common.remaining}` : t.common.fullyPaid}
                  </span>
                </div>
              </div>
              <div className="progress-track">
                <div className={`progress-fill ${remaining > 0 ? "brand" : "green"}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-copy">
                <span>{formatMoney(payment.paid, language)} {t.common.paid}</span>
                <span>{progress}%</span>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );

  const renderReports = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.reports}</h1>
          <p>{t.reports.intro}</p>
        </div>
        <SearchBox
          label={t.common.search}
          value={pageSearch.reports}
          onChange={(value) => setPageSearch((current) => ({ ...current, reports: value }))}
        />
      </section>

      <section className="stats-grid compact">
        <StatCard label={t.reports.totalRevenue} value={formatMoney(totals.revenue, language)} icon={TrendingUp} tone="green" />
        <StatCard label={t.reports.orders} value={appData.shipments.length} icon={Package} tone="brand" />
        <StatCard label={t.reports.avgOrder} value={formatMoney(Math.round(totals.revenue / appData.payments.length), language)} icon={BarChart3} tone="brand" />
        <StatCard label={t.billing.outstanding} value={formatMoney(totals.outstanding, language)} icon={AlertCircle} tone="amber" />
      </section>

      <section className="feature-grid">
        <div className="glass-card chart-card">
          <div className="section-row">
            <div>
              <h3>{t.reports.collectionsTitle}</h3>
              <p>{t.reports.collectionsText}</p>
            </div>
          </div>
          <div className="summary-list">
            <div className="summary-row">
              <span>{t.reports.paidInvoices}</span>
              <strong>{totals.clearedCustomers}</strong>
            </div>
            <div className="summary-row">
              <span>{t.reports.openInvoices}</span>
              <strong>{appData.payments.length - totals.clearedCustomers}</strong>
            </div>
            <div className="summary-row">
              <span>{t.reports.clearedCustomers}</span>
              <strong>{totals.clearedCustomers}</strong>
            </div>
            <div className="summary-row">
              <span>{t.billing.collected}</span>
              <strong>{formatMoney(totals.revenue, language)}</strong>
            </div>
          </div>
        </div>

        <div className="glass-card chart-card">
          <div className="section-row">
            <div>
              <h3>{t.reports.outstandingByCustomer}</h3>
              <p>{t.reports.outstandingText}</p>
            </div>
          </div>
          <div className="list-stack tight">
            {searchedOutstandingPayments.map((payment) => {
                const remaining = payment.total - payment.paid;
                const coverage = Math.round((remaining / payment.total) * 100);

                return (
                  <div key={payment.id} className="customer-balance">
                    <div className="section-row">
                      <strong>{payment.customer}</strong>
                      <span>{formatMoney(remaining, language)}</span>
                    </div>
                    <div className="progress-track slim">
                      <div className="progress-fill amber" style={{ width: `${coverage}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );

  const renderSettings = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.settings}</h1>
          <p>{t.settings.intro}</p>
        </div>
        <SearchBox
          label={t.common.search}
          value={pageSearch.settings}
          onChange={(value) => setPageSearch((current) => ({ ...current, settings: value }))}
        />
      </section>

      <section className="feature-grid">
        <div className="glass-card settings-card">
          <div className="section-row">
            <div className="settings-title">
              <Building2 size={18} />
              <h3>{t.settings.companyProfile}</h3>
            </div>
          </div>
          <div className="form-grid">
            <label>
              {t.auth.companyName}
              <input type="text" defaultValue="LOGISTICSFLOW" />
            </label>
            <label>
              {t.settings.supportEmail}
              <input type="email" defaultValue="support@logisticsflow.com" />
            </label>
            <label>
              {t.settings.phone}
              <input type="text" defaultValue="+1 234 567 890" />
            </label>
            <label>
              {t.settings.workspaceType}
              <input type="text" defaultValue={t.settings.enterprise} />
            </label>
          </div>
          <button type="button" className="button primary">
            <Settings size={16} />
            {t.common.saveChanges}
          </button>
        </div>

        <div className="glass-card settings-card">
          <div className="section-row">
            <div className="settings-title">
              <Users size={18} />
              <h3>{t.settings.teamRoles}</h3>
            </div>
          </div>
          <div className="list-stack tight">
            {searchedTeamMembers.map((member) => (
              <div key={member.name} className="team-item">
                <div className="card-head">
                  <div className="avatar">{initials(member.name)}</div>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="button secondary">
            <UserPlus size={16} />
            {t.settings.inviteUser}
          </button>
        </div>
      </section>
    </div>
  );

  const renderPage = () => {
    if (currentPage === "dashboard") return renderDashboard();
    if (currentPage === "fleet") return renderFleet();
    if (currentPage === "shipments") return renderShipments();
    if (currentPage === "deliveries") return renderDeliveries();
    if (currentPage === "customers") return renderCustomers();
    if (currentPage === "suppliers") return renderSuppliers();
    if (currentPage === "billing") return renderBilling();
    if (currentPage === "reports") return renderReports();
    if (currentPage === "settings") return renderSettings();
    return renderDashboard();
  };

  return (
    <div className={`app-shell ${authPage ? "auth-shell" : ""}`}>
      {authPage ? (
        <div className="auth-layout">
          <div className="auth-content">{renderAuthCard()}</div>
        </div>
      ) : (
        <>
          <Sidebar items={translatedNavigation} currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="main-panel">{renderPage()}</main>
          <MobileNav currentPage={currentPage} items={mobileNavItems} onNavigate={setCurrentPage} />
        </>
      )}

      {toast ? (
        <div className="toast-stack">
          <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
      ) : null}

      {modal.type === "fleet" ? (
        <Modal
          title={modal.mode === "edit" ? t.modal.editVehicle : t.modal.addVehicle}
          onClose={closeModal}
          onSave={handleModalSave}
          saveLabel={modal.mode === "edit" ? t.common.edit : t.common.save}
          cancelLabel={t.common.cancel}
        >
          <div className="form-grid single">
            <label>
              {t.modal.vehicleCategory}
              <select name="ownership" value={modalForm.ownership ?? "owned"} onChange={updateForm}>
                <option value="owned">{t.fleet.owned}</option>
                <option value="rented">{t.fleet.rented}</option>
              </select>
            </label>
            <label>
              {t.modal.headPlateNumber}
              <input name="headPlate" value={modalForm.headPlate ?? ""} onChange={updateForm} placeholder="LFG-1200" />
            </label>
            <label>
              {t.modal.trailerPlateNumber}
              <input name="trailerPlate" value={modalForm.trailerPlate ?? ""} onChange={updateForm} placeholder="TRL-2200" />
            </label>
            <label>
              {t.modal.driverName}
              <input name="driver" value={modalForm.driver ?? ""} onChange={updateForm} placeholder="Driver full name" />
            </label>
            <label>
              {t.modal.driverContact}
              <input name="driverPhone" value={modalForm.driverPhone ?? ""} onChange={updateForm} placeholder="+255 700 000 000" />
            </label>
            <label>
              {t.modal.licenseNumber}
              <input name="licenseNumber" value={modalForm.licenseNumber ?? ""} onChange={updateForm} placeholder="TZ-DL-220145" />
            </label>
          </div>
        </Modal>
      ) : null}

      {modal.type === "fleetDetails" && selectedFleetVehicle ? (
        <Modal
          title={t.modal.vehicleDetails}
          onClose={closeModal}
          onSave={() => openFleetEditModal(selectedFleetVehicle)}
          saveLabel={t.common.edit}
          cancelLabel={t.common.close}
        >
          <div className="fleet-modal-details">
            <div className="summary-row">
              <span>{t.fleet.category}</span>
              <strong>{t.fleet[selectedFleetVehicle.ownership ?? "owned"]}</strong>
            </div>
            <div className="summary-row">
              <span>{t.fleet.headTruckPlate}</span>
              <strong>{selectedFleetVehicle.headPlate}</strong>
            </div>
            <div className="summary-row">
              <span>{t.fleet.trailerPlate}</span>
              <strong>{selectedFleetVehicle.trailerPlate}</strong>
            </div>
            <div className="summary-row">
              <span>{t.modal.driverName}</span>
              <strong>{selectedFleetVehicle.driver}</strong>
            </div>
            <div className="summary-row">
              <span>{t.fleet.driverContact}</span>
              <strong>{selectedFleetVehicle.driverPhone}</strong>
            </div>
            <div className="summary-row">
              <span>{t.fleet.licenseNumber}</span>
              <strong>{selectedFleetVehicle.licenseNumber}</strong>
            </div>
            <div className="summary-row">
              <span>{t.status[selectedFleetVehicle.status]}</span>
              <strong>{selectedFleetVehicle.routes} {t.fleet.completedRoutes}</strong>
            </div>
            <button type="button" className="inline-link danger" onClick={() => deleteFleetVehicle(selectedFleetVehicle.id)}>
              {t.fleet.deleteVehicle}
            </button>
          </div>
        </Modal>
      ) : null}

      {modal.type === "shipment" ? (
        <Modal title={t.modal.createShipment} onClose={closeModal} onSave={handleModalSave} saveLabel={t.common.save} cancelLabel={t.common.cancel}>
          <div className="form-grid single">
            <label>
              {t.shipments.supplier}
              <select name="supplierId" value={modalForm.supplierId ?? ""} onChange={updateForm}>
                {appData.suppliers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.location}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.shipments.customer}
              <select name="customerId" value={modalForm.customerId ?? ""} onChange={updateForm}>
                {appData.customers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.location}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.modal.quantity}
              <input name="quantity" type="number" value={modalForm.quantity ?? ""} onChange={updateForm} placeholder="120" />
            </label>
            <label>
              {t.shipments.assignVehicle}
              <select name="vehicle" value={modalForm.vehicle ?? ""} onChange={updateForm}>
                {availableVehicles.map((item) => (
                  <option key={item.id} value={getVehiclePrimaryPlate(item)}>
                    {getVehiclePlateLabel(item)} - {item.driver}
                  </option>
                ))}
              </select>
            </label>
            {!availableVehicles.length ? <span className="helper-text">{t.shipments.noAvailableVehicles}</span> : null}
          </div>
        </Modal>
      ) : null}

      {modal.type === "customer" ? (
        <Modal
          title={modal.mode === "edit" ? t.modal.editCustomer : t.modal.addCustomer}
          onClose={closeModal}
          onSave={handleModalSave}
          saveLabel={modal.mode === "edit" ? t.common.edit : t.common.save}
          cancelLabel={t.common.cancel}
        >
          <div className="form-grid single">
            {modal.mode === "edit" ? (
              <label>
                {t.customers.customerId}
                <input value={modalForm.id ?? ""} readOnly />
              </label>
            ) : null}
            <label>
              {t.auth.companyName}
              <input name="name" value={modalForm.name ?? ""} onChange={updateForm} placeholder="SwiftMart Retail" />
            </label>
            <label>
              {t.modal.phone}
              <input name="phone" value={modalForm.phone ?? ""} onChange={updateForm} placeholder="+234 800 100 1001" />
            </label>
            <label>
              {t.modal.location}
              <input name="location" value={modalForm.location ?? ""} onChange={updateForm} placeholder="Abuja" />
            </label>
          </div>
        </Modal>
      ) : null}

      {modal.type === "supplier" ? (
        <Modal
          title={modal.mode === "edit" ? t.modal.editSupplier : t.modal.addSupplier}
          onClose={closeModal}
          onSave={handleModalSave}
          saveLabel={modal.mode === "edit" ? t.common.edit : t.common.save}
          cancelLabel={t.common.cancel}
        >
          <div className="form-grid single">
            {modal.mode === "edit" ? (
              <label>
                {t.suppliers.supplierId}
                <input value={modalForm.id ?? ""} readOnly />
              </label>
            ) : null}
            <label>
              {t.auth.companyName}
              <input name="name" value={modalForm.name ?? ""} onChange={updateForm} placeholder="Diamond Cement" />
            </label>
            <label>
              {t.modal.phone}
              <input name="phone" value={modalForm.phone ?? ""} onChange={updateForm} placeholder="+255 700 000 000" />
            </label>
            <label>
              {t.modal.location}
              <input name="location" value={modalForm.location ?? ""} onChange={updateForm} placeholder="Mtwara" />
            </label>
            <label>
              {t.modal.buyingPrice}
              <input name="buyingPrice" type="number" value={modalForm.buyingPrice ?? ""} onChange={updateForm} placeholder="120000" />
            </label>
            <label>
              {t.modal.sellingPrice}
              <input name="sellingPrice" type="number" value={modalForm.sellingPrice ?? ""} onChange={updateForm} placeholder="145000" />
            </label>
          </div>
        </Modal>
      ) : null}

      {modal.type === "payment" ? (
        <Modal title={t.modal.recordPayment} onClose={closeModal} onSave={handleModalSave} saveLabel={t.common.save} cancelLabel={t.common.cancel}>
          <div className="form-grid single">
            <label>
              {t.modal.customer}
              <select name="customer" value={modalForm.customer ?? ""} onChange={updateForm}>
                {appData.customers.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.modal.amount}
              <input name="amount" type="number" value={modalForm.amount ?? ""} onChange={updateForm} placeholder="5000" />
            </label>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default App;

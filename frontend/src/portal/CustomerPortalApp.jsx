import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileDown,
  FileText,
  HelpCircle,
  Hexagon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  PackagePlus,
  Plus,
  Route,
  Shield,
  Truck,
  User,
  X,
} from "lucide-react";
import { buildBillDocument, downloadBillingDocument } from "../lib/billingDocuments";
import {
  clearPortalAuthSession,
  getApiErrorMessage,
  getPortalAuthSession,
  portalApi,
  setPortalAuthSession,
} from "../lib/portalApi";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Package },
  { id: "create-order", label: "Create Order", icon: PackagePlus },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "statement", label: "Account Statement", icon: ClipboardList },
  { id: "tracking", label: "Delivery Tracking", icon: MapPin },
  { id: "reports", label: "Reports", icon: FileDown },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
  { id: "support", label: "Support", icon: HelpCircle },
  { id: "logout", label: "Logout", icon: LogOut },
];

function formatMoney(value) {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `TSh ${new Intl.NumberFormat("en-TZ").format(safeAmount)}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusTone(status = "") {
  const value = String(status).toLowerCase();
  if (["delivered", "paid", "completed", "read", "approved"].some((item) => value.includes(item))) {
    return "green";
  }
  if (["transit", "partial", "in_progress", "inprogress", "dispatched"].some((item) => value.includes(item))) {
    return "blue";
  }
  if (["cancel", "overdue", "reject", "failed"].some((item) => value.includes(item))) {
    return "red";
  }
  return "amber";
}

function prettyStatus(status = "") {
  return String(status || "—")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractBusinessCodeFromPath(pathname = "") {
  const portalMatch = pathname.match(/\/portal\/login\/([^/?#]+)/i);
  if (portalMatch?.[1]) return decodeURIComponent(portalMatch[1]).toUpperCase();

  const hostMatch = pathname.match(/\/login\/([^/?#]+)/i);
  if (hostMatch?.[1]) return decodeURIComponent(hostMatch[1]).toUpperCase();

  return "";
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function mapInvoiceForBill(invoice, customerName) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customer: invoice.customer?.name ?? customerName ?? "Customer",
    customerId: invoice.customerId ?? "",
    total: invoice.totalAmount ?? 0,
    paid: invoice.paidAmount ?? 0,
    date: invoice.issueDate ? String(invoice.issueDate).slice(0, 10) : "",
    dueDate: invoice.dueDate ? String(invoice.dueDate).slice(0, 10) : "",
    status: String(invoice.status || "").toLowerCase(),
  };
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell == null ? "" : String(cell);
          if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
          return value;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value, icon: Icon, tone = "brand" }) {
  return (
    <div className="glass-card stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon ${tone}`}>
          <Icon size={18} />
        </div>
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${statusTone(status)}`}>
      <span className="status-dot" />
      {prettyStatus(status)}
    </span>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <span>{toast.message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

function PortalSidebar({
  items,
  currentPage,
  onNavigate,
  open,
  mobileOpen,
  isMobile,
  onClose,
  customerName,
  businessName,
}) {
  const expanded = isMobile ? mobileOpen : open;

  return (
    <>
      {isMobile && mobileOpen ? (
        <button type="button" className="sidebar-overlay" onClick={onClose} aria-label="Close sidebar" />
      ) : null}
      <aside className={`sidebar ${expanded ? "open" : "collapsed"} ${isMobile ? "mobile" : "desktop"}`}>
        <div className="brand-block">
          <div className="brand-mark">
            <Hexagon size={18} />
          </div>
          <div className="brand-copy">
            <div className="brand-name">CUSTOMER PORTAL</div>
            <div className="brand-tag">{businessName || "LogisticsFlow"}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${active ? "active" : ""}`}
                aria-label={item.label}
                title={!expanded && !isMobile ? item.label : undefined}
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
            {initials(customerName)}
          </div>
          <div className="sidebar-user-copy">
            <strong title={customerName}>{customerName || "Customer"}</strong>
            <span>Portal access</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function LoginPage({ businessCode, onLoginSuccess, showToast }) {
  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(Boolean(businessCode));
  const [customerCode, setCustomerCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!businessCode) {
      setLoadingBusiness(false);
      setError("Missing business login link. Use /login/LOG-0001.");
      return;
    }

    let cancelled = false;
    setLoadingBusiness(true);
    portalApi
      .getBusiness(businessCode)
      .then((item) => {
        if (!cancelled) {
          setBusiness(item);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setBusiness(null);
          setError(getApiErrorMessage(err, "Business not found."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingBusiness(false);
      });

    return () => {
      cancelled = true;
    };
  }, [businessCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!businessCode || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const session = await portalApi.login(businessCode, { customerCode, password });
      showToast("Signed in successfully.");
      onLoginSuccess(session);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to sign in. Check your Customer ID and password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell boot-splash">
      <div className="boot-splash-card" style={{ width: "min(100%, 420px)" }}>
        <div className="brand-block" style={{ justifyContent: "center" }}>
          <div className="brand-mark">
            <Hexagon size={20} />
          </div>
          <div className="brand-copy" style={{ textAlign: "left" }}>
            <div className="brand-name">LOGISTICSFLOW</div>
            <div className="brand-tag">Customer Portal</div>
          </div>
        </div>

        <form className="glass-card auth-card auth-card-fade-in" onSubmit={handleSubmit} style={{ width: "100%" }}>
          {loadingBusiness ? (
            <p className="helper-text">Loading company…</p>
          ) : (
            <>
              <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>
                {business?.companyName || business?.name || "Customer Login"}
              </h1>
              <p className="helper-text" style={{ marginTop: 0 }}>
                Customer Login
              </p>
            </>
          )}

          {error ? (
            <div className="toast toast-error" style={{ position: "static", marginBottom: 12 }}>
              <span>{error}</span>
            </div>
          ) : null}

          <label>
            Customer ID
            <input
              value={customerCode}
              onChange={(event) => setCustomerCode(event.target.value.toUpperCase())}
              placeholder="CUST-0001"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="button primary" disabled={submitting || !businessCode} style={{ width: "100%" }}>
            {submitting ? "Signing in…" : "Login"}
          </button>

          <p className="helper-text" style={{ marginBottom: 0 }}>
            Forgot password? Contact your logistics provider to reset your password.
          </p>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordGate({ mustChange, customer, onUpdated, showToast }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!mustChange) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await portalApi.changePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      onUpdated(updated);
      showToast("Password updated.");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to change password."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="glass-card auth-card" style={{ width: "min(100%, 420px)", margin: 24 }} role="dialog">
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <Shield size={18} />
          <h2 style={{ margin: 0, fontSize: 18 }}>Change temporary password</h2>
        </div>
        <p className="helper-text">
          Hi {customer?.name || "there"}, please set a new password before continuing.
        </p>
        <form className="form-grid single" onSubmit={handleSubmit}>
          <label>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Temporary password"
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CustomerPortalApp() {
  const businessCode = useMemo(
    () => extractBusinessCodeFromPath(typeof window !== "undefined" ? window.location.pathname : ""),
    [],
  );

  const [session, setSession] = useState(() => getPortalAuthSession());
  const [bootstrapping, setBootstrapping] = useState(Boolean(getPortalAuthSession()?.token));
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 960px)").matches : false,
  );
  const [toast, setToast] = useState(null);

  const [dashboard, setDashboard] = useState(null);
  const [ordersData, setOrdersData] = useState({ orders: [], shipments: [] });
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [statement, setStatement] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  const [orderForm, setOrderForm] = useState({
    origin: "",
    destination: "",
    cargoType: "Cement",
    quantity: "",
    weight: "",
    preferredPickupDate: "",
    notes: "",
  });
  const [profileForm, setProfileForm] = useState({
    phone: "",
    email: "",
    notifyEmail: true,
    notifySms: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 960px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!session?.token) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    setBootstrapping(true);
    portalApi
      .me()
      .then((data) => {
        if (cancelled) return;
        const next = {
          token: session.token,
          customer: data.customer,
          business: data.business,
        };
        setPortalAuthSession(next);
        setSession(next);
        setProfileForm((current) => ({
          ...current,
          phone: data.customer?.phone ?? "",
          email: data.customer?.email ?? "",
          notifyEmail: Boolean(data.customer?.notifyEmail),
          notifySms: Boolean(data.customer?.notifySms),
        }));
      })
      .catch(() => {
        if (cancelled) return;
        clearPortalAuthSession();
        setSession(null);
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshPageData = async (targetPage = page) => {
    if (!session?.token) return;
    setPageLoading(true);
    try {
      if (targetPage === "dashboard") {
        const summary = await portalApi.dashboard();
        setDashboard(summary);
      } else if (targetPage === "orders") {
        setOrdersData(await portalApi.listOrders());
      } else if (targetPage === "invoices" || targetPage === "reports") {
        setInvoices(await portalApi.listInvoices());
        if (targetPage === "reports") {
          setStatement(await portalApi.statement());
        }
      } else if (targetPage === "payments") {
        setPayments(await portalApi.listPayments());
      } else if (targetPage === "statement") {
        setStatement(await portalApi.statement());
      } else if (targetPage === "tracking") {
        setTracking(await portalApi.tracking());
      } else if (targetPage === "notifications") {
        setNotifications(await portalApi.listNotifications());
      } else if (targetPage === "profile") {
        const data = await portalApi.me();
        setSession((current) => {
          const next = {
            token: current?.token,
            customer: data.customer,
            business: data.business,
          };
          setPortalAuthSession(next);
          return next;
        });
        setProfileForm((current) => ({
          ...current,
          phone: data.customer?.phone ?? "",
          email: data.customer?.email ?? "",
          notifyEmail: Boolean(data.customer?.notifyEmail),
          notifySms: Boolean(data.customer?.notifySms),
        }));
      }
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to load portal data."), "error");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.token || bootstrapping) return;
    if (session.customer?.mustChangePassword) return;
    void refreshPageData(page);
  }, [page, session?.token, bootstrapping, session?.customer?.mustChangePassword]);

  const handleNavigate = async (nextPage) => {
    if (nextPage === "logout") {
      await portalApi.logout();
      setSession(null);
      setPage("dashboard");
      showToast("Signed out.");
      return;
    }
    setPage(nextPage);
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!orderForm.origin.trim() || !orderForm.destination.trim()) {
      showToast("Origin and destination are required.", "error");
      return;
    }
    setSaving(true);
    try {
      await portalApi.createOrder({
        origin: orderForm.origin.trim(),
        destination: orderForm.destination.trim(),
        cargoType: orderForm.cargoType.trim() || "Cement",
        quantity: Number(orderForm.quantity) || 0,
        weight: Number(orderForm.weight) || 0,
        preferredPickupDate: orderForm.preferredPickupDate || null,
        notes: orderForm.notes.trim(),
      });
      setOrderForm({
        origin: "",
        destination: "",
        cargoType: "Cement",
        quantity: "",
        weight: "",
        preferredPickupDate: "",
        notes: "",
      });
      showToast("Order submitted for approval.");
      setPage("orders");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to create order."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      const full = invoice.customer ? invoice : await portalApi.getInvoice(invoice.id);
      const mapped = mapInvoiceForBill(full, session?.customer?.name);
      const bill = buildBillDocument(mapped, session?.business);
      downloadBillingDocument(bill, {
        billTitle: "Invoice",
        invoice: "Invoice",
        customer: "Customer",
        issueDate: "Issue date",
        dueDate: "Due date",
        total: "Total",
        paid: "Paid",
        balance: "Balance",
        status: "Status",
      });
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to download invoice."), "error");
    }
  };

  const handleDownloadStatementCsv = () => {
    if (!statement) return;
    const rows = [
      ["Type", "Reference", "Date", "Amount", "Paid", "Balance/Status"],
      ...(statement.invoices ?? []).map((invoice) => [
        "Invoice",
        invoice.invoiceNumber,
        formatDate(invoice.issueDate),
        invoice.totalAmount,
        invoice.paidAmount,
        Math.max(0, (invoice.totalAmount ?? 0) - (invoice.paidAmount ?? 0)),
      ]),
      ...(statement.payments ?? []).map((payment) => [
        "Payment",
        payment.invoice?.invoiceNumber || payment.id,
        formatDate(payment.paidAt),
        payment.amount,
        payment.amount,
        payment.method || "PAID",
      ]),
      [],
      ["Totals", "", "", statement.totals?.billed ?? 0, statement.totals?.paid ?? 0, statement.totals?.outstanding ?? 0],
    ];
    downloadCsv(`statement-${session?.customer?.customerCode || "customer"}.csv`, rows);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const updated = await portalApi.updateProfile({
        phone: profileForm.phone,
        email: profileForm.email || null,
        notifyEmail: Boolean(profileForm.notifyEmail),
        notifySms: Boolean(profileForm.notifySms),
      });

      if (profileForm.newPassword) {
        if (profileForm.newPassword.length < 8) {
          showToast("Password must be at least 8 characters.", "error");
          setSaving(false);
          return;
        }
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          showToast("Passwords do not match.", "error");
          setSaving(false);
          return;
        }
        await portalApi.changePassword({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword,
        });
      }

      setSession((current) => {
        const next = {
          ...current,
          customer: { ...current?.customer, ...updated, mustChangePassword: false },
        };
        setPortalAuthSession(next);
        return next;
      });
      setProfileForm((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      showToast("Profile updated.");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to update profile."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await portalApi.markNotificationRead(id);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, status: "READ" } : item)),
      );
      setDashboard((current) =>
        current
          ? {
              ...current,
              notifications: (current.notifications ?? []).map((item) =>
                item.id === id ? { ...item, status: "READ" } : item,
              ),
            }
          : current,
      );
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to update notification."), "error");
    }
  };

  if (bootstrapping) {
    return (
      <div className="boot-splash">
        <div className="boot-splash-card">
          <div className="boot-splash-logo-wrap">
            <div className="boot-splash-logo">LF</div>
          </div>
          <p>Loading customer portal…</p>
        </div>
      </div>
    );
  }

  if (!session?.token) {
    return (
      <>
        <LoginPage
          businessCode={businessCode || session?.business?.businessId || ""}
          onLoginSuccess={(next) => {
            setSession(next);
            setProfileForm((current) => ({
              ...current,
              phone: next.customer?.phone ?? "",
              email: next.customer?.email ?? "",
              notifyEmail: Boolean(next.customer?.notifyEmail),
              notifySms: Boolean(next.customer?.notifySms),
            }));
          }}
          showToast={showToast}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  const customer = session.customer;
  const business = session.business;

  const renderDashboard = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {customer?.name || "customer"}.</p>
        </div>
      </section>
      <section className="stats-grid">
        <StatCard label="Outstanding Balance" value={formatMoney(dashboard?.outstandingBalance)} icon={CircleDollarSign} tone="amber" />
        <StatCard label="Available Credit" value={formatMoney(dashboard?.availableCredit)} icon={CreditCard} tone="green" />
        <StatCard label="Orders" value={dashboard?.orders ?? 0} icon={Package} />
        <StatCard label="Pending Orders" value={dashboard?.pendingOrders ?? 0} icon={Route} tone="amber" />
        <StatCard label="Delivered Orders" value={dashboard?.deliveredOrders ?? 0} icon={Truck} tone="green" />
        <StatCard label="Invoices" value={dashboard?.invoices ?? 0} icon={FileText} />
        <StatCard label="Payments" value={dashboard?.payments ?? 0} icon={CreditCard} tone="blue" />
      </section>
      <section className="glass-card activity-card">
        <div className="card-head">
          <strong>Latest notifications</strong>
        </div>
        {(dashboard?.notifications ?? []).length ? (
          <div className="activity-list">
            {dashboard.notifications.map((item) => (
              <article key={item.id} className="activity-item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <span className="helper-text">{formatDate(item.createdAt)}</span>
                </div>
                {item.status !== "READ" ? (
                  <button type="button" className="inline-link" onClick={() => handleMarkRead(item.id)}>
                    Mark read
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="helper-text">No notifications yet.</p>
        )}
      </section>
    </div>
  );

  const renderOrders = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Order requests and shipments linked to your account.</p>
        </div>
        <button type="button" className="button primary" onClick={() => setPage("create-order")}>
          <Plus size={16} />
          Create Order
        </button>
      </section>

      <section className="glass-card table-card">
        <strong>Order requests</strong>
        {(ordersData.orders ?? []).length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Route</th>
                  <th>Cargo</th>
                  <th>Qty / Weight</th>
                  <th>Pickup</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderCode}</td>
                    <td>
                      {order.origin} → {order.destination}
                    </td>
                    <td>{order.cargoType}</td>
                    <td>
                      {order.quantity} / {order.weight}
                    </td>
                    <td>{formatDate(order.preferredPickupDate)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="helper-text">No order requests yet.</p>
        )}
      </section>

      <section className="glass-card table-card">
        <strong>Shipments</strong>
        {(ordersData.shipments ?? []).length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Shipment</th>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{shipment.shipmentCode}</td>
                    <td>
                      {shipment.origin} → {shipment.destination}
                    </td>
                    <td>{shipment.vehicle?.headPlateNumber || "—"}</td>
                    <td>{shipment.driver?.fullName || "—"}</td>
                    <td>
                      <StatusBadge status={shipment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="helper-text">No shipments yet.</p>
        )}
      </section>
    </div>
  );

  const renderCreateOrder = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Create Order</h1>
          <p>Submit a new transport request for approval.</p>
        </div>
      </section>
      <form className="glass-card settings-card" onSubmit={handleCreateOrder}>
        <div className="form-grid">
          <label>
            Origin
            <input
              value={orderForm.origin}
              onChange={(event) => setOrderForm((current) => ({ ...current, origin: event.target.value }))}
              required
            />
          </label>
          <label>
            Destination
            <input
              value={orderForm.destination}
              onChange={(event) => setOrderForm((current) => ({ ...current, destination: event.target.value }))}
              required
            />
          </label>
          <label>
            Cargo type
            <input
              value={orderForm.cargoType}
              onChange={(event) => setOrderForm((current) => ({ ...current, cargoType: event.target.value }))}
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="0"
              step="any"
              value={orderForm.quantity}
              onChange={(event) => setOrderForm((current) => ({ ...current, quantity: event.target.value }))}
            />
          </label>
          <label>
            Weight
            <input
              type="number"
              min="0"
              step="any"
              value={orderForm.weight}
              onChange={(event) => setOrderForm((current) => ({ ...current, weight: event.target.value }))}
            />
          </label>
          <label>
            Preferred pickup date
            <input
              type="date"
              value={orderForm.preferredPickupDate}
              onChange={(event) =>
                setOrderForm((current) => ({ ...current, preferredPickupDate: event.target.value }))
              }
            />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Notes
            <textarea
              rows={3}
              value={orderForm.notes}
              onChange={(event) => setOrderForm((current) => ({ ...current, notes: event.target.value }))}
            />
          </label>
        </div>
        <div className="header-actions" style={{ marginTop: 16 }}>
          <button type="submit" className="button primary" disabled={saving}>
            {saving ? "Submitting…" : "Submit order"}
          </button>
        </div>
      </form>
    </div>
  );

  const renderInvoices = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>View and download your invoices.</p>
        </div>
      </section>
      <section className="glass-card table-card">
        {invoices.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Issue date</th>
                  <th>Due date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const balance = Math.max(0, (invoice.totalAmount ?? 0) - (invoice.paidAmount ?? 0));
                  return (
                    <tr key={invoice.id}>
                      <td>{invoice.invoiceNumber}</td>
                      <td>{formatDate(invoice.issueDate)}</td>
                      <td>{formatDate(invoice.dueDate)}</td>
                      <td>{formatMoney(invoice.totalAmount)}</td>
                      <td>{formatMoney(invoice.paidAmount)}</td>
                      <td>{formatMoney(balance)}</td>
                      <td>
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td>
                        <button type="button" className="inline-link" onClick={() => handleDownloadInvoice(invoice)}>
                          <FileDown size={14} /> Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="helper-text">No invoices yet.</p>
        )}
      </section>
    </div>
  );

  const renderPayments = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Payment history against your invoices.</p>
        </div>
      </section>
      <section className="glass-card table-card">
        {payments.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td>{payment.invoice?.invoiceNumber || "—"}</td>
                    <td>{prettyStatus(payment.method)}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td>{payment.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="helper-text">No payments yet.</p>
        )}
      </section>
    </div>
  );

  const renderStatement = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Account Statement</h1>
          <p>Totals across invoices and payments.</p>
        </div>
        <button type="button" className="button secondary" onClick={handleDownloadStatementCsv} disabled={!statement}>
          <FileDown size={16} />
          Download CSV
        </button>
      </section>
      <section className="stats-grid">
        <StatCard label="Billed" value={formatMoney(statement?.totals?.billed)} icon={FileText} />
        <StatCard label="Paid" value={formatMoney(statement?.totals?.paid)} icon={CreditCard} tone="green" />
        <StatCard label="Outstanding" value={formatMoney(statement?.totals?.outstanding)} icon={CircleDollarSign} tone="amber" />
      </section>
      <section className="glass-card table-card">
        <strong>Invoices on statement</strong>
        {(statement?.invoices ?? []).length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {statement.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{formatDate(invoice.issueDate)}</td>
                    <td>{formatMoney(invoice.totalAmount)}</td>
                    <td>{formatMoney(invoice.paidAmount)}</td>
                    <td>{formatMoney(Math.max(0, (invoice.totalAmount ?? 0) - (invoice.paidAmount ?? 0)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="helper-text">No statement lines yet.</p>
        )}
      </section>
    </div>
  );

  const renderTracking = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Delivery Tracking</h1>
          <p>Live shipment status, vehicle, driver, and proof of delivery.</p>
        </div>
      </section>
      <section className={tracking.length ? "card-grid three" : "empty-state-section"}>
        {tracking.length ? (
          tracking.map((item) => (
            <article key={item.shipmentNumber} className="glass-card info-card">
              <div className="card-head">
                <div>
                  <strong>{item.shipmentNumber}</strong>
                  <span>
                    {item.origin} → {item.destination}
                  </span>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="customer-meta">
                <span>
                  <Truck size={14} /> {item.vehicle}
                </span>
                <span>
                  <User size={14} /> {item.driver}
                </span>
                <span>
                  <MapPin size={14} /> Delivery: {formatDate(item.deliveryDate)}
                </span>
                <span>
                  <ClipboardList size={14} /> POD:{" "}
                  {item.proofOfDelivery?.deliveryCode || item.proofOfDelivery?.status || "—"}
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state glass-card">
            <strong>No tracking records</strong>
            <span>Shipments will appear here once created.</span>
          </div>
        )}
      </section>
    </div>
  );

  const renderReports = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Download a simple account statement CSV.</p>
        </div>
        <button type="button" className="button primary" onClick={handleDownloadStatementCsv} disabled={!statement}>
          <FileDown size={16} />
          Download statement
        </button>
      </section>
      <section className="glass-card settings-card">
        <p className="helper-text" style={{ marginTop: 0 }}>
          Statement totals: billed {formatMoney(statement?.totals?.billed)}, paid{" "}
          {formatMoney(statement?.totals?.paid)}, outstanding {formatMoney(statement?.totals?.outstanding)}.
        </p>
      </section>
    </div>
  );

  const renderNotifications = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Order, invoice, and delivery updates.</p>
        </div>
      </section>
      <section className="glass-card activity-card">
        {notifications.length ? (
          <div className="activity-list">
            {notifications.map((item) => (
              <article key={item.id} className="activity-item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <span className="helper-text">
                    {formatDate(item.createdAt)} · {prettyStatus(item.status)}
                  </span>
                </div>
                {item.status !== "READ" ? (
                  <button type="button" className="button secondary" onClick={() => handleMarkRead(item.id)}>
                    Mark read
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="helper-text">No notifications yet.</p>
        )}
      </section>
    </div>
  );

  const renderProfile = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Update contact details and password.</p>
        </div>
      </section>
      <form className="glass-card settings-card" onSubmit={handleSaveProfile}>
        <div className="form-grid">
          <label>
            Customer ID
            <input value={customer?.customerCode || ""} readOnly />
          </label>
          <label>
            Name
            <input value={customer?.name || ""} readOnly />
          </label>
          <label>
            Phone
            <input
              value={profileForm.phone}
              onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={profileForm.email}
              onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label className="checkbox-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={Boolean(profileForm.notifyEmail)}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, notifyEmail: event.target.checked }))
              }
            />
            Notify by email
          </label>
          <label className="checkbox-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={Boolean(profileForm.notifySms)}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, notifySms: event.target.checked }))
              }
            />
            Notify by SMS
          </label>
        </div>

        <h3 style={{ marginTop: 24 }}>Change password</h3>
        <div className="form-grid">
          <label>
            Current password
            <input
              type="password"
              value={profileForm.currentPassword}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, currentPassword: event.target.value }))
              }
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={profileForm.newPassword}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, newPassword: event.target.value }))
              }
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={profileForm.confirmPassword}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="header-actions" style={{ marginTop: 16 }}>
          <button type="submit" className="button primary" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSupport = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Support</h1>
          <p>Need help with your account or deliveries?</p>
        </div>
      </section>
      <section className="glass-card settings-card">
        <strong>{business?.companyName || business?.name || "Your logistics provider"}</strong>
        <p className="helper-text">
          Contact your logistics provider for password resets, invoice questions, delivery updates, and credit limit
          changes. Use the Notifications page for automated order and payment updates.
        </p>
        <ul className="helper-text">
          <li>Password reset: ask your provider to regenerate portal access.</li>
          <li>Order changes: submit a new request or contact dispatch.</li>
          <li>Billing: download invoices from the Invoices page.</li>
        </ul>
      </section>
    </div>
  );

  const renderPage = () => {
    if (pageLoading && !["create-order", "support", "profile"].includes(page)) {
      return (
        <div className="page-stack">
          <section className="glass-card settings-card">
            <p className="helper-text">Loading…</p>
          </section>
        </div>
      );
    }

    switch (page) {
      case "orders":
        return renderOrders();
      case "create-order":
        return renderCreateOrder();
      case "invoices":
        return renderInvoices();
      case "payments":
        return renderPayments();
      case "statement":
        return renderStatement();
      case "tracking":
        return renderTracking();
      case "reports":
        return renderReports();
      case "notifications":
        return renderNotifications();
      case "profile":
        return renderProfile();
      case "support":
        return renderSupport();
      case "dashboard":
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-shell">
      <PortalSidebar
        items={NAV_ITEMS}
        currentPage={page}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
        onClose={() => setMobileOpen(false)}
        customerName={customer?.name}
        businessName={business?.companyName || business?.name}
      />

      <main className={`main-panel ${!isMobile && !sidebarOpen ? "sidebar-collapsed" : ""}`}>
        <button
          type="button"
          className="shell-menu-button"
          onClick={() => (isMobile ? setMobileOpen(true) : setSidebarOpen((value) => !value))}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        {renderPage()}
      </main>

      <ChangePasswordGate
        mustChange={Boolean(customer?.mustChangePassword)}
        customer={customer}
        onUpdated={(updated) => {
          setSession((current) => {
            const next = {
              ...current,
              customer: { ...current?.customer, ...updated, mustChangePassword: false },
            };
            setPortalAuthSession(next);
            return next;
          });
        }}
        showToast={showToast}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

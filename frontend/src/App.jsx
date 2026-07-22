import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BadgeAlert,
  ArrowUpRight,
  BarChart3,
  Box,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  Gauge,
  Hammer,
  ImageIcon,
  Menu,
  Package,
  Paperclip,
  Phone,
  Plus,
  Route,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  UserPlus,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import BootSplash from "./components/auth/BootSplash";
import SignUpPage from "./components/auth/SignUpPage";
import MaintenanceFormModal, {
  createEmptyMaintenanceDetails,
  createEmptyMaintenancePart,
  MAINTENANCE_FORM_STATUS_KEYS,
  MAINTENANCE_FORM_TYPE_KEYS,
} from "./components/maintenance/MaintenanceFormModal";
import { emptyAppData, navigation } from "./data/appConfig";
import {
  buildBillDocument,
  buildPaymentReceipt,
  buildReceiptFromInvoice,
  downloadBillingDocument,
  formatPaymentMethodLabel,
  formatReceiptMoney,
  invoiceBalance,
  moneyValue,
  shareBillingDocument,
} from "./lib/billingDocuments";
import {
  buildReportCsv,
  buildReportPdf,
  buildSectorRows,
  buildSectorSummary,
  downloadReportFile,
  filterSectorItems,
  getSectorItems,
  REPORT_SECTOR_IDS,
} from "./lib/reportDocuments";
import { configureApiClient, getApiErrorMessage, getSession, setSession as persistSession, clearSession as clearPersistedSession } from "./lib/apiClient";
import {
  assignmentsApi,
  authApi,
  billingApi,
  customersApi,
  dashboardApi,
  deliveriesApi,
  fleetApi,
  maintenanceApi,
  notificationsApi,
  paymentsApi,
  reportsApi,
  rolesApi,
  shipmentsApi,
  suppliersApi,
  teamApi,
  uploadsApi,
} from "./lib/api";
import {
  createDashboardActivity,
  mapCustomerRecord,
  mapDeliveryRecord,
  mapFleetRecord,
  mapInvoiceToPaymentCard,
  mapMaintenanceRecord,
  mapNotificationRecord,
  mapShipmentRecord,
  mapSupplierRecord,
} from "./lib/adapters";

const translations = {
  en: {
    pages: {
      dashboard: "Dashboard",
      "my-work": "My Work",
      "assign-work": "Assign Work",
      fleet: "Fleet",
      shipments: "Shipments",
      deliveries: "Deliveries",
      customers: "Customers",
      suppliers: "Suppliers",
      maintenance: "Maintenance",
      billing: "Billing",
      reports: "Reports",
      settings: "Settings",
    },
    nav: {
      dashboard: "Dashboard",
      "my-work": "My Work",
      "assign-work": "Assign Work",
      fleet: "Fleet",
      shipments: "Shipments",
      deliveries: "Deliveries",
      customers: "Customers",
      suppliers: "Suppliers",
      maintenance: "Maintenance",
      billing: "Billing",
      reports: "Reports",
      settings: "Settings",
    },
    mobile: {
      dashboard: "Home",
      "my-work": "Work",
      "assign-work": "Assign",
      fleet: "Fleet",
      maintenance: "Service",
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
      yesterday: "Yesterday",
      thisWeek: "This Week",
      thisMonth: "This Month",
      byDate: "By Date",
      customRange: "Custom range",
      date: "Date",
      cleared: "Cleared",
      fullyPaid: "Fully paid",
      remaining: "remaining",
      paid: "paid",
      noRecordsTitle: "No records yet",
      noRecordsText: "Add your first entry to get started.",
      noActivityTitle: "No activity yet",
      noActivityText: "Activity will appear here as work starts.",
      noTeamTitle: "No team members yet",
      noTeamText: "Invite users when you are ready.",
      download: "Download",
      exportPdf: "Export PDF",
      exportExcel: "Export Excel",
      exportCsv: "Export CSV",
      from: "From",
      to: "To",
      filter: "Filter",
      status: "Status",
      notes: "Notes",
      total: "Total",
      actions: "Actions",
      files: "Files",
      permissions: "Permissions",
      upcoming: "Upcoming",
      history: "History",
      overview: "Overview",
      maintenance: "Maintenance",
    },
    auth: {
      signupTag: "Start managing your logistics business",
      signupTitle: "Create account",
      signupText: "Set up fleet, deliveries, billing, and reports in one place.",
      companyName: "Company name",
      businessId: "Business ID",
      email: "Email",
      loginId: "Name or email",
      loginIdPlaceholder: "Your name or email",
      password: "Password",
      createAccount: "Create account",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
      loginTag: "Manage your fleet and deliveries in one place",
      welcome: "Welcome back",
      loginText: "Sign in with your Business ID, name or email, and password.",
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
      filterLabel: "Period",
      operationsTitle: "Operations Overview",
      operationsText: "A simple summary of what the team needs to focus on for the selected period.",
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
    maintenance: {
      intro: "Track servicing, repairs, parts, workshops, and vehicle health in one place.",
      addMaintenance: "Add Maintenance",
      totalVehicles: "Total Vehicles",
      underMaintenance: "Vehicles Under Maintenance",
      dueSoon: "Service Due Soon",
      monthlyCost: "Monthly Maintenance Cost",
      openRepairs: "Open Repairs",
      recordsTitle: "Maintenance Records",
      recordsText: "Keep a clean service history for every vehicle.",
      vehicle: "Vehicle",
      plateNumber: "Plate Number",
      maintenanceDate: "Maintenance Date",
      maintenanceType: "Maintenance Type",
      workshop: "Workshop",
      mechanic: "Mechanic",
      currentMileage: "Current Mileage",
      totalCost: "Total Cost",
      laborCost: "Labor Cost",
      partsCost: "Parts Cost",
      otherExpenses: "Other Expenses",
      nextServiceDate: "Next Service Date",
      nextServiceMileage: "Next Service Mileage",
      description: "Description",
      partsReplaced: "Parts Replaced",
      saveRecord: "Save Maintenance Record",
      filesUploaded: "Uploads",
      invoices: "Invoices",
      receipts: "Receipts",
      photos: "Photos",
      documents: "PDF Documents",
      addPart: "Add Another Part",
      partName: "Part Name",
      brand: "Brand",
      quantity: "Quantity",
      unitPrice: "Unit Price",
      totalPrice: "Total Price",
      supplier: "Supplier",
      pending: "Pending",
      inProgress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      oilChange: "Oil Change",
      engineService: "Engine Service",
      brakeService: "Brake Service",
      batteryReplacement: "Battery Replacement",
      tyreReplacement: "Tyre Replacement",
      transmission: "Transmission",
      suspension: "Suspension",
      electrical: "Electrical",
      accidentRepair: "Accident Repair",
      generalService: "General Service",
      other: "Other",
      engineRepair: "Engine Repair",
      airConditioning: "Air Conditioning",
      formIntro: "Capture a complete service record for your fleet.",
      sectionVehicle: "Vehicle information",
      sectionVehicleText: "Select the vehicle and service basics.",
      sectionDetails: "Maintenance details",
      sectionDetailsText: "Describe the work and set priority.",
      sectionParts: "Parts replaced",
      sectionPartsText: "Add every part used on this job.",
      sectionCosts: "Cost summary",
      sectionCostsText: "Totals update automatically as you type.",
      sectionAttachments: "Attachments",
      sectionAttachmentsText: "Upload invoices, receipts, and photos.",
      sectionNotes: "Notes",
      sectionNotesText: "Extra context for technicians and auditors.",
      vehicleSearch: "Search vehicles",
      vehicleSearchPlaceholder: "Search by plate or driver",
      selectVehicle: "Select a vehicle",
      plateAutoFill: "Auto-filled from vehicle",
      odometer: "Odometer reading",
      odometerPlaceholder: "e.g. 120000",
      mechanicPlaceholder: "Lead mechanic name",
      workshopOptional: "Workshop",
      workshopPlaceholder: "Workshop or garage name",
      optional: "Optional",
      priority: "Priority",
      descriptionPlaceholder: "Describe the maintenance work completed.",
      selectOption: "Select an option",
      tyreDetails: "Tyre replacement details",
      tyrePosition: "Tyre position",
      tyreSerialNumber: "Tyre serial number",
      tyreSerialPlaceholder: "Serial / DOT code",
      tyreSize: "Tyre size",
      tyreSizePlaceholder: "e.g. 295/80R22.5",
      tyreManufacturer: "Manufacturer",
      tyreManufacturerPlaceholder: "e.g. Michelin",
      expectedReplacementMileage: "Expected replacement mileage",
      expectedMileagePlaceholder: "e.g. 180000",
      batteryDetails: "Battery replacement details",
      batteryBrand: "Battery brand",
      batteryBrandPlaceholder: "e.g. Bosch",
      batterySerialNumber: "Battery serial number",
      batterySerialPlaceholder: "Serial number",
      batteryCapacityAh: "Capacity (Ah)",
      batteryCapacityPlaceholder: "e.g. 100",
      batteryWarranty: "Warranty",
      batteryWarrantyPlaceholder: "e.g. 18 months",
      oilDetails: "Oil change details",
      oilBrand: "Oil brand",
      oilBrandPlaceholder: "e.g. Shell",
      oilGrade: "Oil grade",
      oilGradePlaceholder: "e.g. 15W-40",
      oilQuantityLitres: "Quantity (litres)",
      oilQuantityPlaceholder: "e.g. 8",
      brakeDetails: "Brake service details",
      brakePosition: "Brake position",
      brakePositionPlaceholder: "e.g. Front axle",
      brakeBrand: "Brand",
      brakeBrandPlaceholder: "e.g. Bendix",
      part: "Part",
      removePart: "Remove",
      partNamePlaceholder: "e.g. Oil filter",
      partNumber: "Part number / SKU",
      partNumberPlaceholder: "SKU or part number",
      brandPlaceholder: "Brand name",
      autoCalculated: "Auto calculated",
      grandTotal: "Grand total",
      dropFiles: "Drop files here or click to upload",
      dropFilesHint: "Invoice, receipt, or maintenance photos",
      uploading: "Uploading…",
      remove: "Remove",
      notesPlaceholder: "Additional notes for the service team…",
      saveMaintenance: "Save Maintenance",
      priorityLow: "Low",
      priorityMedium: "Medium",
      priorityHigh: "High",
      frontLeft: "Front Left",
      frontRight: "Front Right",
      rearLeft: "Rear Left",
      rearRight: "Rear Right",
      spare: "Spare",
      alertsTitle: "Service Alerts",
      alertsText: "Upcoming and overdue service reminders.",
      noAlerts: "No maintenance alerts right now.",
      analyticsTitle: "Maintenance Analytics",
      analyticsText: "Cost, parts, and repair patterns for your fleet.",
      monthlyCostChart: "Monthly Maintenance Cost",
      vehicleCostChart: "Maintenance Cost per Vehicle",
      partsChart: "Most Replaced Parts",
      typeChart: "Maintenance Type Distribution",
      serviceHistory: "Maintenance History",
      upcomingService: "Upcoming Service",
      repairHistory: "Repair History",
      invoicesPhotos: "Invoices & Photos",
      totalMaintenanceCost: "Total Maintenance Cost",
      lastServiceDate: "Last Service Date",
      dueInDays: "Service due in 5 days",
      overdueMileage: "Vehicle has exceeded service mileage",
      oilChangeOverdue: "Oil change overdue",
      noHistory: "No maintenance history yet.",
      noUploads: "No uploads attached.",
      filterVehicle: "Vehicle",
      filterType: "Maintenance Type",
      filterWorkshop: "Workshop",
      filterMechanic: "Mechanic",
      filterStatus: "Status",
      reportsTitle: "Maintenance Exports",
      reportsText: "Filter records and export them for audit or review.",
      permissionView: "View",
      permissionCreate: "Create",
      permissionEdit: "Edit",
      permissionDelete: "Delete",
      permissionApprove: "Approve",
      permissionExport: "Export",
    },
    billing: {
      intro: "Track invoices, payments, and outstanding balances.",
      recordPayment: "Record Payment",
      totalOwed: "Total Owed",
      collected: "Collected",
      outstanding: "Outstanding",
      invoice: "Invoice",
      customer: "Customer",
      issueDate: "Issued",
      dueDate: "Due",
      total: "Total",
      paid: "Paid",
      balance: "Balance",
      status: "Status",
      actions: "Actions",
      pay: "Pay",
      viewBill: "View bill",
      downloadReceipt: "Download receipt",
      shareReceipt: "Share",
      receipt: "Receipt",
      receiptReady: "Payment recorded. Receipt is ready.",
      billTitle: "Invoice details",
      receiptTitle: "Payment receipt",
      noBalance: "Fully paid",
      method: "Payment method",
      receiptNumber: "Receipt no.",
      company: "Company",
      thankYou: "Thank you for your payment.",
      statusOpen: "Open",
      statusPartial: "Partial",
      statusPaid: "Paid",
      statusOverdue: "Overdue",
      amountPaidLabel: "Amount paid",
      billedTo: "Billed to",
      paymentSuccessful: "Payment successful",
      paymentPartial: "Partial payment received",
      thisPayment: "This payment",
      invoiceTotal: "Invoice total",
      remainingBalance: "Remaining balance",
      description: "Description",
      serviceLine: "Payment toward invoice",
      paidOn: "Paid on",
      poweredBy: "Powered by LogisticsFlow",
      methodBank: "Bank transfer",
      methodCash: "Cash",
      methodMobile: "Mobile money",
      methodCard: "Card",
      viewReceipt: "View receipt",
      downloadBill: "Download bill",
      shareBill: "Share bill",
      amountDue: "Amount due",
      billServiceLine: "Logistics services for invoice",
      billOpen: "Bill issued",
      noReceiptYet: "No receipt yet. Record a payment first.",
    },
    reports: {
      intro: "Choose a sector, filter by period, and download a modern report.",
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
      sectorsTitle: "Report sectors",
      sectorsText: "Only sectors with data in your system are shown.",
      previewTitle: "Report preview",
      previewText: "This is what your export will include for the selected period.",
      period: "Period",
      generated: "Generated",
      reportBadge: "Report",
      noRecords: "No records for this period.",
      noSectors: "No sector data yet. Add records to unlock reports.",
      downloadReady: "Report downloaded.",
      records: "Records",
      invoiced: "Invoiced",
      collected: "Collected",
      outstanding: "Outstanding",
      delivered: "Delivered",
      inTransit: "In transit",
      pending: "Pending",
      active: "Active",
      other: "Other",
      totalCost: "Total cost",
      code: "Code",
      origin: "Origin",
      destination: "Destination",
      vehicle: "Vehicle",
      quantity: "Quantity",
      date: "Date",
      plate: "Plate",
      trailer: "Trailer",
      driver: "Driver",
      phone: "Phone",
      ownership: "Ownership",
      id: "ID",
      name: "Name",
      location: "Location",
      buyingPrice: "Buying",
      sellingPrice: "Selling",
      type: "Type",
      workshop: "Workshop",
      mechanic: "Mechanic",
      cost: "Cost",
      invoice: "Invoice",
      customer: "Customer",
      issueDate: "Issued",
      dueDate: "Due",
      total: "Total",
      paid: "Paid",
      balance: "Balance",
      status: "Status",
    },
    settings: {
      intro: "Manage your company, roles, and worker login access.",
      companyProfile: "Company Profile",
      supportEmail: "Support email",
      phone: "Phone",
      workspaceType: "Account type",
      teamRoles: "Team & Roles",
      inviteUser: "Add Worker",
      createRole: "Create Role",
      workerName: "Worker full name",
      workerEmail: "Worker email",
      workerPassword: "Temporary password",
      workerPhone: "Phone (optional)",
      selectRole: "Assign role",
      roleName: "Role name",
      roleDescription: "Role description",
      rolePermissions: "Permissions",
      workers: "Workers",
      roles: "Roles",
      assignWork: "Assign Work",
      assignmentType: "Work type",
      assignmentTitle: "Task title",
      assignmentDescription: "Task details",
      deliveryType: "Delivery",
      maintenanceType: "Maintenance",
      assignWorker: "Assign to worker",
      createAssignment: "Create assignment",
      loginHint: "Workers sign in with your Business ID + their name or email + password.",
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
      maintenanceVehicle: "Vehicle",
      maintenanceDate: "Maintenance Date",
      currentMileage: "Current Mileage",
      workshopName: "Workshop Name",
      mechanicName: "Mechanic Name",
      maintenanceType: "Maintenance Type",
      description: "Description",
      partsReplaced: "Parts Replaced",
      laborCost: "Labor Cost",
      partsCost: "Parts Cost",
      otherExpenses: "Other Expenses",
      totalCost: "Total Cost",
      nextServiceDate: "Next Service Date",
      nextServiceMileage: "Next Service Mileage",
      status: "Status",
      notes: "Notes",
    },
    toast: {
      fillFleet: "Please complete all fleet fields",
      fleetAdded: "Fleet vehicle added",
      fleetUpdated: "Fleet vehicle updated",
      fleetDeleted: "Fleet vehicle deleted",
      confirmFleetDelete: "Delete this vehicle from the fleet?",
      confirmFleetDeleteTitle: "Delete vehicle",
      confirmFleetDeleteBody: "This removes the vehicle from your fleet. You can’t undo this action.",
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
      fillMaintenance: "Please complete the required maintenance details",
      maintenanceSaved: "Maintenance record saved",
      maintenanceUpdated: "Maintenance record updated",
      maintenanceDeleted: "Maintenance record deleted",
      confirmMaintenanceDelete: "Delete this maintenance record?",
      confirmMaintenanceDeleteTitle: "Delete maintenance record",
      confirmMaintenanceDeleteBody: "This permanently deletes the maintenance record and its attachments.",
      signedIn: "Signed in successfully",
      workspaceCreated: "Your account is ready",
      businessIdCreated: "Your Business ID is",
      deliveryUpdated: "Delivery updated",
    },
  },
  sw: {
    pages: {
      dashboard: "Dashibodi",
      "my-work": "Kazi Yangu",
      "assign-work": "Gawa Kazi",
      fleet: "Magari",
      shipments: "Mizigo",
      deliveries: "Uwasilishaji",
      customers: "Wateja",
      suppliers: "Wasambazaji",
      maintenance: "Matengenezo",
      billing: "Malipo",
      reports: "Ripoti",
      settings: "Mipangilio",
    },
    nav: {
      dashboard: "Dashibodi",
      "my-work": "Kazi Yangu",
      "assign-work": "Gawa Kazi",
      fleet: "Magari",
      shipments: "Mizigo",
      deliveries: "Uwasilishaji",
      customers: "Wateja",
      suppliers: "Wasambazaji",
      maintenance: "Matengenezo",
      billing: "Malipo",
      reports: "Ripoti",
      settings: "Mipangilio",
    },
    mobile: {
      dashboard: "Nyumbani",
      "my-work": "Kazi",
      "assign-work": "Gawa",
      fleet: "Magari",
      maintenance: "Service",
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
      yesterday: "Jana",
      thisWeek: "Wiki hii",
      thisMonth: "Mwezi huu",
      byDate: "Kwa tarehe",
      customRange: "Kipindi maalum",
      date: "Tarehe",
      cleared: "Imelipwa",
      fullyPaid: "Imelipwa yote",
      remaining: "imebaki",
      paid: "imelipwa",
      noRecordsTitle: "Bado hakuna taarifa",
      noRecordsText: "Ongeza taarifa ya kwanza kuanza.",
      noActivityTitle: "Bado hakuna shughuli",
      noActivityText: "Shughuli zitaonekana hapa kazi inapoanza.",
      noTeamTitle: "Bado hakuna wanatimu",
      noTeamText: "Alika watumiaji ukiwa tayari.",
      download: "Pakua",
      exportPdf: "Pakua PDF",
      exportExcel: "Pakua Excel",
      exportCsv: "Pakua CSV",
      from: "Kuanzia",
      to: "Mpaka",
      filter: "Chuja",
      status: "Hali",
      notes: "Maelezo",
      total: "Jumla",
      actions: "Vitendo",
      files: "Faili",
      permissions: "Ruhusa",
      upcoming: "Yanayokuja",
      history: "Historia",
      overview: "Muhtasari",
      maintenance: "Matengenezo",
    },
    auth: {
      signupTag: "Anzisha mfumo wako wa usafirishaji",
      signupTitle: "Fungua akaunti",
      signupText: "Sanidi kituo chako cha magari, dispatch, malipo na ripoti.",
      companyName: "Jina la kampuni",
      businessId: "Kitambulisho cha Biashara",
      email: "Barua pepe",
      loginId: "Jina au barua pepe",
      loginIdPlaceholder: "Jina lako au barua pepe",
      password: "Nenosiri",
      createAccount: "Tengeneza akaunti",
      alreadyHaveAccount: "Una akaunti tayari?",
      signIn: "Ingia",
      loginTag: "Kituo cha usimamizi wa usafirishaji kwa wakati halisi",
      welcome: "Karibu tena",
      loginText: "Ingia kwa Business ID, jina au barua pepe, na nenosiri.",
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
      filterLabel: "Kipindi",
      operationsTitle: "Muhtasari wa Uendeshaji",
      operationsText: "Muhtasari rahisi wa mambo muhimu ya kufuatilia kwa kipindi ulichochagua.",
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
    maintenance: {
      intro: "Fuatilia service, marekebisho, vipuri, karakana, na afya ya gari sehemu moja.",
      addMaintenance: "Ongeza Matengenezo",
      totalVehicles: "Jumla ya Magari",
      underMaintenance: "Magari Kwenye Matengenezo",
      dueSoon: "Service Inakaribia",
      monthlyCost: "Gharama ya Mwezi",
      openRepairs: "Marekebisho Wazi",
      recordsTitle: "Rekodi za Matengenezo",
      recordsText: "Weka historia safi ya service kwa kila gari.",
      vehicle: "Gari",
      plateNumber: "Namba ya Gari",
      maintenanceDate: "Tarehe ya Matengenezo",
      maintenanceType: "Aina ya Matengenezo",
      workshop: "Karakana",
      mechanic: "Fundi",
      currentMileage: "Mita za Sasa",
      totalCost: "Gharama Jumla",
      laborCost: "Gharama ya Kazi",
      partsCost: "Gharama ya Vipuri",
      otherExpenses: "Gharama Nyingine",
      nextServiceDate: "Tarehe ya Service Ijayo",
      nextServiceMileage: "Mita za Service Ijayo",
      description: "Maelezo",
      partsReplaced: "Vipuri Vilivyobadilishwa",
      saveRecord: "Hifadhi Rekodi ya Matengenezo",
      filesUploaded: "Faili Zilizowekwa",
      invoices: "Ankara",
      receipts: "Risiti",
      photos: "Picha",
      documents: "Nyaraka za PDF",
      addPart: "Ongeza Kipuri Kingine",
      partName: "Jina la Kipuri",
      brand: "Brand",
      quantity: "Idadi",
      unitPrice: "Bei ya Kimoja",
      totalPrice: "Bei Jumla",
      supplier: "Msambazaji",
      pending: "Inasubiri",
      inProgress: "Inaendelea",
      completed: "Imekamilika",
      cancelled: "Imefutwa",
      oilChange: "Kubadili Oil",
      engineService: "Service ya Engine",
      brakeService: "Service ya Brake",
      batteryReplacement: "Kubadili Battery",
      tyreReplacement: "Kubadili Tairi",
      transmission: "Transmission",
      suspension: "Suspension",
      electrical: "Electrical",
      accidentRepair: "Marekebisho ya Ajali",
      generalService: "Service ya Kawaida",
      other: "Nyingine",
      engineRepair: "Urekebishaji wa Engine",
      airConditioning: "Kiyoyozi",
      formIntro: "Rekodi service kamili kwa magari yako.",
      sectionVehicle: "Taarifa za gari",
      sectionVehicleText: "Chagua gari na taarifa za msingi za service.",
      sectionDetails: "Maelezo ya matengenezo",
      sectionDetailsText: "Eleza kazi na weka kipaumbele.",
      sectionParts: "Vipuri vilivyobadilishwa",
      sectionPartsText: "Ongeza kila kipuri kilichotumika.",
      sectionCosts: "Muhtasari wa gharama",
      sectionCostsText: "Jumla inajaza otomatiki unapoandika.",
      sectionAttachments: "Viambatisho",
      sectionAttachmentsText: "Pakia ankara, risiti, na picha.",
      sectionNotes: "Maelezo",
      sectionNotesText: "Maelezo zaidi kwa fundi na ukaguzi.",
      vehicleSearch: "Tafuta magari",
      vehicleSearchPlaceholder: "Tafuta kwa namba au dereva",
      selectVehicle: "Chagua gari",
      plateAutoFill: "Inajaza otomatiki kutoka gari",
      odometer: "Usomaji wa odometer",
      odometerPlaceholder: "mf. 120000",
      mechanicPlaceholder: "Jina la fundi",
      workshopOptional: "Warsha",
      workshopPlaceholder: "Jina la warsha",
      optional: "Si lazima",
      priority: "Kipaumbele",
      descriptionPlaceholder: "Eleza kazi ya matengenezo iliyofanywa.",
      selectOption: "Chagua",
      tyreDetails: "Maelezo ya kubadili tairi",
      tyrePosition: "Nafasi ya tairi",
      tyreSerialNumber: "Namba ya serial ya tairi",
      tyreSerialPlaceholder: "Serial / DOT",
      tyreSize: "Ukubwa wa tairi",
      tyreSizePlaceholder: "mf. 295/80R22.5",
      tyreManufacturer: "Mtengenezaji",
      tyreManufacturerPlaceholder: "mf. Michelin",
      expectedReplacementMileage: "Mita zinazotarajiwa za kubadili",
      expectedMileagePlaceholder: "mf. 180000",
      batteryDetails: "Maelezo ya kubadili battery",
      batteryBrand: "Brand ya battery",
      batteryBrandPlaceholder: "mf. Bosch",
      batterySerialNumber: "Serial ya battery",
      batterySerialPlaceholder: "Namba ya serial",
      batteryCapacityAh: "Uwezo (Ah)",
      batteryCapacityPlaceholder: "mf. 100",
      batteryWarranty: "Dhamana",
      batteryWarrantyPlaceholder: "mf. miezi 18",
      oilDetails: "Maelezo ya kubadili oil",
      oilBrand: "Brand ya oil",
      oilBrandPlaceholder: "mf. Shell",
      oilGrade: "Grade ya oil",
      oilGradePlaceholder: "mf. 15W-40",
      oilQuantityLitres: "Kiasi (lita)",
      oilQuantityPlaceholder: "mf. 8",
      brakeDetails: "Maelezo ya service ya brake",
      brakePosition: "Nafasi ya brake",
      brakePositionPlaceholder: "mf. Axle ya mbele",
      brakeBrand: "Brand",
      brakeBrandPlaceholder: "mf. Bendix",
      part: "Kipuri",
      removePart: "Ondoa",
      partNamePlaceholder: "mf. Oil filter",
      partNumber: "Namba ya kipuri / SKU",
      partNumberPlaceholder: "SKU au namba ya kipuri",
      brandPlaceholder: "Jina la brand",
      autoCalculated: "Inahesabiwa otomatiki",
      grandTotal: "Jumla kuu",
      dropFiles: "Buruta faili hapa au bofya kupakia",
      dropFilesHint: "Ankara, risiti, au picha za matengenezo",
      uploading: "Inapakia…",
      remove: "Ondoa",
      notesPlaceholder: "Maelezo zaidi kwa timu ya service…",
      saveMaintenance: "Hifadhi Matengenezo",
      priorityLow: "Chini",
      priorityMedium: "Wastani",
      priorityHigh: "Juu",
      frontLeft: "Mbele Kushoto",
      frontRight: "Mbele Kulia",
      rearLeft: "Nyuma Kushoto",
      rearRight: "Nyuma Kulia",
      spare: "Spare",
      alertsTitle: "Tahadhari za Service",
      alertsText: "Vikumbusho vya service inayokuja au iliyochelewa.",
      noAlerts: "Hakuna tahadhari za matengenezo kwa sasa.",
      analyticsTitle: "Uchambuzi wa Matengenezo",
      analyticsText: "Mwelekeo wa gharama, vipuri na marekebisho kwenye magari yako.",
      monthlyCostChart: "Gharama ya Matengenezo kwa Mwezi",
      vehicleCostChart: "Gharama kwa Kila Gari",
      partsChart: "Vipuri Vinavyobadilishwa Sana",
      typeChart: "Mgawanyo wa Aina za Matengenezo",
      serviceHistory: "Historia ya Matengenezo",
      upcomingService: "Service Inayokuja",
      repairHistory: "Historia ya Marekebisho",
      invoicesPhotos: "Ankara na Picha",
      totalMaintenanceCost: "Jumla ya Gharama ya Matengenezo",
      lastServiceDate: "Tarehe ya Service ya Mwisho",
      dueInDays: "Service inatakiwa ndani ya siku 5",
      overdueMileage: "Gari limepitiliza mita za service",
      oilChangeOverdue: "Oil change imechelewa",
      noHistory: "Bado hakuna historia ya matengenezo.",
      noUploads: "Hakuna faili zilizowekwa.",
      filterVehicle: "Gari",
      filterType: "Aina ya Matengenezo",
      filterWorkshop: "Karakana",
      filterMechanic: "Fundi",
      filterStatus: "Hali",
      reportsTitle: "Exports za Matengenezo",
      reportsText: "Chuja rekodi na uzipakue kwa ukaguzi au mapitio.",
      permissionView: "Angalia",
      permissionCreate: "Ongeza",
      permissionEdit: "Hariri",
      permissionDelete: "Futa",
      permissionApprove: "Idhinisha",
      permissionExport: "Pakua",
    },
    billing: {
      intro: "Fuatilia ankara, malipo na deni lililobaki.",
      recordPayment: "Rekodi Malipo",
      totalOwed: "Jumla ya Deni",
      collected: "Yaliyokusanywa",
      outstanding: "Linalobaki",
      invoice: "Ankara",
      customer: "Mteja",
      issueDate: "Imetolewa",
      dueDate: "Inadaiwa",
      total: "Jumla",
      paid: "Imelipwa",
      balance: "Salio",
      status: "Hali",
      actions: "Vitendo",
      pay: "Lipa",
      viewBill: "Tazama ankara",
      downloadReceipt: "Pakua risiti",
      shareReceipt: "Shiriki",
      receipt: "Risiti",
      receiptReady: "Malipo yamehifadhiwa. Risiti iko tayari.",
      billTitle: "Maelezo ya ankara",
      receiptTitle: "Risiti ya malipo",
      noBalance: "Imelipwa yote",
      method: "Njia ya malipo",
      receiptNumber: "Namba ya risiti",
      company: "Kampuni",
      thankYou: "Asante kwa malipo yako.",
      statusOpen: "Wazi",
      statusPartial: "Sehemu",
      statusPaid: "Imelipwa",
      statusOverdue: "Imechelewa",
      amountPaidLabel: "Kiasi kilicholipwa",
      billedTo: "Amelipiwa na",
      paymentSuccessful: "Malipo yamefanikiwa",
      paymentPartial: "Malipo ya sehemu yamepokelewa",
      thisPayment: "Malipo haya",
      invoiceTotal: "Jumla ya ankara",
      remainingBalance: "Salio lililobaki",
      description: "Maelezo",
      serviceLine: "Malipo kuelekea ankara",
      paidOn: "Imelipwa tarehe",
      poweredBy: "Inaendeshwa na LogisticsFlow",
      methodBank: "Uhamisho wa benki",
      methodCash: "Fedha taslimu",
      methodMobile: "Pesa simu",
      methodCard: "Kadi",
      viewReceipt: "Tazama risiti",
      downloadBill: "Pakua ankara",
      shareBill: "Shiriki ankara",
      amountDue: "Kiasi kinachodaiwa",
      billServiceLine: "Huduma za usafirishaji kwa ankara",
      billOpen: "Ankara imetolewa",
      noReceiptYet: "Hakuna risiti bado. Rekodi malipo kwanza.",
    },
    reports: {
      intro: "Chagua sekta, chuja kwa kipindi, kisha pakua ripoti ya kisasa.",
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
      sectorsTitle: "Sekta za ripoti",
      sectorsText: "Sekta zilizo na data kwenye mfumo pekee ndizo zinazoonyeshwa.",
      previewTitle: "Hakiki ya ripoti",
      previewText: "Hivi ndivyo ripoti yako itakavyokuwa kwa kipindi kilichochaguliwa.",
      period: "Kipindi",
      generated: "Imetengenezwa",
      reportBadge: "Ripoti",
      noRecords: "Hakuna rekodi kwa kipindi hiki.",
      noSectors: "Hakuna data ya sekta bado. Ongeza rekodi ili kufungua ripoti.",
      downloadReady: "Ripoti imepakuliwa.",
      records: "Rekodi",
      invoiced: "Zilizotolewa ankara",
      collected: "Zilizokusanywa",
      outstanding: "Zilizobaki",
      delivered: "Zimewasilishwa",
      inTransit: "Njiani",
      pending: "Zinasubiri",
      active: "Hai",
      other: "Nyingine",
      totalCost: "Jumla ya gharama",
      code: "Namba",
      origin: "Asili",
      destination: "Kusudi",
      vehicle: "Gari",
      quantity: "Kiasi",
      date: "Tarehe",
      plate: "Namba ya gari",
      trailer: "Trela",
      driver: "Dereva",
      phone: "Simu",
      ownership: "Umiliki",
      id: "Kitambulisho",
      name: "Jina",
      location: "Mahali",
      buyingPrice: "Ununuzi",
      sellingPrice: "Uuzaji",
      type: "Aina",
      workshop: "Warsha",
      mechanic: "Fundi",
      cost: "Gharama",
      invoice: "Ankara",
      customer: "Mteja",
      issueDate: "Imetolewa",
      dueDate: "Inadaiwa",
      total: "Jumla",
      paid: "Imelipwa",
      balance: "Salio",
      status: "Hali",
    },
    settings: {
      intro: "Simamia kampuni, majukumu, na akaunti za wafanyakazi.",
      companyProfile: "Taarifa za Kampuni",
      supportEmail: "Barua pepe ya msaada",
      phone: "Simu",
      workspaceType: "Aina ya mfumo",
      teamRoles: "Timu na Majukumu",
      inviteUser: "Ongeza Mfanyakazi",
      createRole: "Tengeneza Jukumu",
      workerName: "Jina kamili la mfanyakazi",
      workerEmail: "Barua pepe ya mfanyakazi",
      workerPassword: "Nenosiri la muda",
      workerPhone: "Simu (si lazima)",
      selectRole: "Teua jukumu",
      roleName: "Jina la jukumu",
      roleDescription: "Maelezo ya jukumu",
      rolePermissions: "Ruhusa",
      workers: "Wafanyakazi",
      roles: "Majukumu",
      assignWork: "Gawa Kazi",
      assignmentType: "Aina ya kazi",
      assignmentTitle: "Kichwa cha kazi",
      assignmentDescription: "Maelezo ya kazi",
      deliveryType: "Uwasilishaji",
      maintenanceType: "Matengenezo",
      assignWorker: "Mpe mfanyakazi",
      createAssignment: "Tengeneza kazi",
      loginHint: "Wafanyakazi wanaingia kwa Business ID yako + jina au barua pepe + nenosiri.",
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
      maintenanceVehicle: "Gari",
      maintenanceDate: "Tarehe ya Matengenezo",
      currentMileage: "Mita za Sasa",
      workshopName: "Jina la Karakana",
      mechanicName: "Jina la Fundi",
      maintenanceType: "Aina ya Matengenezo",
      description: "Maelezo",
      partsReplaced: "Vipuri Vilivyobadilishwa",
      laborCost: "Gharama ya Kazi",
      partsCost: "Gharama ya Vipuri",
      otherExpenses: "Gharama Nyingine",
      totalCost: "Gharama Jumla",
      nextServiceDate: "Tarehe ya Service Ijayo",
      nextServiceMileage: "Mita za Service Ijayo",
      status: "Hali",
      notes: "Maelezo ya Ziada",
    },
    toast: {
      fillFleet: "Tafadhali jaza taarifa zote za gari",
      fleetAdded: "Gari limeongezwa",
      fleetUpdated: "Taarifa za gari zimesasishwa",
      fleetDeleted: "Gari limefutwa",
      confirmFleetDelete: "Ufute gari hili kutoka kwenye mfumo?",
      confirmFleetDeleteTitle: "Futa gari",
      confirmFleetDeleteBody: "Hii itaondoa gari kutoka kwenye mfumo. Huwezi kurudisha kitendo hiki.",
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
      fillMaintenance: "Tafadhali jaza taarifa muhimu za matengenezo",
      maintenanceSaved: "Rekodi ya matengenezo imehifadhiwa",
      maintenanceUpdated: "Rekodi ya matengenezo imesasishwa",
      maintenanceDeleted: "Rekodi ya matengenezo imefutwa",
      confirmMaintenanceDelete: "Ufute rekodi hii ya matengenezo?",
      confirmMaintenanceDeleteTitle: "Futa rekodi ya matengenezo",
      confirmMaintenanceDeleteBody: "Hii itafuta kabisa rekodi ya matengenezo na faili zake.",
      signedIn: "Umeingia kwa mafanikio",
      workspaceCreated: "Mfumo umetengenezwa kwa mafanikio",
      businessIdCreated: "Kitambulisho chako cha biashara ni",
      deliveryUpdated: "Uwasilishaji umesasishwa",
    },
  },
};

function formatMoney(value, language = "en") {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const locale = language === "sw" ? "sw-TZ" : "en-TZ";
  return `TSh ${new Intl.NumberFormat(locale).format(safeAmount)}`;
}

function statusTone(status) {
  if (status === "active" || status === "delivered" || status === "completed" || status === "paid") return "green";
  if (status === "transit" || status === "inProgress" || status === "partial") return "blue";
  if (status === "maintenance" || status === "cancelled" || status === "overdue") return "red";
  return "amber";
}

function invoiceDisplayStatus(invoice) {
  const balance = invoiceBalance(invoice);
  if (balance <= 0 || invoice?.status === "paid") return "paid";
  if (invoice?.status === "overdue") return "overdue";
  if (invoice?.dueDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (invoice.dueDate < today && balance > 0) return "overdue";
  }
  if (moneyValue(invoice?.paid) > 0 || invoice?.status === "partial") return "partial";
  return "open";
}

function resolveRoleKey(user, permissions = []) {
  const role = String(user?.role ?? "").toUpperCase();
  const roleName = String(user?.roleName ?? "").toLowerCase();
  const permissionSet = new Set(permissions);
  const canManage =
    role === "OWNER" || permissionSet.has("assignments:manage");
  const canView =
    canManage || permissionSet.has("assignments:view");

  if (role === "OWNER") return "OWNER";
  if (role === "DRIVER" || roleName.includes("driver")) return "DRIVER";
  if (role === "DISPATCHER" || roleName.includes("dispatch")) return "DISPATCHER";
  if (canManage) return "DISPATCHER";
  if (canView) return "DRIVER";
  return "WORKER";
}

function resolveHomePage(user, permissions = []) {
  const key = resolveRoleKey(user, permissions);
  if (key === "OWNER") return "dashboard";
  if (key === "DRIVER") return "my-work";
  if (key === "DISPATCHER") return "assign-work";
  return "settings";
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

const maintenanceTypeKeys = [
  ...MAINTENANCE_FORM_TYPE_KEYS,
  "engineService",
  "transmission",
  "accidentRepair",
];

const maintenanceStatusKeys = [...MAINTENANCE_FORM_STATUS_KEYS, "cancelled"];

function createEmptyPart() {
  return createEmptyMaintenancePart();
}

function formatChange(value) {
  if (!Number.isFinite(value) || value === 0) return "0%";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function formatDateLabel(value) {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function calculatePartsTotal(parts = []) {
  return parts.reduce((sum, part) => {
    const quantity = Number(part.quantity) || 0;
    const unitPrice = Number(part.unitPrice) || 0;
    return sum + (Number(part.totalPrice) || quantity * unitPrice);
  }, 0);
}

function calculateMaintenanceTotal(record = {}) {
  const laborCost = Number(record.laborCost) || 0;
  const partsCost = Number(record.partsCost) || calculatePartsTotal(record.parts);
  const otherExpenses = Number(record.otherExpenses) || 0;
  return laborCost + partsCost + otherExpenses;
}

function matchesDateRange(dateValue, startDate, endDate) {
  if (!dateValue) return false;
  if (startDate && dateValue < startDate) return false;
  if (endDate && dateValue > endDate) return false;
  return true;
}

function downloadBlob(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  downloadFileBlob(filename, blob);
}

function downloadFileBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function ReceiptSheet({ receipt, labels }) {
  const statusOk = receipt.status === "paid";
  return (
    <article className="saas-receipt">
      <div className="saas-receipt-accent" />
      <div className="saas-receipt-body">
        <div className="saas-receipt-top">
          <div className="saas-receipt-brand">
            <div className="saas-receipt-mark">LF</div>
            <div>
              <strong>{receipt.companyName}</strong>
              <span>{receipt.businessId ? `ID ${receipt.businessId}` : "LogisticsFlow"}</span>
            </div>
          </div>
          <span className={`saas-receipt-badge ${statusOk ? "ok" : "partial"}`}>
            {statusOk ? labels.paymentSuccessful : labels.paymentPartial}
          </span>
        </div>

        <div className="saas-receipt-hero">
          <span>{labels.amountPaidLabel}</span>
          <strong>{formatReceiptMoney(receipt.amountPaid)}</strong>
          <p>
            {labels.paidOn} {receipt.paidAtLabel}
          </p>
        </div>

        <div className="saas-receipt-meta">
          <div>
            <span>{labels.receiptNumber}</span>
            <strong>{receipt.id}</strong>
          </div>
          <div>
            <span>{labels.invoice}</span>
            <strong>{receipt.invoiceNumber}</strong>
          </div>
          <div>
            <span>{labels.method}</span>
            <strong>{formatPaymentMethodLabel(receipt.method, labels)}</strong>
          </div>
          <div>
            <span>{labels.status}</span>
            <strong>{statusOk ? labels.statusPaid : labels.statusPartial}</strong>
          </div>
        </div>

        <div className="saas-receipt-panel">
          <div className="saas-receipt-panel-head">{labels.billedTo}</div>
          <div className="saas-receipt-panel-body">
            <strong>{receipt.customer}</strong>
            <span>{labels.customer}</span>
          </div>
        </div>

        <div className="saas-receipt-panel">
          <table className="saas-receipt-table">
            <thead>
              <tr>
                <th>{labels.description}</th>
                <th>{labels.thisPayment}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {labels.serviceLine} {receipt.invoiceNumber}
                </td>
                <td>{formatReceiptMoney(receipt.amountPaid)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="saas-receipt-totals">
          <div>
            <span>{labels.invoiceTotal}</span>
            <strong>{formatReceiptMoney(receipt.total)}</strong>
          </div>
          <div>
            <span>{labels.paid}</span>
            <strong>{formatReceiptMoney(receipt.paid)}</strong>
          </div>
          <div className="grand">
            <span>{labels.remainingBalance}</span>
            <strong>{formatReceiptMoney(receipt.balance)}</strong>
          </div>
        </div>

        <p className="saas-receipt-thanks">{labels.thankYou}</p>
        <p className="saas-receipt-foot">
          {labels.poweredBy} · {receipt.id}
        </p>
      </div>
    </article>
  );
}

function BillSheet({ bill, labels }) {
  const status = bill.status || "open";
  const badgeClass = status === "paid" ? "ok" : status === "open" ? "open" : "partial";
  const badgeLabel =
    status === "paid"
      ? labels.statusPaid
      : status === "partial"
        ? labels.statusPartial
        : status === "overdue"
          ? labels.statusOverdue
          : labels.billOpen;
  const heroAmount = bill.balance > 0 ? bill.balance : bill.total;

  return (
    <article className="saas-receipt">
      <div className="saas-receipt-accent" />
      <div className="saas-receipt-body">
        <div className="saas-receipt-top">
          <div className="saas-receipt-brand">
            <div className="saas-receipt-mark">LF</div>
            <div>
              <strong>{bill.companyName}</strong>
              <span>{bill.businessId ? `ID ${bill.businessId}` : "LogisticsFlow"}</span>
            </div>
          </div>
          <span className={`saas-receipt-badge ${badgeClass}`}>{badgeLabel}</span>
        </div>

        <div className="saas-receipt-hero">
          <span>{labels.amountDue}</span>
          <strong>{formatReceiptMoney(heroAmount)}</strong>
          <p>
            {labels.issueDate}: {bill.issueDate || "—"}
          </p>
        </div>

        <div className="saas-receipt-meta">
          <div>
            <span>{labels.invoice}</span>
            <strong>{bill.invoiceNumber}</strong>
          </div>
          <div>
            <span>{labels.dueDate}</span>
            <strong>{bill.dueDate || "—"}</strong>
          </div>
          <div>
            <span>{labels.total}</span>
            <strong>{formatReceiptMoney(bill.total)}</strong>
          </div>
          <div>
            <span>{labels.status}</span>
            <strong>{badgeLabel}</strong>
          </div>
        </div>

        <div className="saas-receipt-panel">
          <div className="saas-receipt-panel-head">{labels.billedTo}</div>
          <div className="saas-receipt-panel-body">
            <strong>{bill.customer}</strong>
            <span>{labels.customer}</span>
          </div>
        </div>

        <div className="saas-receipt-panel">
          <table className="saas-receipt-table">
            <thead>
              <tr>
                <th>{labels.description}</th>
                <th>{labels.total}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {labels.billServiceLine} {bill.invoiceNumber}
                </td>
                <td>{formatReceiptMoney(bill.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="saas-receipt-totals">
          <div>
            <span>{labels.invoiceTotal}</span>
            <strong>{formatReceiptMoney(bill.total)}</strong>
          </div>
          <div>
            <span>{labels.paid}</span>
            <strong>{formatReceiptMoney(bill.paid)}</strong>
          </div>
          <div className="grand">
            <span>{labels.remainingBalance}</span>
            <strong>{formatReceiptMoney(bill.balance)}</strong>
          </div>
        </div>

        <p className="saas-receipt-thanks">{labels.thankYou}</p>
        <p className="saas-receipt-foot">
          {labels.poweredBy} · {bill.invoiceNumber}
        </p>
      </div>
    </article>
  );
}

function toDateKey(dateValue) {
  if (!dateValue) return "";
  const raw = String(dateValue);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDateInRange(dateValue, filter, selectedDate, customRange = {}) {
  const dateKey = toDateKey(dateValue);
  if (!dateKey) return false;

  const date = new Date(`${dateKey}T12:00:00`);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return false;

  if (filter === "all") {
    return true;
  }

  if (filter === "today") {
    return date.toDateString() === now.toDateString();
  }

  if (filter === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
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
    return selectedDate ? dateKey === selectedDate : true;
  }

  if (filter === "custom") {
    const from = customRange.from || "";
    const to = customRange.to || "";
    if (!from && !to) return true;
    if (from && dateKey < from) return false;
    if (to && dateKey > to) return false;
    return true;
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
      <div className="language-select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
          <option value="en">{englishLabel}</option>
          <option value="sw">{swahiliLabel}</option>
        </select>
      </div>
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
    <div className={`toast toast-${toast.type}`} role="status">
      <div className={`toast-icon toast-icon-${toast.type}`}>
        {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      </div>
      <span>{toast.message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-backdrop confirm-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="confirm-card glass-elevated"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`confirm-icon confirm-icon-${tone}`}>
          {tone === "danger" ? <Trash2 size={20} /> : <AlertCircle size={20} />}
        </div>
        <div className="confirm-copy">
          <h3 id="confirm-title">{title}</h3>
          <p id="confirm-message">{message}</p>
        </div>
        <div className="confirm-actions">
          <button type="button" className="button secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`button ${tone === "danger" ? "danger" : "primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  hideSave = false,
  footerActions = null,
  wide = false,
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`modal-card glass-elevated${wide ? " modal-card-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-button muted" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          {footerActions}
          <button type="button" className="button secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          {!hideSave && onSave ? (
            <button type="button" className="button primary" onClick={onSave}>
              {saveLabel}
            </button>
          ) : null}
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
  const [isMobileSidebar, setIsMobileSidebar] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 820;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 820;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authSession, setAuthSession] = useState(null);
  const [authForm, setAuthForm] = useState({ businessId: "", login: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [bootSplashMode, setBootSplashMode] = useState("loading");
  const [bootWelcomeName, setBootWelcomeName] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [workerForm, setWorkerForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    roleId: "",
  });
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [assignmentForm, setAssignmentForm] = useState({
    workerId: "",
    type: "DELIVERY",
    title: "",
    description: "",
  });
  const [createdWorkerCreds, setCreatedWorkerCreds] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [appData, setAppData] = useState(emptyAppData);
  const saveInFlightRef = useRef(false);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [deliveryFilter, setDeliveryFilter] = useState("month");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [dashboardFilter, setDashboardFilter] = useState("today");
  const [dashboardCustomFrom, setDashboardCustomFrom] = useState("");
  const [dashboardCustomTo, setDashboardCustomTo] = useState("");
  const [reportFilter, setReportFilter] = useState("today");
  const [reportCustomFrom, setReportCustomFrom] = useState("");
  const [reportCustomTo, setReportCustomTo] = useState("");
  const [reportSector, setReportSector] = useState("billing");
  const [fleetFilter, setFleetFilter] = useState("all");
  const [fleetDetailsTab, setFleetDetailsTab] = useState("overview");
  const [maintenanceFilters, setMaintenanceFilters] = useState({
    vehicleId: "all",
    maintenanceType: "all",
    workshop: "",
    mechanic: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [pageSearch, setPageSearch] = useState({
    dashboard: "",
    fleet: "",
    shipments: "",
    deliveries: "",
    customers: "",
    suppliers: "",
    maintenance: "",
    billing: "",
    reports: "",
    settings: "",
  });
  const [modal, setModal] = useState({ type: null });
  const [modalForm, setModalForm] = useState({});
  const t = translations[language];
  const searchValue = pageSearch[currentPage] ?? "";
  const dashboardSummary = appData.dashboardSummary ?? {};

  const dashboardMetrics = useMemo(() => {
    const customRange = { from: dashboardCustomFrom, to: dashboardCustomTo };
    const inRange = (dateValue) => isDateInRange(dateValue, dashboardFilter, "", customRange);
    const money = (value) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount : 0;
    };

    const paymentsInRange = appData.payments.filter((item) => inRange(item.date));
    const shipmentsInRange = appData.shipments.filter((item) => inRange(item.date));
    const deliveriesInRange = appData.deliveries.filter((item) => inRange(item.date));

    const revenue = paymentsInRange.reduce((sum, item) => sum + money(item.paid), 0);
    const outstanding = appData.payments.reduce(
      (sum, item) => sum + Math.max(0, money(item.total) - money(item.paid)),
      0,
    );
    const deliveredCount = Math.max(
      deliveriesInRange.length,
      shipmentsInRange.filter((item) => item.status === "delivered").length,
    );
    const transitCount = shipmentsInRange.filter((item) => item.status === "transit").length;
    const pendingCount = shipmentsInRange.filter((item) => item.status === "pending").length;
    const activeFleet = appData.fleet.filter((item) => item.status === "active").length;
    const totalFleet = appData.fleet.length || Number(dashboardSummary.vehicles) || 0;
    const customers =
      Number(dashboardSummary.customers) ||
      appData.customers.length ||
      0;

    return {
      deliveries: deliveredCount,
      revenue,
      outstanding,
      activeFleet,
      totalFleet,
      customers,
      deliveredCount,
      transitCount,
      pendingCount,
    };
  }, [
    appData.payments,
    appData.shipments,
    appData.deliveries,
    appData.fleet,
    appData.customers.length,
    dashboardFilter,
    dashboardCustomFrom,
    dashboardCustomTo,
    dashboardSummary.vehicles,
    dashboardSummary.customers,
  ]);

  const maintenancePermissions = useMemo(
    () => new Set(authSession?.user?.permissions ?? []),
    [authSession],
  );

  useEffect(() => {
    window.localStorage.setItem("logisticsflow-language", language);
  }, [language]);

  const isOwner = (authSession?.user?.role ?? "").toUpperCase() === "OWNER";
  const userPermissions = useMemo(
    () => new Set(authSession?.user?.permissions ?? []),
    [authSession?.user?.permissions],
  );
  const canViewAssignments =
    isOwner || userPermissions.has("assignments:view") || userPermissions.has("assignments:manage");
  const canManageAssignments = isOwner || userPermissions.has("assignments:manage");

  const hasMaintenancePermission = (permission) =>
    isOwner || maintenancePermissions.has(`maintenance:${permission}`);
  const canViewMaintenance = hasMaintenancePermission("view");
  const canCreateMaintenance = hasMaintenancePermission("create");
  const canEditMaintenance = hasMaintenancePermission("edit");
  const canDeleteMaintenance = hasMaintenancePermission("delete");
  const canApproveMaintenance = hasMaintenancePermission("approve");
  const canExportMaintenance = hasMaintenancePermission("export");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let wasMobile = window.innerWidth <= 820;

    const handleResize = () => {
      const mobile = window.innerWidth <= 820;

      // Ignore height-only changes (mobile browser chrome show/hide while scrolling).
      if (mobile === wasMobile) return;

      wasMobile = mobile;
      setIsMobileSidebar(mobile);

      if (mobile) {
        setSidebarOpen(false);
        setMobileSidebarOpen(false);
      } else {
        setMobileSidebarOpen(false);
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totals = useMemo(() => {
    const money = (value) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount : 0;
    };
    const revenue = appData.payments.reduce((sum, item) => sum + money(item.paid), 0);
    const outstanding = appData.payments.reduce(
      (sum, item) => sum + Math.max(0, money(item.total) - money(item.paid)),
      0,
    );
    const deliveries = appData.shipments.filter((item) => item.status === "delivered").length;
    const activeFleet = appData.fleet.filter((item) => item.status === "active").length;
    const deliveredCount = appData.shipments.filter((item) => item.status === "delivered").length;
    const transitCount = appData.shipments.filter((item) => item.status === "transit").length;
    const pendingCount = appData.shipments.filter((item) => item.status === "pending").length;
    const clearedCustomers = appData.payments.filter((item) => money(item.paid) >= money(item.total)).length;

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

  const shipmentStatusShare = useMemo(() => {
    const totalShipments = appData.shipments.length;
    if (!totalShipments) {
      return { delivered: 0, transit: 0, pending: 0 };
    }

    return {
      delivered: Math.round((totals.deliveredCount / totalShipments) * 100),
      transit: Math.round((totals.transitCount / totalShipments) * 100),
      pending: Math.round((totals.pendingCount / totalShipments) * 100),
    };
  }, [appData.shipments.length, totals.deliveredCount, totals.pendingCount, totals.transitCount]);

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

  const roleKey = useMemo(() => {
    const role = String(authSession?.user?.role ?? "").toUpperCase();
    const roleName = String(authSession?.user?.roleName ?? "").toLowerCase();
    if (role === "OWNER") return "OWNER";
    if (role === "DRIVER" || roleName.includes("driver")) return "DRIVER";
    if (role === "DISPATCHER" || roleName.includes("dispatch")) return "DISPATCHER";
    if (canManageAssignments) return "DISPATCHER";
    if (canViewAssignments) return "DRIVER";
    return "WORKER";
  }, [authSession?.user?.role, authSession?.user?.roleName, canManageAssignments, canViewAssignments]);

  const homePageForRole = useMemo(() => {
    if (roleKey === "OWNER") return "dashboard";
    if (roleKey === "DRIVER") return "my-work";
    if (roleKey === "DISPATCHER") return "assign-work";
    return "settings";
  }, [roleKey]);

  const translatedNavigation = useMemo(() => {
    return navigation
      .map((item) => {
        let label = t.nav[item.id] ?? item.label;
        if (item.id === "dashboard" && roleKey === "OWNER") label = t.nav.dashboard ?? label;
        if (item.id === "my-work" && roleKey === "DRIVER") {
          label = language === "sw" ? "Kazi Yangu" : "Driver Work";
        }
        if (item.id === "assign-work" && roleKey === "DISPATCHER") {
          label = language === "sw" ? "Gawa Kazi" : "Dispatch";
        }
        return { ...item, label };
      })
      .filter((item) => {
        if (roleKey === "OWNER") {
          return item.id !== "my-work";
        }
        if (roleKey === "DRIVER") {
          return ["my-work", "settings"].includes(item.id);
        }
        if (roleKey === "DISPATCHER") {
          return ["assign-work", "settings"].includes(item.id);
        }
        return ["settings"].includes(item.id);
      });
  }, [t, roleKey, language]);

  const mobileNavItems = useMemo(() => {
    const preferred = [
      "dashboard",
      "my-work",
      "assign-work",
      "fleet",
      "maintenance",
      "deliveries",
      "billing",
      "settings",
    ];
    return translatedNavigation
      .filter((item) => preferred.includes(item.id))
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        label: t.mobile[item.id] ?? item.label,
      }));
  }, [translatedNavigation, t]);

  const activityFeed = appData.activityFeed ?? [];

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
      [
        payment.invoiceNumber,
        payment.customer,
        payment.date,
        payment.dueDate,
        payment.total,
        payment.paid,
        payment.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
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

  const maintenanceRecords = appData.maintenanceRecords ?? [];

  const maintenanceVehicleOptions = useMemo(
    () =>
      appData.fleet.map((vehicle) => ({
        id: vehicle.id,
        label: `${getVehiclePlateLabel(vehicle)} - ${vehicle.driver}`,
        plateNumber: getVehiclePlateLabel(vehicle),
      })),
    [appData.fleet],
  );

  const maintenanceWorkshops = useMemo(
    () => [...new Set(maintenanceRecords.map((item) => item.workshop).filter(Boolean))],
    [maintenanceRecords],
  );

  const maintenanceMechanics = useMemo(
    () => [...new Set(maintenanceRecords.map((item) => item.mechanic).filter(Boolean))],
    [maintenanceRecords],
  );

  const maintenanceSummary = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const now = Date.now();
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonth = previousMonthDate.toISOString().slice(0, 7);
    const vehiclesWithHistory = new Set(maintenanceRecords.map((item) => item.vehicleId).filter(Boolean));
    const underMaintenanceVehicles = new Set(
      maintenanceRecords.filter((item) => item.status === "pending" || item.status === "inProgress").map((item) => item.vehicleId),
    );

    const currentMonthCost = maintenanceRecords
      .filter((item) => (item.serviceDate ?? "").startsWith(currentMonth))
      .reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);

    const previousMonthCost = maintenanceRecords
      .filter((item) => (item.serviceDate ?? "").startsWith(previousMonth))
      .reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);

    const dueSoon = maintenanceRecords.filter((item) => {
      if (item.status === "cancelled") return false;
      const nextDate = item.nextServiceDate ? new Date(item.nextServiceDate).getTime() : null;
      const daysRemaining = nextDate ? Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24)) : null;
      const mileageRemaining = item.nextServiceMileage ? Number(item.nextServiceMileage) - Number(item.currentMileage || 0) : null;
      return (daysRemaining !== null && daysRemaining <= 7) || (mileageRemaining !== null && mileageRemaining <= 500);
    });

    const openRepairs = maintenanceRecords.filter((item) => item.status === "pending" || item.status === "inProgress").length;
    const totalFleet = appData.fleet.length || 1;

    return {
      totalVehicles: appData.fleet.length,
      vehiclesUnderMaintenance: underMaintenanceVehicles.size,
      serviceDueSoon: dueSoon.length,
      monthlyMaintenanceCost: currentMonthCost,
      openRepairs,
      totalVehiclesChange: formatChange(Math.round((vehiclesWithHistory.size / totalFleet) * 100)),
      vehiclesUnderMaintenanceChange: formatChange(Math.round((underMaintenanceVehicles.size / totalFleet) * 100)),
      serviceDueSoonChange: formatChange(Math.round((dueSoon.length / totalFleet) * 100)),
      monthlyMaintenanceCostChange: formatChange(previousMonthCost ? Math.round(((currentMonthCost - previousMonthCost) / previousMonthCost) * 100) : 0),
      openRepairsChange: formatChange(maintenanceRecords.length ? Math.round((openRepairs / maintenanceRecords.length) * 100) : 0),
    };
  }, [appData.fleet, maintenanceRecords]);

  const maintenanceAlerts = useMemo(() => {
    return maintenanceRecords
      .filter((item) => item.nextServiceDate || item.nextServiceMileage)
      .map((item) => {
        const vehicle = appData.fleet.find((entry) => entry.id === item.vehicleId);
        const plateNumber = item.plateNumber || getVehiclePlateLabel(vehicle ?? {});
        const daysRemaining = item.nextServiceDate
          ? Math.ceil((new Date(item.nextServiceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;
        const mileageRemaining = item.nextServiceMileage
          ? Number(item.nextServiceMileage) - Number(item.currentMileage || 0)
          : null;

        if (mileageRemaining !== null && mileageRemaining <= 0) {
          return {
            id: `${item.id}-mileage`,
            title: t.maintenance.overdueMileage,
            text: `${plateNumber} (${item.maintenanceType})`,
            tone: "red",
          };
        }

        if (daysRemaining !== null && daysRemaining <= 0) {
          return {
            id: `${item.id}-date`,
            title: t.maintenance.oilChangeOverdue,
            text: `${plateNumber} - ${formatDateLabel(item.nextServiceDate)}`,
            tone: "amber",
          };
        }

        if ((daysRemaining !== null && daysRemaining <= 7) || (mileageRemaining !== null && mileageRemaining <= 500)) {
          return {
            id: `${item.id}-soon`,
            title: t.maintenance.dueInDays,
            text: `${plateNumber} - ${item.nextServiceDate ? formatDateLabel(item.nextServiceDate) : `${mileageRemaining} km`}`,
            tone: "brand",
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [appData.fleet, maintenanceRecords, t.maintenance.dueInDays, t.maintenance.oilChangeOverdue, t.maintenance.overdueMileage]);

  const filteredMaintenanceRecords = useMemo(() => {
    const query = pageSearch.maintenance.trim().toLowerCase();
    return maintenanceRecords
      .filter((item) => maintenanceFilters.vehicleId === "all" || item.vehicleId === maintenanceFilters.vehicleId)
      .filter((item) => maintenanceFilters.maintenanceType === "all" || item.maintenanceType === maintenanceFilters.maintenanceType)
      .filter((item) => maintenanceFilters.status === "all" || item.status === maintenanceFilters.status)
      .filter((item) => !maintenanceFilters.workshop || item.workshop?.toLowerCase().includes(maintenanceFilters.workshop.toLowerCase()))
      .filter((item) => !maintenanceFilters.mechanic || item.mechanic?.toLowerCase().includes(maintenanceFilters.mechanic.toLowerCase()))
      .filter((item) => matchesDateRange(item.serviceDate, maintenanceFilters.dateFrom, maintenanceFilters.dateTo))
      .filter((item) => {
        if (!query) return true;
        return [
          item.vehicleLabel,
          item.plateNumber,
          item.maintenanceType,
          item.workshop,
          item.mechanic,
          item.status,
          item.serviceDate,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  }, [maintenanceFilters, maintenanceRecords, pageSearch.maintenance]);

  const selectedVehicleMaintenanceRecords = useMemo(
    () =>
      maintenanceRecords
        .filter((item) => item.vehicleId === modal.vehicleId)
        .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()),
    [maintenanceRecords, modal.vehicleId],
  );

  const selectedVehicleMaintenanceSummary = useMemo(() => {
    const latest = selectedVehicleMaintenanceRecords[0];
    return {
      totalCost: selectedVehicleMaintenanceRecords.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0),
      lastServiceDate: latest?.serviceDate ?? "",
      nextServiceDate: latest?.nextServiceDate ?? "",
      currentMileage: latest?.currentMileage ?? "",
      upcomingService:
        selectedVehicleMaintenanceRecords.find((item) => item.status === "pending" || item.status === "inProgress") ?? null,
      repairHistory: selectedVehicleMaintenanceRecords.filter((item) => item.status === "completed"),
      partsReplaced: selectedVehicleMaintenanceRecords.flatMap((item) => item.parts ?? []),
      uploads: selectedVehicleMaintenanceRecords.flatMap((item) => item.files ?? []),
    };
  }, [selectedVehicleMaintenanceRecords]);

  const selectedMaintenanceRecord = useMemo(
    () => maintenanceRecords.find((item) => item.id === modal.recordId) ?? null,
    [maintenanceRecords, modal.recordId],
  );

  const selectedBillingInvoice = useMemo(
    () => appData.payments.find((payment) => payment.id === modal.invoiceId) ?? null,
    [appData.payments, modal.invoiceId],
  );

  const maintenanceAnalytics = useMemo(() => {
    const monthly = {};
    const byVehicle = {};
    const byPart = {};
    const byType = {};

    maintenanceRecords.forEach((record) => {
      const month = (record.serviceDate ?? "").slice(0, 7);
      monthly[month] = (monthly[month] ?? 0) + (Number(record.totalCost) || 0);
      byVehicle[record.plateNumber] = (byVehicle[record.plateNumber] ?? 0) + (Number(record.totalCost) || 0);
      byType[record.maintenanceType] = (byType[record.maintenanceType] ?? 0) + 1;
      (record.parts ?? []).forEach((part) => {
        byPart[part.partName] = (byPart[part.partName] ?? 0) + (Number(part.quantity) || 0);
      });
    });

    return {
      monthly: Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).slice(-6),
      byVehicle: Object.entries(byVehicle).sort((a, b) => b[1] - a[1]).slice(0, 5),
      byPart: Object.entries(byPart).sort((a, b) => b[1] - a[1]).slice(0, 5),
      byType: Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [maintenanceRecords]);

  const availableReportSectors = useMemo(() => {
    const icons = {
      billing: CircleDollarSign,
      shipments: Package,
      deliveries: Route,
      fleet: Truck,
      customers: Users,
      suppliers: Building2,
      maintenance: Wrench,
    };

    return REPORT_SECTOR_IDS.map((id) => {
      const count = getSectorItems(appData, id).length;
      return {
        id,
        count,
        label: t.pages[id] || id,
        icon: icons[id] || BarChart3,
      };
    }).filter((sector) => sector.count > 0);
  }, [appData, t.pages]);

  useEffect(() => {
    if (!availableReportSectors.length) return;
    if (!availableReportSectors.some((sector) => sector.id === reportSector)) {
      setReportSector(availableReportSectors[0].id);
    }
  }, [availableReportSectors, reportSector]);

  const reportPreview = useMemo(() => {
    const customRange = { from: reportCustomFrom, to: reportCustomTo };
    const inRange = (dateValue) => isDateInRange(dateValue, reportFilter, "", customRange);
    const sectorId = availableReportSectors.some((sector) => sector.id === reportSector)
      ? reportSector
      : availableReportSectors[0]?.id || "billing";
    const sourceItems = getSectorItems(appData, sectorId);
    const items = filterSectorItems(sourceItems, sectorId, inRange);
    const columnLabels = {
      invoice: t.reports.invoice,
      customer: t.reports.customer,
      issueDate: t.reports.issueDate,
      dueDate: t.reports.dueDate,
      total: t.reports.total,
      paid: t.reports.paid,
      balance: t.reports.balance,
      status: t.reports.status,
      code: t.reports.code,
      origin: t.reports.origin,
      destination: t.reports.destination,
      vehicle: t.reports.vehicle,
      quantity: t.reports.quantity,
      date: t.reports.date,
      plate: t.reports.plate,
      trailer: t.reports.trailer,
      driver: t.reports.driver,
      phone: t.reports.phone,
      ownership: t.reports.ownership,
      id: t.reports.id,
      name: t.reports.name,
      location: t.reports.location,
      buyingPrice: t.reports.buyingPrice,
      sellingPrice: t.reports.sellingPrice,
      type: t.reports.type,
      workshop: t.reports.workshop,
      mechanic: t.reports.mechanic,
      cost: t.reports.cost,
    };
    const rows = buildSectorRows(sectorId, items, columnLabels);
    const summary = buildSectorSummary(sectorId, items).map((item) => ({
      ...item,
      label: t.reports[item.labelKey] || item.labelKey,
    }));
    const periodText =
      reportFilter === "today"
        ? t.common.today
        : reportFilter === "yesterday"
          ? t.common.yesterday
          : reportFilter === "week"
            ? t.common.thisWeek
            : reportFilter === "month"
              ? t.common.thisMonth
              : reportFilter === "custom"
                ? `${reportCustomFrom || "…"} → ${reportCustomTo || "…"}`
                : t.common.all;

    return {
      sectorId,
      sectorLabel: t.pages[sectorId] || sectorId,
      items,
      rows,
      summary,
      periodText,
      columnLabels,
      headers: rows[0] ? Object.keys(rows[0]) : [],
    };
  }, [
    appData,
    availableReportSectors,
    reportCustomFrom,
    reportCustomTo,
    reportFilter,
    reportSector,
    t.common.all,
    t.common.customRange,
    t.common.thisMonth,
    t.common.thisWeek,
    t.common.today,
    t.common.yesterday,
    t.pages,
    t.reports,
  ]);

  const searchedTeamMembers = useMemo(() => {
    const query = pageSearch.settings.trim().toLowerCase();
    const members = teamMembers.length
      ? teamMembers.map((member) => ({
          id: member.id,
          name: member.fullName,
          role: member.roleName ?? member.role,
          email: member.email,
        }))
      : authSession?.user
        ? [
            {
              id: authSession.user.id,
              name: authSession.user.fullName,
              role: authSession.user.roleName ?? authSession.user.role ?? "Owner",
              email: authSession.user.email,
            },
          ]
        : [];

    if (!query) return members;
    return members.filter((member) =>
      [member.name, member.role, member.email].join(" ").toLowerCase().includes(query),
    );
  }, [teamMembers, authSession, pageSearch.settings]);

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
      setModalForm({ customer: appData.customers[0]?.name ?? "", amount: "", invoiceId: "" });
      setModal({ type, mode: "create" });
      return;
    }
    if (type === "supplier") {
      setModalForm({ id: "", name: "", phone: "", location: "", buyingPrice: "", sellingPrice: "" });
      setModal({ type, mode: "create" });
      return;
    }
    if (type === "maintenance") {
      const firstVehicle = appData.fleet[0];
      setModalForm({
        vehicleId: firstVehicle?.id ?? "",
        plateNumber: firstVehicle ? getVehiclePlateLabel(firstVehicle) : "",
        vehicleLabel: firstVehicle
          ? `${getVehiclePlateLabel(firstVehicle)} - ${firstVehicle.driver}`
          : "",
        serviceDate: new Date().toISOString().slice(0, 10),
        currentMileage: "",
        workshop: "",
        mechanic: "",
        maintenanceType: "generalService",
        description: "",
        laborCost: "",
        partsCost: "",
        otherExpenses: "",
        nextServiceDate: "",
        nextServiceMileage: "",
        status: "pending",
        priority: "medium",
        notes: "",
        details: createEmptyMaintenanceDetails(),
        parts: [createEmptyPart()],
        files: [],
      });
      setModal({ type, mode: "create" });
      return;
    }

    setModal({ type });
  };

  const openPayInvoiceModal = (invoice) => {
    const balance = invoiceBalance(invoice);
    if (balance <= 0) {
      showToast(t.billing.noBalance);
      return;
    }
    setModalForm({
      customer: invoice.customer ?? "",
      amount: String(balance),
      invoiceId: invoice.id,
    });
    setModal({ type: "payment", mode: "pay", invoiceId: invoice.id });
  };

  const openBillViewModal = (invoice) => {
    const bill = buildBillDocument(invoice, authSession?.business);
    setModal({ type: "billView", invoiceId: invoice.id, bill });
  };

  const openReceiptForInvoice = (invoice) => {
    const receipt = buildReceiptFromInvoice(invoice, authSession?.business);
    if (!receipt) {
      showToast(t.billing.noReceiptYet, "error");
      return;
    }
    setModal({ type: "receipt", receipt, invoiceId: invoice.id });
  };

  const invoiceStatusLabel = (status) => {
    if (status === "paid") return t.billing.statusPaid;
    if (status === "partial") return t.billing.statusPartial;
    if (status === "overdue") return t.billing.statusOverdue;
    return t.billing.statusOpen;
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
    setFleetDetailsTab("overview");
    setModal({ type: "fleetDetails", vehicleId: vehicle.id });
  };

  const openCustomerEditModal = (customer) => {
    setModalForm({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      location: customer.location,
      email: customer.email ?? "",
      contactPerson: customer.contactPerson ?? "",
      notes: customer.notes ?? "",
    });
    setModal({ type: "customer", mode: "edit", customerId: customer.entityId });
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
    setModal({ type: "supplier", mode: "edit", supplierId: supplier.entityId });
  };

  const openMaintenanceEditModal = (record) => {
    setModalForm({
      ...record,
      laborCost: record.laborCost ?? "",
      partsCost: record.partsCost ?? "",
      otherExpenses: record.otherExpenses ?? "",
      nextServiceMileage: record.nextServiceMileage ?? "",
      priority: record.priority ?? "medium",
      notes: record.notes ?? "",
      details: {
        ...createEmptyMaintenanceDetails(),
        ...(record.details || {}),
      },
      parts: (record.parts ?? []).length
        ? record.parts.map((part) => ({
            ...part,
            partNumber: part.partNumber || part.supplier || "",
          }))
        : [createEmptyPart()],
      files: record.files ?? [],
    });
    setModal({ type: "maintenance", mode: "edit", recordId: record.id });
  };

  const closeModal = () => {
    setModal({ type: null });
    setModalForm({});
    setFleetDetailsTab("overview");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(null), 3200);
  };

  const askConfirm = ({ title, message, confirmLabel, tone = "danger" }) =>
    new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        confirmLabel,
        tone,
        resolve,
      });
    });

  const closeConfirm = (result) => {
    confirmDialog?.resolve?.(result);
    setConfirmDialog(null);
  };

  const uploadsBaseUrl = useMemo(() => {
    const configured = import.meta.env.VITE_API_URL?.trim();
    const apiUrl = configured || "http://127.0.0.1:5001/api";
    return apiUrl.replace(/\/api\/?$/, "");
  }, []);

  const loadTeamData = async () => {
    if (!isOwner) return;
    try {
      const [usersPayload, rolesPayload] = await Promise.all([teamApi.list(), rolesApi.list()]);
      const users = usersPayload.users ?? usersPayload ?? [];
      const roles = rolesPayload.roles ?? [];
      setTeamMembers(Array.isArray(users) ? users : []);
      setRoleOptions(roles.filter((role) => role.name !== "Mechanic"));
      setAvailablePermissions(rolesPayload.availablePermissions ?? []);
      setWorkerForm((current) =>
        current.roleId || !roles[0] ? current : { ...current, roleId: roles[0].id },
      );
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to load team data."), "error");
    }
  };

  const loadAssignments = async () => {
    if (!canViewAssignments && !canManageAssignments) return;
    try {
      const payload = await assignmentsApi.list();
      setAssignments(payload.assignments ?? payload ?? []);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to load assignments."), "error");
    }
  };

  const handleCreateWorker = async (event) => {
    event.preventDefault();
    if (!isOwner) return;

    try {
      const payload = await teamApi.createWorker(workerForm);
      const worker = payload.user ?? payload;
      setCreatedWorkerCreds({
        businessId: authSession?.business?.businessId,
        email: worker.email,
        password: worker.temporaryPassword ?? workerForm.password,
        fullName: worker.fullName,
        roleName: worker.roleName,
      });
      setWorkerForm({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        roleId: workerForm.roleId,
      });
      await loadTeamData();
      showToast(language === "sw" ? "Mfanyakazi ameongezwa." : "Worker account created.");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to create worker."), "error");
    }
  };

  const handleCreateRole = async (event) => {
    event.preventDefault();
    if (!isOwner) return;

    try {
      await rolesApi.create({
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions,
      });
      setRoleForm({ name: "", description: "", permissions: [] });
      await loadTeamData();
      showToast(language === "sw" ? "Jukumu limetengenezwa." : "Role created.");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to create role."), "error");
    }
  };

  const handleCreateAssignment = async (event) => {
    event.preventDefault();
    if (!canManageAssignments) return;

    try {
      await assignmentsApi.create(assignmentForm);
      setAssignmentForm({
        workerId: "",
        type: "DELIVERY",
        title: "",
        description: "",
      });
      await loadAssignments();
      showToast(language === "sw" ? "Kazi imegawiwa." : "Assignment created.");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to create assignment."), "error");
    }
  };

  const handleAssignmentStatus = async (assignmentId, status) => {
    try {
      await assignmentsApi.updateStatus(assignmentId, status);
      await loadAssignments();
      showToast(language === "sw" ? "Hali imesasishwa." : "Assignment updated.");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to update assignment."), "error");
    }
  };

  const handleProofUpload = async (assignmentId, file) => {
    if (!file) return;

    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Unable to read file."));
        reader.readAsDataURL(file);
      });

      await assignmentsApi.uploadProof(assignmentId, {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        base64Data,
      });
      await loadAssignments();
      showToast(language === "sw" ? "Uthibitisho umepakiwa." : "Proof uploaded.");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to upload proof."), "error");
    }
  };

  const toggleRolePermission = (key) => {
    setRoleForm((current) => {
      const exists = current.permissions.includes(key);
      return {
        ...current,
        permissions: exists
          ? current.permissions.filter((item) => item !== key)
          : [...current.permissions, key],
      };
    });
  };

  const buildActivityFeed = (notifications) =>
    notifications.slice(0, 8).map((notification) => ({
      ...notification,
      icon:
        notification.type?.includes("MAINTENANCE")
          ? Wrench
          : notification.type?.includes("INVOICE")
            ? CircleDollarSign
            : notification.type?.includes("SHIPMENT")
              ? Package
              : Route,
    }));

  const loadAppData = async ({ silent = false } = {}) => {
    if (!authSession?.user) {
      return;
    }

    if (!silent) {
      setPageLoading(true);
    }

    const asItems = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.data?.items)) return payload.data.items;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    };

    try {
      const results = await Promise.allSettled([
        fleetApi.list(),
        customersApi.list(),
        suppliersApi.list(),
        shipmentsApi.list(),
        deliveriesApi.list(),
        maintenanceApi.list(),
        billingApi.list(),
        notificationsApi.list(),
        dashboardApi.summary(),
        billingApi.summary(),
        maintenanceApi.analytics(),
        maintenanceApi.upcoming(),
        maintenanceApi.mileageReminders(),
        reportsApi.list(),
      ]);

      const valueAt = (index) =>
        results[index].status === "fulfilled" ? results[index].value : null;

      // Only warn when core modules all fail — never surface partial/optional API noise.
      const criticalIndexes = [0, 1, 2, 3, 4, 5, 6];
      const criticalAllFailed = criticalIndexes.every((index) => results[index].status === "rejected");
      if (criticalAllFailed && !silent) {
        showToast(
          language === "sw"
            ? "Imeshindikana kupakia taarifa zako. Jaribu tena."
            : "Unable to load your data. Please try again.",
          "error",
        );
      }

      const notifications = asItems(valueAt(7)).map(mapNotificationRecord);

      setAppData({
        fleet: asItems(valueAt(0)).map(mapFleetRecord),
        customers: asItems(valueAt(1)).map(mapCustomerRecord),
        suppliers: asItems(valueAt(2)).map(mapSupplierRecord),
        shipments: asItems(valueAt(3)).map(mapShipmentRecord),
        deliveries: asItems(valueAt(4)).map(mapDeliveryRecord),
        maintenanceRecords: asItems(valueAt(5)).map(mapMaintenanceRecord),
        payments: asItems(valueAt(6)).map(mapInvoiceToPaymentCard),
        notifications,
        reports: asItems(valueAt(13)),
        dashboardSummary: valueAt(8)?.item ?? valueAt(8),
        billingSummary: valueAt(9)?.item ?? valueAt(9),
        maintenanceAnalytics: valueAt(10)?.item ?? valueAt(10),
        maintenanceUpcoming: asItems(valueAt(11)).map(mapMaintenanceRecord),
        maintenanceMileageReminders: asItems(valueAt(12)).map(mapMaintenanceRecord),
        activityFeed: createDashboardActivity(notifications),
      });
    } catch (error) {
      if (!silent) {
        showToast(
          getApiErrorMessage(
            error,
            language === "sw" ? "Imeshindikana kupakia taarifa zako." : "Unable to load your data.",
          ),
          "error",
        );
      }
    } finally {
      if (!silent) {
        setPageLoading(false);
      }
    }
  };

  useEffect(() => {
    configureApiClient({
      onAuthExpired: () => {
        clearPersistedSession();
        setAuthSession(null);
        setAppData(emptyAppData);
        setCurrentPage("login");
        setToast({
          message:
            language === "sw"
              ? "Kipindi kimeisha. Tafadhali ingia tena."
              : "Your session ended. Please sign in again.",
          type: "error",
        });
      },
    });
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setAuthLoading(true);
      setBootSplashMode("loading");

      try {
        const session = await authApi.bootstrap();

        if (!active) return;

        if (session?.user) {
          persistSession(session);
          setAuthSession(session);
          setCurrentPage(resolveHomePage(session.user, session.user?.permissions));
          setBootWelcomeName(session.user?.fullName ?? "");
          setBootSplashMode("welcome");
          await new Promise((resolve) => window.setTimeout(resolve, 1800));
        } else {
          setCurrentPage("login");
        }
      } catch (_error) {
        if (!active) return;
        // Keep any locally saved session if bootstrap threw unexpectedly.
        const existing = getSession();
        if (existing?.user) {
          setAuthSession(existing);
          setCurrentPage(resolveHomePage(existing.user, existing.user?.permissions));
          setBootWelcomeName(existing.user?.fullName ?? "");
          setBootSplashMode("welcome");
        } else {
          setCurrentPage("login");
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authSession?.user) {
      return;
    }

    void loadAppData();
  }, [authSession?.user]);

  useEffect(() => {
    if (!authSession?.user) return;

    if (currentPage === "settings" && isOwner) {
      void loadTeamData();
    }

    if (currentPage === "assign-work" && canManageAssignments) {
      void loadTeamData();
      void loadAssignments();
    }

    if (currentPage === "my-work" && canViewAssignments) {
      void loadAssignments();
    }
  }, [authSession?.user, currentPage, isOwner, canManageAssignments, canViewAssignments]);

  useEffect(() => {
    if (!authSession?.user) return;
    const allowed = new Set(translatedNavigation.map((item) => item.id));
    if (!allowed.has(currentPage)) {
      setCurrentPage(homePageForRole);
    }
  }, [authSession?.user, currentPage, translatedNavigation, homePageForRole]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    if (modal.type === "maintenance" && name === "vehicleId") {
      const vehicle = appData.fleet.find((item) => item.id === value);
      setModalForm((current) => ({
        ...current,
        vehicleId: value,
        plateNumber: vehicle ? getVehiclePlateLabel(vehicle) : "",
        vehicleLabel: vehicle ? `${getVehiclePlateLabel(vehicle)} - ${vehicle.driver}` : "",
      }));
      return;
    }

    setModalForm((current) => ({ ...current, [name]: value }));
  };

  const updateMaintenancePart = (partId, field, value) => {
    setModalForm((current) => {
      const nextParts = (current.parts ?? []).map((part) => {
        if (part.id !== partId) return part;
        const nextPart = { ...part, [field]: value };
        const quantity = Number(field === "quantity" ? value : nextPart.quantity) || 0;
        const unitPrice = Number(field === "unitPrice" ? value : nextPart.unitPrice) || 0;
        nextPart.totalPrice = quantity * unitPrice;
        return nextPart;
      });

      return {
        ...current,
        parts: nextParts,
        partsCost: calculatePartsTotal(nextParts),
      };
    });
  };

  const addMaintenancePart = () => {
    setModalForm((current) => ({
      ...current,
      parts: [...(current.parts ?? []), createEmptyPart()],
    }));
  };

  const removeMaintenancePart = (partId) => {
    setModalForm((current) => {
      const nextParts = (current.parts ?? []).filter((part) => part.id !== partId);
      return {
        ...current,
        parts: nextParts.length ? nextParts : [createEmptyPart()],
        partsCost: calculatePartsTotal(nextParts),
      };
    });
  };

  const handleMaintenanceFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;

    setFileUploading(true);

    try {
      const uploads = await uploadsApi.uploadFiles(files, {
        folder: "logisticsflow/maintenance",
        category: "maintenance",
      });

      setModalForm((current) => ({
        ...current,
        files: [
          ...(current.files ?? []),
          ...uploads.map((file) => {
            const mime = String(file.mimeType || "").toLowerCase();
            const name = String(file.fileName || "").toLowerCase();
            let category = "document";
            if (mime.startsWith("image/") || name.match(/\.(png|jpe?g|webp|gif)$/)) {
              category = "photo";
            } else if (name.includes("receipt")) {
              category = "receipt";
            } else if (name.includes("invoice") || name.endsWith(".pdf")) {
              category = "invoice";
            }
            return {
              id: file.id,
              name: file.fileName,
              fileName: file.fileName,
              url: file.fileUrl,
              fileUrl: file.fileUrl,
              mimeType: file.mimeType,
              category,
            };
          }),
        ],
      }));
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to upload files."), "error");
    } finally {
      setFileUploading(false);
    }
  };

  const removeMaintenanceFile = (fileId) => {
    setModalForm((current) => ({
      ...current,
      files: (current.files ?? []).filter((file) => file.id !== fileId),
    }));
  };

  const refreshAfterSave = () => {
    void loadAppData({ silent: true });
  };

  const softPersist = (request, successMessage, errorFallback) => {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    closeModal();
    showToast(successMessage);

    void (async () => {
      try {
        await request();
        refreshAfterSave();
      } catch (error) {
        showToast(getApiErrorMessage(error, errorFallback), "error");
        refreshAfterSave();
      } finally {
        saveInFlightRef.current = false;
      }
    })();
  };

  const handleModalSave = () => {
    if (saveInFlightRef.current) return;

    if (modal.type === "fleet") {
      if (!modalForm.headPlate || !modalForm.trailerPlate || !modalForm.driver || !modalForm.driverPhone || !modalForm.licenseNumber) {
        showToast(t.toast.fillFleet, "error");
        return;
      }

      const existingVehicle = appData.fleet.find((item) => item.id === modal.vehicleId);
      const existingDocs = existingVehicle?.raw?.documentsJson;
      const documentsJson = {
        ...(existingDocs && typeof existingDocs === "object" && !Array.isArray(existingDocs)
          ? existingDocs
          : {}),
        ownership: modalForm.ownership,
        driverName: modalForm.driver,
        driverPhone: modalForm.driverPhone,
        licenseNumber: modalForm.licenseNumber,
        routes: existingVehicle?.routes ?? 0,
      };
      const payload = {
        name: modalForm.headPlate,
        headPlateNumber: modalForm.headPlate,
        trailerPlateNumber: modalForm.trailerPlate || null,
        vehicleType: existingVehicle?.vehicleType ?? "Truck",
        category: modalForm.ownership ?? "owned",
        status: String(existingVehicle?.status ?? "ACTIVE").toUpperCase(),
        mileage: Number(existingVehicle?.mileage ?? 0),
        fuelLevel: Number(existingVehicle?.fuelLevel ?? 0),
        fuelType: existingVehicle?.fuelType ?? "",
        insuranceExpiry: existingVehicle?.insuranceExpiry || null,
        licenseExpiry: existingVehicle?.licenseExpiry || null,
        documentsJson,
      };

      softPersist(
        () =>
          modal.mode === "edit" && modal.vehicleId
            ? fleetApi.update(modal.vehicleId, payload)
            : fleetApi.create(payload),
        modal.mode === "edit" ? t.toast.fleetUpdated : t.toast.fleetAdded,
        language === "sw" ? "Imeshindikana kuhifadhi gari." : "Unable to save vehicle. Please try again.",
      );
      return;
    }

    if (modal.type === "shipment") {
      const selectedCustomer = appData.customers.find((item) => item.id === modalForm.customerId);
      const selectedSupplier = appData.suppliers.find((item) => item.id === modalForm.supplierId);

      if (!modalForm.supplierId || !modalForm.customerId || !modalForm.quantity || !modalForm.vehicle || !selectedCustomer || !selectedSupplier) {
        showToast(t.toast.fillShipment, "error");
        return;
      }

      const vehicle = appData.fleet.find((item) => getVehiclePrimaryPlate(item) === modalForm.vehicle);
      softPersist(
        () =>
          shipmentsApi.create({
            shipmentCode: `SHP-${Date.now().toString().slice(-6)}`,
            supplierId: selectedSupplier.entityId,
            customerId: selectedCustomer.entityId,
            vehicleId: vehicle?.id || undefined,
            origin: selectedSupplier.name,
            destination: selectedCustomer.location,
            quantityTons: Number(modalForm.quantity),
            status: "PENDING",
            deliveryStatus: "SCHEDULED",
            scheduledDate: new Date().toISOString(),
          }),
        t.toast.shipmentCreated,
        language === "sw" ? "Imeshindikana kutengeneza mzigo." : "Unable to create shipment. Please try again.",
      );
      return;
    }

    if (modal.type === "customer") {
      if (!modalForm.name || !modalForm.phone || !modalForm.location) {
        showToast(t.toast.fillCustomer, "error");
        return;
      }

      const payload = {
        customerCode: modal.mode === "edit" ? modalForm.id : generateNextCustomerId(appData.customers),
        name: modalForm.name,
        phone: modalForm.phone,
        location: modalForm.location,
        email: modalForm.email || null,
        contactPerson: modalForm.contactPerson || null,
        notes: modalForm.notes || null,
      };

      softPersist(
        () =>
          modal.mode === "edit" && modal.customerId
            ? customersApi.update(modal.customerId, payload)
            : customersApi.create(payload),
        modal.mode === "edit" ? t.toast.customerUpdated : t.toast.customerAdded,
        language === "sw" ? "Imeshindikana kuhifadhi mteja." : "Unable to save customer. Please try again.",
      );
      return;
    }

    if (modal.type === "supplier") {
      if (!modalForm.name || !modalForm.phone || !modalForm.location || !modalForm.buyingPrice || !modalForm.sellingPrice) {
        showToast(t.toast.fillSupplier, "error");
        return;
      }

      const payload = {
        supplierCode: modal.mode === "edit" ? modalForm.id : generateNextSupplierId(appData.suppliers),
        name: modalForm.name,
        contact: modalForm.phone,
        location: modalForm.location,
        buyingPrice: Number(modalForm.buyingPrice),
        sellingPrice: Number(modalForm.sellingPrice),
      };

      softPersist(
        () =>
          modal.mode === "edit" && modal.supplierId
            ? suppliersApi.update(modal.supplierId, payload)
            : suppliersApi.create(payload),
        modal.mode === "edit" ? t.toast.supplierUpdated : t.toast.supplierAdded,
        language === "sw" ? "Imeshindikana kuhifadhi msambazaji." : "Unable to save supplier. Please try again.",
      );
      return;
    }

    if (modal.type === "maintenance") {
      if (
        !modalForm.vehicleId ||
        !modalForm.serviceDate ||
        !modalForm.mechanic ||
        !modalForm.maintenanceType ||
        modalForm.currentMileage === "" ||
        modalForm.currentMileage == null
      ) {
        showToast(t.toast.fillMaintenance, "error");
        return;
      }

      const isEdit = modal.mode === "edit";
      const recordId = modal.recordId;
      const selectedVehicle = appData.fleet.find((item) => item.id === modalForm.vehicleId);
      const details = {
        ...createEmptyMaintenanceDetails(),
        ...(modalForm.details || {}),
      };
      const normalizedStatus =
        modalForm.status === "inProgress"
          ? "IN_PROGRESS"
          : modalForm.status === "completed"
            ? "COMPLETED"
            : modalForm.status === "cancelled"
              ? "CANCELLED"
              : "PENDING";

      const cleanedParts = (modalForm.parts ?? [])
        .filter((part) => String(part.partName || "").trim())
        .map((part) => ({
          partName: String(part.partName).trim(),
          brand: part.brand || undefined,
          quantity: Number(part.quantity) || 1,
          unitPrice: Number(part.unitPrice) || 0,
          totalPrice:
            Number(part.totalPrice) ||
            (Number(part.quantity) || 1) * (Number(part.unitPrice) || 0),
          supplier: part.partNumber || part.supplier || undefined,
        }));

      const cleanedAttachments = (modalForm.files ?? [])
        .map((file) => ({
          category: file.category || "document",
          fileName: file.fileName ?? file.name,
          fileUrl: file.fileUrl ?? file.url,
          mimeType: file.mimeType || undefined,
        }))
        .filter((file) => file.fileName && file.fileUrl);

      const expectedMileage =
        modalForm.maintenanceType === "tyreReplacement" && details.expectedReplacementMileage
          ? Number(details.expectedReplacementMileage)
          : modalForm.nextServiceMileage
            ? Number(modalForm.nextServiceMileage)
            : null;

      const detailsJson = JSON.stringify({
        priority: modalForm.priority || "medium",
        notes: String(modalForm.notes || "").trim(),
        ...details,
      });

      const payload = {
        vehicleId: modalForm.vehicleId,
        maintenanceDate: modalForm.serviceDate,
        maintenanceType: modalForm.maintenanceType,
        description: String(modalForm.description || "").trim(),
        workshop: String(modalForm.workshop || "").trim(),
        mechanic: String(modalForm.mechanic || "").trim(),
        currentMileage: Number(modalForm.currentMileage) || 0,
        laborCost: Number(modalForm.laborCost) || 0,
        otherCost: Number(modalForm.otherExpenses) || 0,
        nextServiceDate: modalForm.nextServiceDate || null,
        nextServiceMileage: expectedMileage,
        status: normalizedStatus,
        detailsJson,
        parts: cleanedParts,
        attachments: cleanedAttachments,
      };

      const optimisticRecord = {
        id: recordId || `tmp-maint-${Date.now()}`,
        vehicleId: modalForm.vehicleId,
        vehicleLabel: selectedVehicle
          ? `${getVehiclePlateLabel(selectedVehicle)} - ${selectedVehicle.driver}`
          : modalForm.vehicleLabel || "",
        plateNumber: selectedVehicle
          ? getVehiclePlateLabel(selectedVehicle)
          : modalForm.plateNumber || "",
        serviceDate: modalForm.serviceDate,
        maintenanceType: modalForm.maintenanceType,
        description: payload.description,
        workshop: payload.workshop,
        mechanic: payload.mechanic,
        currentMileage: payload.currentMileage,
        laborCost: payload.laborCost,
        partsCost: calculatePartsTotal(cleanedParts),
        otherExpenses: payload.otherCost,
        totalCost: calculateMaintenanceTotal({
          laborCost: modalForm.laborCost,
          parts: cleanedParts,
          otherExpenses: modalForm.otherExpenses,
        }),
        nextServiceDate: modalForm.nextServiceDate || "",
        nextServiceMileage: expectedMileage || "",
        status:
          modalForm.status === "inProgress"
            ? "inProgress"
            : modalForm.status === "completed"
              ? "completed"
              : modalForm.status === "cancelled"
                ? "cancelled"
                : "pending",
        priority: modalForm.priority || "medium",
        notes: modalForm.notes || "",
        details,
        parts: cleanedParts.map((part, index) => ({
          id: `local-part-${index}`,
          partName: part.partName,
          partNumber: part.supplier || "",
          brand: part.brand || "",
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          totalPrice: part.totalPrice,
          supplier: part.supplier || "",
        })),
        files: cleanedAttachments.map((file, index) => ({
          id: `local-file-${index}`,
          name: file.fileName,
          url: file.fileUrl,
          mimeType: file.mimeType || "",
          category: file.category || "document",
        })),
      };

      setAppData((current) => ({
        ...current,
        maintenanceRecords: isEdit
          ? (current.maintenanceRecords ?? []).map((record) =>
              record.id === recordId ? { ...record, ...optimisticRecord, id: recordId } : record,
            )
          : [optimisticRecord, ...(current.maintenanceRecords ?? [])],
      }));

      softPersist(
        () =>
          isEdit && recordId
            ? maintenanceApi.update(recordId, payload)
            : maintenanceApi.create(payload),
        isEdit ? t.toast.maintenanceUpdated : t.toast.maintenanceSaved,
        language === "sw"
          ? "Imeshindikana kuhifadhi rekodi ya matengenezo."
          : "Unable to save maintenance record. Please try again.",
      );
      return;
    }

    if (modal.type === "payment") {
      const amount = Number(modalForm.amount);
      if ((!modalForm.invoiceId && !modalForm.customer) || !amount) {
        showToast(t.toast.fillPayment, "error");
        return;
      }

      const targetInvoice =
        (modalForm.invoiceId
          ? appData.payments.find((payment) => payment.id === modalForm.invoiceId)
          : null) ||
        appData.payments.find(
          (payment) => payment.customer === modalForm.customer && invoiceBalance(payment) > 0,
        );

      if (!targetInvoice) {
        showToast(
          language === "sw"
            ? "Hakuna ankara inayosubiri malipo kwa mteja huyu."
            : "No outstanding invoice found for this customer.",
          "error",
        );
        return;
      }

      const balance = invoiceBalance(targetInvoice);
      if (amount > balance) {
        showToast(
          language === "sw"
            ? `Kiasi kinazidi salio (${formatMoney(balance, language)}).`
            : `Amount exceeds outstanding balance (${formatMoney(balance, language)}).`,
          "error",
        );
        return;
      }

      if (saveInFlightRef.current) return;
      saveInFlightRef.current = true;

      const paidAt = new Date();
      const tempPaymentId = `local-${Date.now()}`;
      const receipt = buildPaymentReceipt({
        invoice: targetInvoice,
        amountPaid: amount,
        business: authSession?.business,
        method: "BANK_TRANSFER",
        paidAt,
        paymentId: tempPaymentId,
      });

      setAppData((current) => ({
        ...current,
        payments: current.payments.map((payment) =>
          payment.id === targetInvoice.id
            ? {
                ...payment,
                paid: moneyValue(payment.paid) + amount,
                status: moneyValue(payment.paid) + amount >= moneyValue(payment.total) ? "paid" : "partial",
                paymentRecords: [
                  {
                    id: tempPaymentId,
                    amount,
                    method: "BANK_TRANSFER",
                    paidAt: paidAt.toISOString(),
                    note: "",
                  },
                  ...(payment.paymentRecords ?? []),
                ],
              }
            : payment,
        ),
      }));

      setModal({ type: "receipt", receipt, invoiceId: targetInvoice.id });
      showToast(t.billing.receiptReady);

      void (async () => {
        try {
          await paymentsApi.create({
            invoiceId: targetInvoice.id,
            customerId: targetInvoice.customerId || undefined,
            amount,
            paymentDate: paidAt.toISOString(),
            method: "BANK_TRANSFER",
            status: "COMPLETED",
          });
          refreshAfterSave();
        } catch (error) {
          showToast(
            getApiErrorMessage(
              error,
              language === "sw" ? "Imeshindikana kuhifadhi malipo." : "Unable to record payment. Please try again.",
            ),
            "error",
          );
          refreshAfterSave();
        } finally {
          saveInFlightRef.current = false;
        }
      })();
      return;
    }
  };

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  };

  const playWelcomeSplash = async (fullName) => {
    setAuthLoading(true);
    setBootSplashMode("loading");
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setBootWelcomeName(fullName ?? "");
    setBootSplashMode("welcome");
    await new Promise((resolve) => window.setTimeout(resolve, 1600));
    setAuthLoading(false);
  };

  const buildAuthSession = (payload) => ({
    token: payload.token ?? null,
    user: {
      ...payload.user,
      role: payload.user?.role ?? "OWNER",
      roleName:
        String(payload.user?.role ?? "").toUpperCase() === "OWNER"
          ? "Owner"
          : payload.user?.roleName ?? payload.user?.role ?? "Member",
      permissions: payload.user?.permissions ?? [],
    },
    business: {
      ...payload.business,
      businessId: payload.business?.businessId ?? "",
      name: payload.business?.name ?? payload.business?.companyName ?? "",
      companyName: payload.business?.companyName ?? payload.business?.name ?? "",
    },
  });

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthSubmitting(true);

    try {
      const payload = await authApi.login({
        businessId: authForm.businessId,
        identifier: authForm.login,
        email: authForm.login,
        password: authForm.password,
      });
      const session = buildAuthSession(payload);
      persistSession(session);
      setAuthSession(session);
      setCurrentPage(resolveHomePage(session.user, session.user.permissions));
      setAuthForm({ businessId: "", login: "", password: "" });
      setAuthSubmitting(false);
      await playWelcomeSplash(payload.user?.fullName);
      showToast(t.toast.signedIn);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to sign in."), "error");
      setAuthSubmitting(false);
    }
  };

  const handleSignup = async (values) => {
    setAuthSubmitting(true);

    try {
      const payload = await authApi.register(values);
      const session = buildAuthSession(payload);
      persistSession(session);
      setAuthSession(session);
      setCurrentPage(resolveHomePage(session.user, session.user.permissions));
      setAuthSubmitting(false);
      await playWelcomeSplash(payload.user?.fullName);
      showToast(`${t.toast.businessIdCreated} ${session.business.businessId}. ${t.toast.workspaceCreated}`);
    } catch (error) {
      showToast(getApiErrorMessage(error, language === "sw" ? "Imeshindikana kutengeneza akaunti." : "Unable to create your account."), "error");
      setAuthSubmitting(false);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (_error) {
      // Clear the local session even if the server-side logout request fails.
    } finally {
      clearPersistedSession();
      setAuthSession(null);
      setAppData(emptyAppData);
      setTeamMembers([]);
      setRoleOptions([]);
      setAssignments([]);
      setCreatedWorkerCreds(null);
      setCurrentPage("login");
    }
  };

  const toggleSidebar = () => {
    if (isMobileSidebar) {
      setMobileSidebarOpen((current) => !current);
      return;
    }

    setSidebarOpen((current) => !current);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const toggleFleetStatus = async (id) => {
    const vehicle = appData.fleet.find((item) => item.id === id);
    if (!vehicle) return;

    try {
      await fleetApi.update(id, {
        status: vehicle.status === "active" ? "MAINTENANCE" : "ACTIVE",
      });
      await loadAppData({ silent: true });
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to update fleet status."), "error");
    }
  };

  const updateShipmentStatus = (id, nextStatus) => {
    const previousShipments = appData.shipments;
    const previousDeliveries = appData.deliveries;

    setAppData((current) => {
      const shipments = current.shipments.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus,
              deliveryStatus: nextStatus === "delivered" ? "delivered" : item.deliveryStatus,
            }
          : item,
      );

      const updated = shipments.find((item) => item.id === id);
      let deliveries = current.deliveries;

      if (nextStatus === "delivered" && updated) {
        const alreadyListed = deliveries.some(
          (delivery) => delivery.raw?.shipmentId === id || delivery.id === `local-${id}`,
        );
        if (!alreadyListed) {
          deliveries = [
            {
              id: `local-${id}`,
              deliveryCode: updated.shipmentCode ? `DEL-${String(updated.shipmentCode).slice(-6)}` : `DEL-${String(id).slice(-6)}`,
              date: new Date().toISOString().slice(0, 10),
              origin: updated.origin,
              customer: updated.customer,
              destination: updated.destination,
              vehicle: updated.vehicle,
              quantity: updated.quantity,
              unit: updated.unit ?? "tons",
              status: "delivered",
              raw: { shipmentId: id },
            },
            ...deliveries,
          ];
        }
      }

      return { ...current, shipments, deliveries };
    });

    showToast(t.toast.shipmentStatusUpdated);

    void (async () => {
      try {
        await shipmentsApi.update(id, {
          status:
            nextStatus === "transit"
              ? "IN_TRANSIT"
              : nextStatus === "delivered"
                ? "DELIVERED"
                : "PENDING",
          deliveredAt: nextStatus === "delivered" ? new Date().toISOString() : undefined,
        });
        refreshAfterSave();
      } catch (error) {
        setAppData((current) => ({
          ...current,
          shipments: previousShipments,
          deliveries: previousDeliveries,
        }));
        showToast(
          getApiErrorMessage(
            error,
            language === "sw" ? "Imeshindikana kusasisha hali ya mzigo." : "Unable to update shipment status.",
          ),
          "error",
        );
      }
    })();
  };

  const deleteFleetVehicle = async (id) => {
    const confirmed = await askConfirm({
      title: t.toast.confirmFleetDeleteTitle,
      message: t.toast.confirmFleetDeleteBody,
      confirmLabel: t.common.delete,
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await fleetApi.remove(id);
      await loadAppData({ silent: true });
      closeModal();
      showToast(t.toast.fleetDeleted);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to delete fleet vehicle."), "error");
    }
  };

  const deleteMaintenanceRecord = async (id) => {
    if (!canDeleteMaintenance) return;

    const confirmed = await askConfirm({
      title: t.toast.confirmMaintenanceDeleteTitle,
      message: t.toast.confirmMaintenanceDeleteBody,
      confirmLabel: t.common.delete,
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await maintenanceApi.remove(id);
      await loadAppData({ silent: true });
      if (modal.recordId === id) {
        closeModal();
      }
      showToast(t.toast.maintenanceDeleted);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to delete maintenance record."), "error");
    }
  };

  const buildMaintenanceExportRows = () => {
    return filteredMaintenanceRecords.map((record) => ({
      Vehicle: record.vehicleLabel,
      "Plate Number": record.plateNumber,
      "Maintenance Date": record.serviceDate,
      "Maintenance Type": record.maintenanceType,
      Workshop: record.workshop,
      Mechanic: record.mechanic,
      "Current Mileage": record.currentMileage,
      "Total Cost": record.totalCost,
      Status: record.status,
      Notes: record.notes,
    }));
  };

  const exportMaintenanceExcel = async () => {
    if (!canExportMaintenance) return;
    try {
      const file = await reportsApi.exportReport({
        name: "maintenance-report",
        module: "maintenance",
        format: "excel",
        filters: maintenanceFilters,
      });
      downloadFileBlob(file.fileName, file.blob);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to export Excel report."), "error");
    }
  };

  const exportMaintenancePdf = async () => {
    if (!canExportMaintenance) return;
    try {
      const file = await reportsApi.exportReport({
        name: "maintenance-report",
        module: "maintenance",
        format: "pdf",
        filters: maintenanceFilters,
      });
      downloadFileBlob(file.fileName, file.blob);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to export PDF report."), "error");
    }
  };

  const exportSectorReport = (format) => {
    if (!reportPreview.sectorId) {
      showToast(t.reports.noSectors, "error");
      return;
    }

    const labels = {
      ...t.reports,
      today: t.common.today,
      yesterday: t.common.yesterday,
      thisWeek: t.common.thisWeek,
      thisMonth: t.common.thisMonth,
      all: t.common.all,
      poweredBy: t.billing.poweredBy,
      column: reportPreview.columnLabels,
      summary: {
        records: t.reports.records,
        invoiced: t.reports.invoiced,
        collected: t.reports.collected,
        outstanding: t.reports.outstanding,
        delivered: t.reports.delivered,
        inTransit: t.reports.inTransit,
        pending: t.reports.pending,
        active: t.reports.active,
        other: t.reports.other,
        totalCost: t.reports.totalCost,
      },
    };

    const file =
      format === "pdf"
        ? buildReportPdf({
            sectorId: reportPreview.sectorId,
            items: reportPreview.items,
            labels,
            sectorLabel: reportPreview.sectorLabel,
            business: authSession?.business,
            filter: reportFilter,
            customRange: { from: reportCustomFrom, to: reportCustomTo },
          })
        : buildReportCsv({
            sectorId: reportPreview.sectorId,
            items: reportPreview.items,
            labels,
            sectorLabel: reportPreview.sectorLabel,
          });

    downloadReportFile(file);
    showToast(t.reports.downloadReady);
  };

  const authPage = !authSession || currentPage === "login" || currentPage === "signup";

  const renderAuthCard = () => {
    if (currentPage === "signup") {
      return <SignUpPage onSubmit={handleSignup} onSwitchToSignIn={() => setCurrentPage("login")} />;
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
          {t.auth.businessId}
          <input
            type="text"
            name="businessId"
            value={authForm.businessId}
            onChange={handleAuthInputChange}
            placeholder="LOG-0001"
            autoComplete="organization"
          />
        </label>
        <label>
          {t.auth.loginId}
          <input
            type="text"
            name="login"
            value={authForm.login}
            onChange={handleAuthInputChange}
            placeholder={t.auth.loginIdPlaceholder}
            autoComplete="username"
          />
        </label>
        <label>
          {t.auth.password}
          <div className="auth-password-wrap">
            <input
              type={showLoginPassword ? "text" : "password"}
              name="password"
              value={authForm.password}
              onChange={handleAuthInputChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowLoginPassword((current) => !current)}
              aria-label={showLoginPassword ? "Hide password" : "Show password"}
            >
              {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <button type="submit" className="button primary full" disabled={authSubmitting}>
          {authSubmitting ? "Signing in..." : t.auth.signIn}
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
          <label className="language-picker compact">
            <span>{t.dashboard.filterLabel ?? t.common.filter}</span>
            <select
              value={dashboardFilter}
              onChange={(event) => setDashboardFilter(event.target.value)}
            >
              <option value="today">{t.common.today}</option>
              <option value="yesterday">{t.common.yesterday}</option>
              <option value="week">{t.common.thisWeek}</option>
              <option value="month">{t.common.thisMonth}</option>
              <option value="custom">{t.common.customRange}</option>
            </select>
          </label>
          {dashboardFilter === "custom" ? (
            <>
              <label className="language-picker compact">
                <span>{t.common.from}</span>
                <input
                  type="date"
                  value={dashboardCustomFrom}
                  onChange={(event) => setDashboardCustomFrom(event.target.value)}
                />
              </label>
              <label className="language-picker compact">
                <span>{t.common.to}</span>
                <input
                  type="date"
                  value={dashboardCustomTo}
                  min={dashboardCustomFrom || undefined}
                  onChange={(event) => setDashboardCustomTo(event.target.value)}
                />
              </label>
            </>
          ) : null}
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
        <StatCard label={t.dashboard.totalDeliveries} value={dashboardMetrics.deliveries} icon={Truck} tone="brand" />
        <StatCard label={t.dashboard.revenueCollected} value={formatMoney(dashboardMetrics.revenue, language)} icon={TrendingUp} tone="green" />
        <StatCard label={t.dashboard.outstanding} value={formatMoney(dashboardMetrics.outstanding, language)} icon={Clock3} tone="amber" />
        <StatCard
          label={t.dashboard.activeFleet}
          value={`${dashboardMetrics.activeFleet}/${dashboardMetrics.totalFleet}`}
          icon={Zap}
          tone="brand"
        />
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
              <strong>{dashboardMetrics.deliveredCount}</strong>
            </div>
            <div className="summary-row">
              <span>{t.dashboard.transitRuns}</span>
              <strong>{dashboardMetrics.transitCount}</strong>
            </div>
            <div className="summary-row">
              <span>{t.dashboard.pendingRuns}</span>
              <strong>{dashboardMetrics.pendingCount}</strong>
            </div>
            <div className="summary-row">
              <span>{t.dashboard.activeCustomers}</span>
              <strong>{dashboardMetrics.customers}</strong>
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
                <strong>{shipmentStatusShare.delivered}%</strong>
                <span>{t.status.delivered}</span>
              </div>
              <div className="ring green">{shipmentStatusShare.delivered}%</div>
            </div>
            <div className="status-metric">
              <div>
                <strong>{shipmentStatusShare.transit}%</strong>
                <span>{t.status.transit}</span>
              </div>
              <div className="ring blue">{shipmentStatusShare.transit}%</div>
            </div>
            <div className="status-metric">
              <div>
                <strong>{shipmentStatusShare.pending}%</strong>
                <span>{t.status.pending}</span>
              </div>
              <div className="ring amber">{shipmentStatusShare.pending}%</div>
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
        </div>
        <div className="activity-list">
          {filteredActivityFeed.length ? (
            filteredActivityFeed.map((item) => {
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
            })
          ) : (
            <EmptyState icon={Route} title={t.common.noActivityTitle} text={t.common.noActivityText} />
          )}
        </div>
      </section>

      <section className="glass-card activity-card">
        <div className="section-row">
          <div>
            <h3>{t.maintenance.alertsTitle}</h3>
            <p>{t.maintenance.alertsText}</p>
          </div>
        </div>
        <div className="activity-list">
          {maintenanceAlerts.length ? (
            maintenanceAlerts.map((alert) => (
              <article key={alert.id} className="activity-item">
                <div className={`activity-icon ${alert.tone}`}>
                  <BadgeAlert size={16} />
                </div>
                <div className="activity-copy">
                  <strong>{alert.title}</strong>
                  <span>{alert.text}</span>
                </div>
              </article>
            ))
          ) : (
            <EmptyState icon={ShieldCheck} title={t.maintenance.alertsTitle} text={t.maintenance.noAlerts} />
          )}
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

      <section className={searchedFleet.length ? "card-grid three" : "empty-state-section"}>
        {searchedFleet.length ? (
          searchedFleet.map((vehicle) => (
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
          ))
        ) : (
          <EmptyState icon={Truck} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
        )}
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

      <section className={searchedCustomers.length ? "card-grid three" : "empty-state-section"}>
        {searchedCustomers.length ? (
          searchedCustomers.map((customer) => (
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
                  {customerShipmentCounts[customer.entityId] ?? 0} {t.customers.shipmentsCount}
                </span>
              </div>
            </article>
          ))
        ) : (
          <EmptyState icon={Users} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
        )}
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

      <section className={searchedSuppliers.length ? "card-grid three" : "empty-state-section"}>
        {searchedSuppliers.length ? (
          searchedSuppliers.map((supplier) => (
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
          ))
        ) : (
          <EmptyState icon={Building2} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
        )}
      </section>
    </div>
  );

  const renderMaintenance = () => (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>{t.pages.maintenance}</h1>
          <p>{t.maintenance.intro}</p>
        </div>
        <div className="header-actions">
          <SearchBox
            label={t.common.search}
            value={pageSearch.maintenance}
            onChange={(value) => setPageSearch((current) => ({ ...current, maintenance: value }))}
          />
          <button type="button" className="button secondary" onClick={exportMaintenancePdf} disabled={!canExportMaintenance}>
            <FileDown size={16} />
            {t.common.exportPdf}
          </button>
          <button type="button" className="button secondary" onClick={exportMaintenanceExcel} disabled={!canExportMaintenance}>
            <FileSpreadsheet size={16} />
            {t.common.exportExcel}
          </button>
          <button type="button" className="button primary" onClick={() => openModal("maintenance")} disabled={!canCreateMaintenance}>
            <Plus size={16} />
            {t.maintenance.addMaintenance}
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label={t.maintenance.totalVehicles} value={maintenanceSummary.totalVehicles} change={maintenanceSummary.totalVehiclesChange} icon={Truck} tone="brand" />
        <StatCard label={t.maintenance.underMaintenance} value={maintenanceSummary.vehiclesUnderMaintenance} change={maintenanceSummary.vehiclesUnderMaintenanceChange} icon={Wrench} tone="red" />
        <StatCard label={t.maintenance.dueSoon} value={maintenanceSummary.serviceDueSoon} change={maintenanceSummary.serviceDueSoonChange} icon={CalendarClock} tone="amber" />
        <StatCard label={t.maintenance.monthlyCost} value={formatMoney(maintenanceSummary.monthlyMaintenanceCost, language)} change={maintenanceSummary.monthlyMaintenanceCostChange} icon={CircleDollarSign} tone="green" />
      </section>

      <section className="maintenance-summary-grid">
        <StatCard label={t.maintenance.openRepairs} value={maintenanceSummary.openRepairs} change={maintenanceSummary.openRepairsChange} icon={Hammer} tone="amber" />
        <div className="glass-card summary-highlight">
          <div className="settings-title">
            <div className="inline-icon brand">
              <ShieldCheck size={18} />
            </div>
            <h3>{t.common.permissions}</h3>
          </div>
          <div className="permission-chip-row">
            {[
              { key: "view", label: t.maintenance.permissionView, allowed: canViewMaintenance },
              { key: "create", label: t.maintenance.permissionCreate, allowed: canCreateMaintenance },
              { key: "edit", label: t.maintenance.permissionEdit, allowed: canEditMaintenance },
              { key: "delete", label: t.maintenance.permissionDelete, allowed: canDeleteMaintenance },
              { key: "approve", label: t.maintenance.permissionApprove, allowed: canApproveMaintenance },
              { key: "export", label: t.maintenance.permissionExport, allowed: canExportMaintenance },
            ].map((permission) => (
              <span
                key={permission.key}
                className={`permission-chip ${permission.allowed ? "is-allowed" : "is-blocked"}`}
              >
                {permission.label}
              </span>
            ))}
          </div>
        </div>
        <div className="glass-card summary-highlight">
          <div className="settings-title">
            <div className={`inline-icon ${maintenanceAlerts.length ? "amber" : "brand"}`}>
              <BadgeAlert size={18} />
            </div>
            <h3>{t.maintenance.alertsTitle}</h3>
          </div>
          <strong className="summary-highlight-value">{maintenanceAlerts.length}</strong>
          <span className="summary-highlight-note">
            {maintenanceAlerts.length ? `${maintenanceAlerts.length} ${t.maintenance.alertsTitle.toLowerCase()}` : t.maintenance.noAlerts}
          </span>
        </div>
      </section>

      <section className="glass-card chart-card">
        <div className="section-row">
          <div>
            <h3>{t.maintenance.reportsTitle}</h3>
            <p>{t.maintenance.reportsText}</p>
          </div>
        </div>
        <div className="form-grid maintenance-filters-grid">
          <label>
            {t.maintenance.filterVehicle}
            <select value={maintenanceFilters.vehicleId} onChange={(event) => setMaintenanceFilters((current) => ({ ...current, vehicleId: event.target.value }))}>
              <option value="all">{t.common.all}</option>
              {maintenanceVehicleOptions.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.maintenance.filterType}
            <select value={maintenanceFilters.maintenanceType} onChange={(event) => setMaintenanceFilters((current) => ({ ...current, maintenanceType: event.target.value }))}>
              <option value="all">{t.common.all}</option>
              {maintenanceTypeKeys.map((type) => (
                <option key={type} value={type}>
                  {t.maintenance[type]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.maintenance.filterWorkshop}
            <input value={maintenanceFilters.workshop} onChange={(event) => setMaintenanceFilters((current) => ({ ...current, workshop: event.target.value }))} placeholder={maintenanceWorkshops[0] ?? t.maintenance.workshop} />
          </label>
          <label>
            {t.maintenance.filterMechanic}
            <input value={maintenanceFilters.mechanic} onChange={(event) => setMaintenanceFilters((current) => ({ ...current, mechanic: event.target.value }))} placeholder={maintenanceMechanics[0] ?? t.maintenance.mechanic} />
          </label>
          <label>
            {t.maintenance.filterStatus}
            <select value={maintenanceFilters.status} onChange={(event) => setMaintenanceFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="all">{t.common.all}</option>
              {maintenanceStatusKeys.map((status) => (
                <option key={status} value={status}>
                  {t.maintenance[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.common.from}
            <input type="date" value={maintenanceFilters.dateFrom} onChange={(event) => setMaintenanceFilters((current) => ({ ...current, dateFrom: event.target.value }))} />
          </label>
          <label>
            {t.common.to}
            <input type="date" value={maintenanceFilters.dateTo} onChange={(event) => setMaintenanceFilters((current) => ({ ...current, dateTo: event.target.value }))} />
          </label>
        </div>
      </section>

      <section className="feature-grid maintenance-analytics-grid">
        <div className="glass-card chart-card">
          <div className="section-row">
            <div>
              <h3>{t.maintenance.monthlyCostChart}</h3>
              <p>{t.maintenance.analyticsText}</p>
            </div>
          </div>
          <div className="summary-list">
            {maintenanceAnalytics.monthly.length ? (
              maintenanceAnalytics.monthly.map(([month, total]) => (
                <div key={month} className="summary-row">
                  <span>{month}</span>
                  <strong>{formatMoney(total, language)}</strong>
                </div>
              ))
            ) : (
              <EmptyState icon={BarChart3} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
            )}
          </div>
        </div>

        <div className="glass-card chart-card">
          <div className="section-row">
            <div>
              <h3>{t.maintenance.vehicleCostChart}</h3>
              <p>{t.maintenance.analyticsText}</p>
            </div>
          </div>
          <div className="summary-list">
            {maintenanceAnalytics.byVehicle.length ? (
              maintenanceAnalytics.byVehicle.map(([vehicle, total]) => (
                <div key={vehicle} className="summary-row">
                  <span>{vehicle}</span>
                  <strong>{formatMoney(total, language)}</strong>
                </div>
              ))
            ) : (
              <EmptyState icon={Truck} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
            )}
          </div>
        </div>

        <div className="glass-card chart-card">
          <div className="section-row">
            <div>
              <h3>{t.maintenance.partsChart}</h3>
              <p>{t.maintenance.analyticsText}</p>
            </div>
          </div>
          <div className="summary-list">
            {maintenanceAnalytics.byPart.length ? (
              maintenanceAnalytics.byPart.map(([partName, quantity]) => (
                <div key={partName} className="summary-row">
                  <span>{partName}</span>
                  <strong>{quantity}</strong>
                </div>
              ))
            ) : (
              <EmptyState icon={ClipboardList} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
            )}
          </div>
        </div>

        <div className="glass-card chart-card">
          <div className="section-row">
            <div>
              <h3>{t.maintenance.typeChart}</h3>
              <p>{t.maintenance.analyticsText}</p>
            </div>
          </div>
          <div className="summary-list">
            {maintenanceAnalytics.byType.length ? (
              maintenanceAnalytics.byType.map(([type, count]) => (
                <div key={type} className="summary-row">
                  <span>{t.maintenance[type] ?? type}</span>
                  <strong>{count}</strong>
                </div>
              ))
            ) : (
              <EmptyState icon={Gauge} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
            )}
          </div>
        </div>
      </section>

      <section className="glass-card table-card">
        <div className="table-header">
          <div>
            <h3>{t.maintenance.recordsTitle}</h3>
            <p>{t.maintenance.recordsText}</p>
          </div>
        </div>
        {filteredMaintenanceRecords.length ? (
          <div className="table-wrapper">
            <table className="history-table maintenance-table">
              <thead>
                <tr>
                  <th>{t.maintenance.vehicle}</th>
                  <th>{t.maintenance.plateNumber}</th>
                  <th>{t.maintenance.maintenanceDate}</th>
                  <th>{t.maintenance.maintenanceType}</th>
                  <th>{t.maintenance.workshop}</th>
                  <th>{t.maintenance.mechanic}</th>
                  <th>{t.maintenance.currentMileage}</th>
                  <th>{t.maintenance.totalCost}</th>
                  <th>{t.common.status}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.vehicleLabel}</td>
                    <td>{record.plateNumber}</td>
                    <td>{record.serviceDate}</td>
                    <td>{t.maintenance[record.maintenanceType] ?? record.maintenanceType}</td>
                    <td>{record.workshop}</td>
                    <td>{record.mechanic}</td>
                    <td>{record.currentMileage}</td>
                    <td>{formatMoney(record.totalCost, language)}</td>
                    <td>
                      <StatusBadge status={record.status} label={t.maintenance[record.status] ?? record.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="inline-link" onClick={() => setModal({ type: "maintenanceView", recordId: record.id })}>
                          {t.common.view}
                        </button>
                        <button type="button" className="inline-link" onClick={() => openMaintenanceEditModal(record)} disabled={!canEditMaintenance}>
                          {t.common.edit}
                        </button>
                        <button type="button" className="inline-link danger" onClick={() => deleteMaintenanceRecord(record.id)} disabled={!canDeleteMaintenance}>
                          {t.common.delete}
                        </button>
                        <button type="button" className="inline-link" onClick={exportMaintenancePdf} disabled={!canExportMaintenance}>
                          {t.common.download}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Wrench} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
        )}
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
        <StatCard label={t.billing.totalOwed} value={formatMoney(appData.billingSummary?.totals?.totalRevenue ?? appData.payments.reduce((sum, item) => sum + item.total, 0), language)} icon={BarChart3} tone="brand" />
        <StatCard label={t.billing.collected} value={formatMoney(appData.billingSummary?.totals?.paidRevenue ?? totals.revenue, language)} icon={CheckCircle2} tone="green" />
        <StatCard label={t.billing.outstanding} value={formatMoney(appData.billingSummary?.totals?.outstandingBalance ?? totals.outstanding, language)} icon={AlertCircle} tone="amber" />
      </section>

      <section className="glass-card table-card">
        {searchedPayments.length ? (
          <div className="table-wrapper">
            <table className="history-table billing-table">
              <thead>
                <tr>
                  <th>{t.billing.invoice}</th>
                  <th>{t.billing.customer}</th>
                  <th>{t.billing.issueDate}</th>
                  <th>{t.billing.dueDate}</th>
                  <th>{t.billing.total}</th>
                  <th>{t.billing.paid}</th>
                  <th>{t.billing.balance}</th>
                  <th>{t.billing.status}</th>
                  <th>{t.billing.actions}</th>
                </tr>
              </thead>
              <tbody>
                {searchedPayments.map((payment) => {
                  const balance = invoiceBalance(payment);
                  const status = invoiceDisplayStatus(payment);
                  const hasReceipt = (payment.paymentRecords?.length ?? 0) > 0 || moneyValue(payment.paid) > 0;

                  return (
                    <tr key={payment.id}>
                      <td>
                        <strong>{payment.invoiceNumber || payment.id}</strong>
                      </td>
                      <td>{payment.customer}</td>
                      <td>{payment.date || "—"}</td>
                      <td>{payment.dueDate || "—"}</td>
                      <td>{formatMoney(payment.total, language)}</td>
                      <td>{formatMoney(payment.paid, language)}</td>
                      <td className={balance > 0 ? "warning-text" : "success-text"}>
                        {formatMoney(balance, language)}
                      </td>
                      <td>
                        <StatusBadge status={status} label={invoiceStatusLabel(status)} />
                      </td>
                      <td>
                        <div className="table-actions billing-actions">
                          <button
                            type="button"
                            className="button small secondary"
                            onClick={() => openBillViewModal(payment)}
                          >
                            <Eye size={12} />
                            {t.billing.viewBill}
                          </button>
                          {hasReceipt ? (
                            <button
                              type="button"
                              className="button small secondary"
                              onClick={() => openReceiptForInvoice(payment)}
                            >
                              <FileText size={12} />
                              {t.billing.viewReceipt}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="button small primary"
                            onClick={() => openPayInvoiceModal(payment)}
                            disabled={balance <= 0}
                          >
                            <CircleDollarSign size={12} />
                            {t.billing.pay}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={BarChart3} title={t.common.noRecordsTitle} text={t.common.noRecordsText} />
        )}
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
        <div className="header-actions report-toolbar">
          <label className="language-picker compact">
            <span>{t.common.filter}</span>
            <select value={reportFilter} onChange={(event) => setReportFilter(event.target.value)}>
              <option value="today">{t.common.today}</option>
              <option value="yesterday">{t.common.yesterday}</option>
              <option value="week">{t.common.thisWeek}</option>
              <option value="month">{t.common.thisMonth}</option>
              <option value="custom">{t.common.customRange}</option>
              <option value="all">{t.common.all}</option>
            </select>
          </label>
          {reportFilter === "custom" ? (
            <>
              <label className="language-picker compact">
                <span>{t.common.from}</span>
                <input
                  type="date"
                  value={reportCustomFrom}
                  onChange={(event) => setReportCustomFrom(event.target.value)}
                />
              </label>
              <label className="language-picker compact">
                <span>{t.common.to}</span>
                <input
                  type="date"
                  value={reportCustomTo}
                  min={reportCustomFrom || undefined}
                  onChange={(event) => setReportCustomTo(event.target.value)}
                />
              </label>
            </>
          ) : null}
          <button type="button" className="button secondary" onClick={() => exportSectorReport("pdf")} disabled={!availableReportSectors.length}>
            <FileDown size={14} />
            {t.common.exportPdf}
          </button>
          <button type="button" className="button secondary" onClick={() => exportSectorReport("excel")} disabled={!availableReportSectors.length}>
            <FileSpreadsheet size={14} />
            {t.common.exportExcel}
          </button>
          <button type="button" className="button secondary" onClick={() => exportSectorReport("csv")} disabled={!availableReportSectors.length}>
            <Download size={14} />
            {t.common.exportCsv}
          </button>
        </div>
      </section>

      <section className="glass-card table-card" style={{ padding: "20px 22px" }}>
        <div className="section-row">
          <div>
            <h3>{t.reports.sectorsTitle}</h3>
            <p>{t.reports.sectorsText}</p>
          </div>
        </div>
        {availableReportSectors.length ? (
          <div className="report-sectors" style={{ marginTop: 16 }}>
            {availableReportSectors.map((sector) => {
              const Icon = sector.icon;
              return (
                <button
                  key={sector.id}
                  type="button"
                  className={`report-sector-card${reportPreview.sectorId === sector.id ? " active" : ""}`}
                  onClick={() => setReportSector(sector.id)}
                >
                  <div className="report-sector-icon">
                    <Icon size={14} />
                  </div>
                  <strong>{sector.label}</strong>
                  <span>
                    {sector.count} {t.reports.records.toLowerCase()}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={BarChart3} title={t.common.noRecordsTitle} text={t.reports.noSectors} />
        )}
      </section>

      {availableReportSectors.length ? (
        <section className="glass-card report-preview-card">
          <div className="report-preview-head">
            <div>
              <h3>
                {t.reports.previewTitle}: {reportPreview.sectorLabel}
              </h3>
              <p>
                {t.reports.previewText} · {t.reports.period}: {reportPreview.periodText}
              </p>
            </div>
            <div className="report-toolbar">
              <button type="button" className="button primary" onClick={() => exportSectorReport("pdf")}>
                <FileDown size={14} />
                {t.common.exportPdf}
              </button>
              <button type="button" className="button secondary" onClick={() => exportSectorReport("csv")}>
                <Download size={14} />
                {t.common.exportCsv}
              </button>
            </div>
          </div>

          <div className="report-summary-grid">
            {reportPreview.summary.map((item) => (
              <div key={item.labelKey} className="report-summary-pill">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          {reportPreview.rows.length ? (
            <div className="report-table-wrap">
              <table className="report-preview-table">
                <thead>
                  <tr>
                    {reportPreview.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportPreview.rows.slice(0, 8).map((row, index) => (
                    <tr key={`${reportPreview.sectorId}-${index}`}>
                      {reportPreview.headers.map((header) => (
                        <td key={header}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title={t.common.noRecordsTitle} text={t.reports.noRecords} />
          )}
        </section>
      ) : null}
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

        <section className="settings-forms">
          <div className="glass-card settings-card">
            <div className="section-row">
              <div className="settings-title">
                <Building2 size={18} />
                <h3>{t.settings.companyProfile}</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                {language === "sw" ? "Jina la mmiliki" : "Owner name"}
                <input type="text" readOnly value={authSession?.user?.fullName ?? ""} />
              </label>
              <label>
                {t.auth.companyName}
                <input type="text" readOnly value={authSession?.business?.name ?? authSession?.business?.companyName ?? ""} />
              </label>
              <label>
                {language === "sw" ? "Kitambulisho cha biashara" : "Business ID"}
                <input
                  type="text"
                  readOnly
                  value={authSession?.business?.businessId || "—"}
                />
              </label>
              <label>
                {t.settings.supportEmail}
                <input type="email" readOnly value={authSession?.user?.email ?? ""} />
              </label>
              <label>
                {language === "sw" ? "Jukumu lako" : "Your role"}
                <input
                  type="text"
                  readOnly
                  value={
                    String(authSession?.user?.role ?? "").toUpperCase() === "OWNER"
                      ? "Owner"
                      : authSession?.user?.roleName ?? authSession?.user?.role ?? "Member"
                  }
                />
              </label>
            </div>
            <p className="muted-copy">{t.settings.loginHint}</p>
            <button type="button" className="button secondary" onClick={handleLogout}>
              <X size={16} />
              {language === "sw" ? "Toka" : "Sign Out"}
            </button>
          </div>

          <div className="glass-card settings-card">
            <div className="section-row">
              <div className="settings-title">
                <Users size={18} />
                <h3>{t.settings.workers}</h3>
              </div>
            </div>
            <div className="list-stack tight">
              {searchedTeamMembers.length ? (
                searchedTeamMembers.map((member) => (
                  <div key={member.id ?? member.email ?? member.name} className="team-item">
                    <div className="card-head">
                      <div className="avatar">{initials(member.name)}</div>
                      <div>
                        <strong>{member.name}</strong>
                        <span>
                          {member.role}
                          {member.email ? ` · ${member.email}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={Users} title={t.common.noTeamTitle} text={t.common.noTeamText} />
              )}
            </div>
          </div>
        </section>

        {isOwner ? (
          <>
            {createdWorkerCreds ? (
              <section className="glass-card settings-card">
                <div className="settings-title">
                  <ShieldCheck size={18} />
                  <h3>{language === "sw" ? "Maelezo ya kuingia" : "Worker login details"}</h3>
                </div>
                <p className="muted-copy">
                  {createdWorkerCreds.fullName} ({createdWorkerCreds.roleName})
                </p>
                <div className="form-grid">
                  <label>
                    Business ID
                    <input type="text" readOnly value={createdWorkerCreds.businessId ?? ""} />
                  </label>
                  <label>
                    Email
                    <input type="text" readOnly value={createdWorkerCreds.email ?? ""} />
                  </label>
                  <label>
                    Password
                    <input type="text" readOnly value={createdWorkerCreds.password ?? ""} />
                  </label>
                </div>
              </section>
            ) : null}

            <section className="settings-forms">
              <form className="glass-card settings-card" onSubmit={handleCreateWorker}>
                <div className="settings-title">
                  <UserPlus size={18} />
                  <h3>{t.settings.inviteUser}</h3>
                </div>
                <div className="form-grid">
                  <label>
                    {t.settings.workerName}
                    <input
                      required
                      value={workerForm.fullName}
                      onChange={(event) => setWorkerForm((current) => ({ ...current, fullName: event.target.value }))}
                    />
                  </label>
                  <label>
                    {t.settings.workerEmail}
                    <input
                      required
                      type="email"
                      value={workerForm.email}
                      onChange={(event) => setWorkerForm((current) => ({ ...current, email: event.target.value }))}
                    />
                  </label>
                  <label>
                    {t.settings.workerPassword}
                    <input
                      required
                      type="text"
                      minLength={8}
                      value={workerForm.password}
                      onChange={(event) => setWorkerForm((current) => ({ ...current, password: event.target.value }))}
                    />
                  </label>
                  <label>
                    {t.settings.workerPhone}
                    <input
                      value={workerForm.phone}
                      onChange={(event) => setWorkerForm((current) => ({ ...current, phone: event.target.value }))}
                    />
                  </label>
                  <label>
                    {t.settings.selectRole}
                    <select
                      required
                      value={workerForm.roleId}
                      onChange={(event) => setWorkerForm((current) => ({ ...current, roleId: event.target.value }))}
                    >
                      <option value="">{language === "sw" ? "Teua..." : "Select..."}</option>
                      {roleOptions.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button type="submit" className="button primary">
                  <UserPlus size={16} />
                  {t.settings.inviteUser}
                </button>
              </form>

              <form className="glass-card settings-card" onSubmit={handleCreateRole}>
                <div className="settings-title">
                  <Settings size={18} />
                  <h3>{t.settings.createRole}</h3>
                </div>
                <div className="form-grid">
                  <label>
                    {t.settings.roleName}
                    <input
                      required
                      value={roleForm.name}
                      onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </label>
                  <label>
                    {t.settings.roleDescription}
                    <input
                      value={roleForm.description}
                      onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="permission-chip-row">
                  {(availablePermissions.length
                    ? availablePermissions
                    : [
                        { key: "deliveries:view", label: "View deliveries" },
                        { key: "deliveries:complete", label: "Complete deliveries" },
                        { key: "deliveries:upload", label: "Upload delivery proof" },
                        { key: "maintenance:view", label: "View maintenance" },
                        { key: "maintenance:upload", label: "Upload maintenance proof" },
                        { key: "assignments:view", label: "View assignments" },
                      ]
                  ).map((permission) => {
                    const key = permission.key ?? permission;
                    const label = permission.label ?? permission;
                    const active = roleForm.permissions.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`permission-chip ${active ? "is-allowed" : "is-blocked"}`}
                        onClick={() => toggleRolePermission(key)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button type="submit" className="button secondary">
                  <Plus size={16} />
                  {t.settings.createRole}
                </button>
                <div className="list-stack tight" style={{ marginTop: "1rem" }}>
                  {roleOptions.map((role) => (
                    <div key={role.id} className="team-item">
                      <div className="card-head">
                        <div>
                          <strong>{role.name}</strong>
                          <span>{role.description || (role.isSystem ? "System role" : "Custom role")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </section>
          </>
        ) : null}
      </div>
  );

  const renderAssignWork = () => {
    const workersOnly = teamMembers.filter((member) => (member.role ?? "").toUpperCase() !== "OWNER");
    const pendingCount = assignments.filter((item) => item.status === "PENDING").length;
    const activeCount = assignments.filter((item) => item.status === "IN_PROGRESS").length;
    const doneCount = assignments.filter((item) => item.status === "COMPLETED").length;

    return (
      <div className="page-stack">
        <section className="page-header">
          <div>
            <h1>
              {language === "sw" ? "Dashibodi ya Dispatcher" : "Dispatcher home"}
            </h1>
            <p>
              {language === "sw"
                ? `Karibu ${authSession?.user?.fullName ?? ""}. Gawa uwasilishaji na matengenezo kwa madereva.`
                : `Welcome ${authSession?.user?.fullName ?? ""}. Assign deliveries and maintenance to drivers.`}
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard label={language === "sw" ? "Zinasubiri" : "Pending"} value={pendingCount} icon={Clock3} tone="amber" />
          <StatCard label={language === "sw" ? "Zinaendelea" : "In progress"} value={activeCount} icon={Route} tone="brand" />
          <StatCard label={language === "sw" ? "Zimekamilika" : "Completed"} value={doneCount} icon={CheckCircle2} tone="green" />
          <StatCard label={language === "sw" ? "Wafanyakazi" : "Workers"} value={workersOnly.length} icon={Users} tone="brand" />
        </section>

        <section className="glass-card settings-card">
          <div className="settings-title">
            <UserPlus size={18} />
            <h3>{t.settings.assignWork}</h3>
          </div>
          <form className="form-grid" onSubmit={handleCreateAssignment}>
            <label>
              {t.settings.assignWorker}
              <select
                required
                value={assignmentForm.workerId}
                onChange={(event) =>
                  setAssignmentForm((current) => ({ ...current, workerId: event.target.value }))
                }
              >
                <option value="">{language === "sw" ? "Teua..." : "Select..."}</option>
                {workersOnly.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.fullName} ({worker.roleName ?? worker.role})
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.settings.assignmentType}
              <select
                value={assignmentForm.type}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="DELIVERY">{t.settings.deliveryType}</option>
                <option value="MAINTENANCE">{t.settings.maintenanceType}</option>
              </select>
            </label>
            <label>
              {t.settings.assignmentTitle}
              <input
                required
                value={assignmentForm.title}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label>
              {t.settings.assignmentDescription}
              <input
                value={assignmentForm.description}
                onChange={(event) =>
                  setAssignmentForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <button type="submit" className="button primary">
              <Plus size={16} />
              {t.settings.createAssignment}
            </button>
          </form>
        </section>

        <section className="list-stack">
          {assignments.length ? (
            assignments.map((assignment) => (
              <article key={assignment.id} className="glass-card settings-card">
                <div className="card-head">
                  <div>
                    <strong>
                      {assignment.title} · {assignment.type}
                    </strong>
                    <span>
                      {assignment.worker?.fullName ?? "Worker"} · {assignment.status}
                    </span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              icon={ClipboardList}
              title={language === "sw" ? "Hakuna kazi" : "No assignments yet"}
              text={language === "sw" ? "Gawa kazi kwa madereva." : "Assign deliveries or maintenance to workers."}
            />
          )}
        </section>
      </div>
    );
  };

  const renderMyWork = () => {
    const pendingCount = assignments.filter((item) => item.status === "PENDING").length;
    const activeCount = assignments.filter((item) => item.status === "IN_PROGRESS").length;
    const doneCount = assignments.filter((item) => item.status === "COMPLETED").length;

    return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>
            {language === "sw" ? "Dashibodi ya Dereva" : "Driver home"}
          </h1>
          <p>
            {language === "sw"
              ? `Karibu ${authSession?.user?.fullName ?? ""}. Maliza kazi ulizopewa na pakia uthibitisho.`
              : `Welcome ${authSession?.user?.fullName ?? ""}. Complete your assigned jobs and upload proof.`}
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label={language === "sw" ? "Mpya" : "To do"} value={pendingCount} icon={ClipboardList} tone="amber" />
        <StatCard label={language === "sw" ? "Inaendelea" : "In progress"} value={activeCount} icon={Route} tone="brand" />
        <StatCard label={language === "sw" ? "Imekamilika" : "Done"} value={doneCount} icon={CheckCircle2} tone="green" />
      </section>

      <section className="list-stack">
        {assignments.length ? (
          assignments.map((assignment) => (
            <article key={assignment.id} className="glass-card settings-card">
              <div className="section-row">
                <div>
                  <h3>{assignment.title}</h3>
                  <p className="muted-copy">
                    {assignment.type} · {assignment.status}
                    {assignment.description ? ` · ${assignment.description}` : ""}
                  </p>
                </div>
                <div className="button-row">
                  {assignment.status === "PENDING" ? (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => handleAssignmentStatus(assignment.id, "IN_PROGRESS")}
                    >
                      {language === "sw" ? "Anza" : "Start"}
                    </button>
                  ) : null}
                  {assignment.status !== "COMPLETED" ? (
                    <button
                      type="button"
                      className="button primary"
                      onClick={() => handleAssignmentStatus(assignment.id, "COMPLETED")}
                    >
                      <CheckCircle2 size={16} />
                      {language === "sw" ? "Maliza" : "Complete"}
                    </button>
                  ) : null}
                </div>
              </div>

              <label className="upload-chip">
                <Upload size={16} />
                <span>{language === "sw" ? "Pakia uthibitisho" : "Upload proof image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    void handleProofUpload(assignment.id, file);
                    event.target.value = "";
                  }}
                />
              </label>

              {assignment.proofs?.length ? (
                <div className="permission-chip-row" style={{ marginTop: "0.75rem" }}>
                  {assignment.proofs.map((proof) => (
                    <a
                      key={proof.id}
                      className="permission-chip is-allowed"
                      href={`${uploadsBaseUrl}${proof.url}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ImageIcon size={14} />
                      {proof.fileName}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <EmptyState
            icon={ClipboardList}
            title={language === "sw" ? "Hakuna kazi iliyogawiwa" : "No work assigned"}
            text={
              language === "sw"
                ? "Subiri mmiliki akupe uwasilishaji au matengenezo."
                : "Wait for the owner to assign a delivery or maintenance task."
            }
          />
        )}
      </section>
    </div>
  );
  };

  const renderPage = () => {
    const allowedPages = new Set(translatedNavigation.map((item) => item.id));
    const page = allowedPages.has(currentPage) ? currentPage : homePageForRole;

    if (pageLoading && !appData.fleet.length && !appData.shipments.length && !appData.customers.length && isOwner) {
      return (
        <div className="page-stack">
          <section className="glass-card settings-card">
            <h3>{language === "sw" ? "Inapakia..." : "Loading your dashboard..."}</h3>
          </section>
        </div>
      );
    }

    if (page === "dashboard") return renderDashboard();
    if (page === "my-work") return renderMyWork();
    if (page === "assign-work") return renderAssignWork();
    if (page === "fleet") return renderFleet();
    if (page === "shipments") return renderShipments();
    if (page === "deliveries") return renderDeliveries();
    if (page === "customers") return renderCustomers();
    if (page === "suppliers") return renderSuppliers();
    if (page === "maintenance") return renderMaintenance();
    if (page === "billing") return renderBilling();
    if (page === "reports") return renderReports();
    if (page === "settings") return renderSettings();
    return isOwner ? renderDashboard() : roleKey === "DISPATCHER" ? renderAssignWork() : renderMyWork();
  };

  if (authLoading) {
    return <BootSplash mode={bootSplashMode} userName={bootWelcomeName} />;
  }

  return (
    <div className={`app-shell ${authPage ? "auth-shell" : ""}`}>
      {authPage ? (
        <div className={`auth-layout ${currentPage === "signup" ? "auth-layout-premium" : ""}`}>
          <div className={`auth-content ${currentPage === "signup" ? "auth-content-wide" : ""}`}>{renderAuthCard()}</div>
        </div>
      ) : (
        <>
          <Sidebar
            items={translatedNavigation}
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            open={sidebarOpen}
            mobileOpen={mobileSidebarOpen}
            isMobile={isMobileSidebar}
            onClose={closeMobileSidebar}
            userName={authSession?.user?.fullName ?? ""}
            userRole={
              String(authSession?.user?.role ?? "").toUpperCase() === "OWNER"
                ? "Owner"
                : authSession?.user?.roleName ?? authSession?.user?.role ?? "Member"
            }
            onLogout={handleLogout}
          />
          <main className={`main-panel ${!isMobileSidebar && !sidebarOpen ? "sidebar-collapsed" : ""}`}>
            <button type="button" className="shell-menu-button" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <Menu size={18} />
            </button>
            {renderPage()}
          </main>
          <MobileNav currentPage={currentPage} items={mobileNavItems} onNavigate={setCurrentPage} />
        </>
      )}

      {toast ? (
        <div className="toast-stack">
          <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
      ) : null}

      {confirmDialog ? (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          cancelLabel={t.common.cancel}
          tone={confirmDialog.tone}
          onConfirm={() => closeConfirm(true)}
          onCancel={() => closeConfirm(false)}
        />
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
            <div className="pill-row">
              <button type="button" className={`pill-button ${fleetDetailsTab === "overview" ? "active" : ""}`} onClick={() => setFleetDetailsTab("overview")}>
                {t.common.overview}
              </button>
              <button type="button" className={`pill-button ${fleetDetailsTab === "maintenance" ? "active" : ""}`} onClick={() => setFleetDetailsTab("maintenance")}>
                {t.common.maintenance}
              </button>
            </div>

            {fleetDetailsTab === "overview" ? (
              <>
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
              </>
            ) : (
              <div className="maintenance-profile-stack">
                <div className="stats-grid compact">
                  <StatCard label={t.maintenance.totalMaintenanceCost} value={formatMoney(selectedVehicleMaintenanceSummary.totalCost, language)} icon={CircleDollarSign} tone="green" />
                  <StatCard label={t.maintenance.lastServiceDate} value={selectedVehicleMaintenanceSummary.lastServiceDate ? formatDateLabel(selectedVehicleMaintenanceSummary.lastServiceDate) : "--"} icon={CalendarClock} tone="brand" />
                  <StatCard label={t.maintenance.nextServiceDate} value={selectedVehicleMaintenanceSummary.nextServiceDate ? formatDateLabel(selectedVehicleMaintenanceSummary.nextServiceDate) : "--"} icon={BadgeAlert} tone="amber" />
                </div>

                <div className="summary-row">
                  <span>{t.maintenance.currentMileage}</span>
                  <strong>{selectedVehicleMaintenanceSummary.currentMileage || "--"}</strong>
                </div>

                <div className="glass-card chart-card">
                  <div className="section-row">
                    <div>
                      <h3>{t.maintenance.upcomingService}</h3>
                      <p>{t.common.upcoming}</p>
                    </div>
                  </div>
                  {selectedVehicleMaintenanceSummary.upcomingService ? (
                    <div className="summary-list">
                      <div className="summary-row">
                        <span>{t.maintenance.maintenanceType}</span>
                        <strong>{t.maintenance[selectedVehicleMaintenanceSummary.upcomingService.maintenanceType] ?? selectedVehicleMaintenanceSummary.upcomingService.maintenanceType}</strong>
                      </div>
                      <div className="summary-row">
                        <span>{t.maintenance.nextServiceDate}</span>
                        <strong>{formatDateLabel(selectedVehicleMaintenanceSummary.upcomingService.nextServiceDate)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>{t.maintenance.nextServiceMileage}</span>
                        <strong>{selectedVehicleMaintenanceSummary.upcomingService.nextServiceMileage ?? "--"}</strong>
                      </div>
                    </div>
                  ) : (
                    <EmptyState icon={ShieldCheck} title={t.maintenance.upcomingService} text={t.maintenance.noAlerts} />
                  )}
                </div>

                <div className="glass-card chart-card">
                  <div className="section-row">
                    <div>
                      <h3>{t.maintenance.serviceHistory}</h3>
                      <p>{t.common.history}</p>
                    </div>
                  </div>
                  <div className="maintenance-timeline">
                    {selectedVehicleMaintenanceRecords.length ? (
                      selectedVehicleMaintenanceRecords.map((record) => (
                        <div key={record.id} className="timeline-item">
                          <div className="timeline-date">{formatDateLabel(record.serviceDate)}</div>
                          <div className="timeline-body">
                            <div className="section-row">
                              <div>
                                <strong>{t.maintenance[record.maintenanceType] ?? record.maintenanceType}</strong>
                                <p>{record.description || record.workshop}</p>
                              </div>
                              <StatusBadge status={record.status} label={t.maintenance[record.status] ?? record.status} />
                            </div>
                            <div className="summary-list tight">
                              <div className="summary-row">
                                <span>{t.maintenance.totalCost}</span>
                                <strong>{formatMoney(record.totalCost, language)}</strong>
                              </div>
                              <div className="summary-row">
                                <span>{t.maintenance.mechanic}</span>
                                <strong>{record.mechanic}</strong>
                              </div>
                              <div className="summary-row">
                                <span>{t.maintenance.currentMileage}</span>
                                <strong>{record.currentMileage}</strong>
                              </div>
                            </div>
                            {(record.parts ?? []).length ? (
                              <div className="parts-pill-row">
                                {record.parts.map((part) => (
                                  <span key={part.id} className="category-badge owned">
                                    {part.partName}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState icon={Wrench} title={t.maintenance.serviceHistory} text={t.maintenance.noHistory} />
                    )}
                  </div>
                </div>

                <div className="feature-grid maintenance-files-grid">
                  <div className="glass-card chart-card">
                    <div className="section-row">
                      <div>
                        <h3>{t.maintenance.partsReplaced}</h3>
                        <p>{t.maintenance.repairHistory}</p>
                      </div>
                    </div>
                    <div className="parts-pill-row">
                      {selectedVehicleMaintenanceSummary.partsReplaced.length ? (
                        selectedVehicleMaintenanceSummary.partsReplaced.map((part) => (
                          <span key={part.id} className="category-badge rented">
                            {part.partName} x{part.quantity}
                          </span>
                        ))
                      ) : (
                        <span className="helper-text">{t.maintenance.noHistory}</span>
                      )}
                    </div>
                  </div>

                  <div className="glass-card chart-card">
                    <div className="section-row">
                      <div>
                        <h3>{t.maintenance.invoicesPhotos}</h3>
                        <p>{t.common.files}</p>
                      </div>
                    </div>
                    <div className="upload-list">
                      {selectedVehicleMaintenanceSummary.uploads.length ? (
                        selectedVehicleMaintenanceSummary.uploads.map((file) => (
                          <a key={file.id} className="upload-chip" href={file.url} target="_blank" rel="noreferrer">
                            {file.category === "photo" ? <ImageIcon size={14} /> : <FileText size={14} />}
                            <span>{file.name}</span>
                          </a>
                        ))
                      ) : (
                        <span className="helper-text">{t.maintenance.noUploads}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      ) : null}

      {modal.type === "maintenanceView" && selectedMaintenanceRecord ? (
        <Modal
          title={t.maintenance.recordsTitle}
          onClose={closeModal}
          onSave={() => openMaintenanceEditModal(selectedMaintenanceRecord)}
          saveLabel={t.common.edit}
          cancelLabel={t.common.close}
        >
          <div className="fleet-modal-details">
            <div className="summary-row">
              <span>{t.maintenance.vehicle}</span>
              <strong>{selectedMaintenanceRecord.vehicleLabel}</strong>
            </div>
            <div className="summary-row">
              <span>{t.maintenance.plateNumber}</span>
              <strong>{selectedMaintenanceRecord.plateNumber}</strong>
            </div>
            <div className="summary-row">
              <span>{t.maintenance.maintenanceDate}</span>
              <strong>{formatDateLabel(selectedMaintenanceRecord.serviceDate)}</strong>
            </div>
            <div className="summary-row">
              <span>{t.maintenance.maintenanceType}</span>
              <strong>{t.maintenance[selectedMaintenanceRecord.maintenanceType] ?? selectedMaintenanceRecord.maintenanceType}</strong>
            </div>
            <div className="summary-row">
              <span>{t.maintenance.totalCost}</span>
              <strong>{formatMoney(selectedMaintenanceRecord.totalCost, language)}</strong>
            </div>
            <div className="summary-row">
              <span>{t.common.notes}</span>
              <strong>{selectedMaintenanceRecord.notes || "--"}</strong>
            </div>
            <div className="upload-list">
              {(selectedMaintenanceRecord.files ?? []).map((file) => (
                <a key={file.id} className="upload-chip" href={file.url} target="_blank" rel="noreferrer">
                  {file.category === "photo" ? <ImageIcon size={14} /> : <FileText size={14} />}
                  <span>{file.name}</span>
                </a>
              ))}
            </div>
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
        <Modal title={t.modal.recordPayment} onClose={closeModal} onSave={handleModalSave} saveLabel={t.billing.pay} cancelLabel={t.common.cancel}>
          <div className="form-grid single">
            {modalForm.invoiceId ? (
              <div className="fleet-modal-details billing-pay-summary">
                <div className="summary-row">
                  <span>{t.billing.invoice}</span>
                  <strong>
                    {appData.payments.find((item) => item.id === modalForm.invoiceId)?.invoiceNumber || modalForm.invoiceId}
                  </strong>
                </div>
                <div className="summary-row">
                  <span>{t.billing.balance}</span>
                  <strong>
                    {formatMoney(
                      invoiceBalance(appData.payments.find((item) => item.id === modalForm.invoiceId)),
                      language,
                    )}
                  </strong>
                </div>
              </div>
            ) : null}
            <label>
              {t.modal.customer}
              <select
                name="customer"
                value={modalForm.customer ?? ""}
                onChange={updateForm}
                disabled={Boolean(modalForm.invoiceId)}
              >
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

      {modal.type === "billView" && (modal.bill || selectedBillingInvoice) ? (
        <Modal
          title={t.billing.billTitle}
          onClose={closeModal}
          hideSave={invoiceBalance(selectedBillingInvoice || modal.bill) <= 0}
          onSave={() => openPayInvoiceModal(selectedBillingInvoice)}
          saveLabel={t.billing.pay}
          cancelLabel={t.common.close}
          wide
          footerActions={
            <>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  const bill =
                    modal.bill || buildBillDocument(selectedBillingInvoice, authSession?.business);
                  downloadBillingDocument(bill, t.billing);
                }}
              >
                <Download size={16} />
                {t.billing.downloadBill}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  const bill =
                    modal.bill || buildBillDocument(selectedBillingInvoice, authSession?.business);
                  void shareBillingDocument(bill, t.billing);
                }}
              >
                <Share2 size={16} />
                {t.billing.shareBill}
              </button>
              {selectedBillingInvoice && moneyValue(selectedBillingInvoice.paid) > 0 ? (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => openReceiptForInvoice(selectedBillingInvoice)}
                >
                  <FileText size={16} />
                  {t.billing.viewReceipt}
                </button>
              ) : null}
            </>
          }
        >
          <BillSheet
            bill={modal.bill || buildBillDocument(selectedBillingInvoice, authSession?.business)}
            labels={t.billing}
          />
        </Modal>
      ) : null}

      {modal.type === "receipt" && modal.receipt ? (
        <Modal
          title={t.billing.receiptTitle}
          onClose={closeModal}
          hideSave
          wide
          cancelLabel={t.common.close}
          footerActions={
            <>
              <button
                type="button"
                className="button secondary"
                onClick={() => downloadBillingDocument(modal.receipt, t.billing)}
              >
                <Download size={16} />
                {t.billing.downloadReceipt}
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  void shareBillingDocument(modal.receipt, t.billing);
                }}
              >
                <Share2 size={16} />
                {t.billing.shareReceipt}
              </button>
            </>
          }
        >
          <ReceiptSheet receipt={modal.receipt} labels={t.billing} />
        </Modal>
      ) : null}

      {modal.type === "maintenance" ? (
        <MaintenanceFormModal
          title={modal.mode === "edit" ? t.common.edit : t.maintenance.addMaintenance}
          form={modalForm}
          setForm={setModalForm}
          vehicleOptions={maintenanceVehicleOptions}
          language={language}
          formatMoney={formatMoney}
          onClose={closeModal}
          onSave={handleModalSave}
          saveLabel={t.maintenance.saveMaintenance}
          cancelLabel={t.common.cancel}
          uploading={fileUploading}
          onUploadFiles={handleMaintenanceFiles}
          onRemoveFile={removeMaintenanceFile}
          canChangeStatus={canApproveMaintenance || modal.mode === "create" || isOwner}
          labels={{
            formIntro: t.maintenance.formIntro,
            sectionVehicle: t.maintenance.sectionVehicle,
            sectionVehicleText: t.maintenance.sectionVehicleText,
            sectionDetails: t.maintenance.sectionDetails,
            sectionDetailsText: t.maintenance.sectionDetailsText,
            sectionParts: t.maintenance.sectionParts,
            sectionPartsText: t.maintenance.sectionPartsText,
            sectionCosts: t.maintenance.sectionCosts,
            sectionCostsText: t.maintenance.sectionCostsText,
            sectionAttachments: t.maintenance.sectionAttachments,
            sectionAttachmentsText: t.maintenance.sectionAttachmentsText,
            sectionNotes: t.maintenance.sectionNotes,
            sectionNotesText: t.maintenance.sectionNotesText,
            vehicleSearch: t.maintenance.vehicleSearch,
            vehicleSearchPlaceholder: t.maintenance.vehicleSearchPlaceholder,
            vehicle: t.maintenance.vehicle,
            selectVehicle: t.maintenance.selectVehicle,
            plateNumber: t.maintenance.plateNumber,
            plateAutoFill: t.maintenance.plateAutoFill,
            odometer: t.maintenance.odometer,
            odometerPlaceholder: t.maintenance.odometerPlaceholder,
            maintenanceDate: t.maintenance.maintenanceDate,
            mechanic: t.maintenance.mechanic,
            mechanicPlaceholder: t.maintenance.mechanicPlaceholder,
            workshopOptional: t.maintenance.workshopOptional,
            workshopPlaceholder: t.maintenance.workshopPlaceholder,
            optional: t.maintenance.optional,
            maintenanceType: t.maintenance.maintenanceType,
            priority: t.maintenance.priority,
            status: t.common.status,
            description: t.maintenance.description,
            descriptionPlaceholder: t.maintenance.descriptionPlaceholder,
            selectOption: t.maintenance.selectOption,
            tyreDetails: t.maintenance.tyreDetails,
            tyrePosition: t.maintenance.tyrePosition,
            tyreSerialNumber: t.maintenance.tyreSerialNumber,
            tyreSerialPlaceholder: t.maintenance.tyreSerialPlaceholder,
            tyreSize: t.maintenance.tyreSize,
            tyreSizePlaceholder: t.maintenance.tyreSizePlaceholder,
            tyreManufacturer: t.maintenance.tyreManufacturer,
            tyreManufacturerPlaceholder: t.maintenance.tyreManufacturerPlaceholder,
            expectedReplacementMileage: t.maintenance.expectedReplacementMileage,
            expectedMileagePlaceholder: t.maintenance.expectedMileagePlaceholder,
            batteryDetails: t.maintenance.batteryDetails,
            batteryBrand: t.maintenance.batteryBrand,
            batteryBrandPlaceholder: t.maintenance.batteryBrandPlaceholder,
            batterySerialNumber: t.maintenance.batterySerialNumber,
            batterySerialPlaceholder: t.maintenance.batterySerialPlaceholder,
            batteryCapacityAh: t.maintenance.batteryCapacityAh,
            batteryCapacityPlaceholder: t.maintenance.batteryCapacityPlaceholder,
            batteryWarranty: t.maintenance.batteryWarranty,
            batteryWarrantyPlaceholder: t.maintenance.batteryWarrantyPlaceholder,
            oilDetails: t.maintenance.oilDetails,
            oilBrand: t.maintenance.oilBrand,
            oilBrandPlaceholder: t.maintenance.oilBrandPlaceholder,
            oilGrade: t.maintenance.oilGrade,
            oilGradePlaceholder: t.maintenance.oilGradePlaceholder,
            oilQuantityLitres: t.maintenance.oilQuantityLitres,
            oilQuantityPlaceholder: t.maintenance.oilQuantityPlaceholder,
            brakeDetails: t.maintenance.brakeDetails,
            brakePosition: t.maintenance.brakePosition,
            brakePositionPlaceholder: t.maintenance.brakePositionPlaceholder,
            brakeBrand: t.maintenance.brakeBrand,
            brakeBrandPlaceholder: t.maintenance.brakeBrandPlaceholder,
            part: t.maintenance.part,
            removePart: t.maintenance.removePart,
            partName: t.maintenance.partName,
            partNamePlaceholder: t.maintenance.partNamePlaceholder,
            partNumber: t.maintenance.partNumber,
            partNumberPlaceholder: t.maintenance.partNumberPlaceholder,
            brand: t.maintenance.brand,
            brandPlaceholder: t.maintenance.brandPlaceholder,
            quantity: t.maintenance.quantity,
            unitPrice: t.maintenance.unitPrice,
            totalPrice: t.maintenance.totalPrice,
            addPart: t.maintenance.addPart,
            laborCost: t.maintenance.laborCost,
            partsCost: t.maintenance.partsCost,
            otherExpenses: t.maintenance.otherExpenses,
            grandTotal: t.maintenance.grandTotal,
            autoCalculated: t.maintenance.autoCalculated,
            dropFiles: t.maintenance.dropFiles,
            dropFilesHint: t.maintenance.dropFilesHint,
            uploading: t.maintenance.uploading,
            remove: t.maintenance.remove,
            notes: t.modal.notes,
            notesPlaceholder: t.maintenance.notesPlaceholder,
            types: Object.fromEntries(MAINTENANCE_FORM_TYPE_KEYS.map((key) => [key, t.maintenance[key] || key])),
            statuses: Object.fromEntries(MAINTENANCE_FORM_STATUS_KEYS.map((key) => [key, t.maintenance[key] || key])),
            priorities: {
              low: t.maintenance.priorityLow,
              medium: t.maintenance.priorityMedium,
              high: t.maintenance.priorityHigh,
            },
            tyrePositions: {
              frontLeft: t.maintenance.frontLeft,
              frontRight: t.maintenance.frontRight,
              rearLeft: t.maintenance.rearLeft,
              rearRight: t.maintenance.rearRight,
              spare: t.maintenance.spare,
            },
          }}
        />
      ) : null}
    </div>
  );
}

export default App;

export type MeetingItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  cancelled?: boolean;
};

export type MessageItem = {
  id: string;
  initials: string;
  name: string;
  preview: string;
  time: string;
  tone: "blue" | "orange" | "green" | "purple" | "pink";
};

export type TaskItem = {
  id: string;
  title: string;
  date: string;
};

export type ReminderItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "expiry" | "birthday";
};

export type MetricItem = {
  id: string;
  label: string;
  value: string;
  valueTone?: "default" | "negative";
  change: string;
  changeTone: "up" | "down" | "na";
  previous: string;
  progress: number;
  target: string;
};

export const meetingsToday: MeetingItem[] = [
  { id: "1", title: "Call with Arun", date: "21 Jul", time: "08:20-10:30" },
  { id: "2", title: "Conference call", date: "21 Jul", time: "08:20-10:30", cancelled: true },
  { id: "3", title: "Meeting with Aatya", date: "21 Jul", time: "08:20-10:30" },
  { id: "4", title: "Call with Arun", date: "21 Jul", time: "08:20-10:30" },
  { id: "5", title: "Conference call", date: "21 Jul", time: "08:20-10:30" },
];

export const messagesToday: MessageItem[] = [
  {
    id: "1",
    initials: "CEO",
    name: "Ganesh Mohan",
    preview: "Congratulations on the launch of..",
    time: "5:30 pm",
    tone: "orange",
  },
  {
    id: "2",
    initials: "SD",
    name: "Ganesh Mohan",
    preview: "uri",
    time: "8:00 pm",
    tone: "orange",
  },
  {
    id: "3",
    initials: "HR",
    name: "Ganesh Mohan",
    preview: "Please review the updated KYC checklist",
    time: "5:30 pm",
    tone: "orange",
  },
  {
    id: "4",
    initials: "CEO",
    name: "Ganesh Mohan",
    preview: "Can we move tomorrow's call to 11?",
    time: "4:10 pm",
    tone: "orange",
  },
  {
    id: "5",
    initials: "SD",
    name: "Ganesh Mohan",
    preview: "Large & Midcap Product Presentation released",
    time: "2:45 pm",
    tone: "orange",
  },
];

export const tasks: TaskItem[] = [
  { id: "1", title: "Web Dashboard Redesign", date: "21 Jul" },
  { id: "2", title: "Conference call", date: "21 Jul" },
];

export const reminders: ReminderItem[] = [
  { id: "1", title: "ARN Expiry", subtitle: "24.04.23", kind: "expiry" },
  { id: "2", title: "ARN Birthday", subtitle: "24.04.23", kind: "birthday" },
];

export const overviewMetrics: MetricItem[] = [
  {
    id: "gross",
    label: "Gross Sales",
    value: "₹ 121 L",
    change: "5%",
    changeTone: "up",
    previous: "₹ 267 L",
    progress: 35,
    target: "₹ 350 L",
  },
  {
    id: "net",
    label: "Net Sales",
    value: "(-) ₹ 62 L",
    valueTone: "negative",
    change: "NA",
    changeTone: "na",
    previous: "₹ 160 L",
    progress: 0,
    target: "₹ 200 L",
  },
  {
    id: "fresh",
    label: "Fresh SIP",
    value: "₹ 1.5 L",
    change: "3%",
    changeTone: "up",
    previous: "₹ 3.3 L",
    progress: 29,
    target: "₹ 5.0 L",
  },
  {
    id: "cease",
    label: "SIP Cease",
    value: "₹ 0.8 L",
    change: "2%",
    changeTone: "up",
    previous: "₹ 1.8 L",
    progress: 15,
    target: "₹ 1.8 L",
  },
];

export const navSections = [
  {
    id: "main",
    label: null as string | null,
    items: [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "messages", label: "Messages (Dummy)", icon: "chat" },
      { id: "agenda", label: "Agenda", icon: "clipboard" },
    ],
  },
  {
    id: "sales",
    label: "SALES",
    items: [
      { id: "sales-track", label: "Sales track (Dummy)", icon: "bars", expandable: true },
      { id: "products", label: "Products (Dummy)", icon: "bag" },
      { id: "market", label: "Market overview (Dummy)", icon: "trend" },
    ],
  },
  {
    id: "brokerage",
    label: "BROKERAGE",
    items: [
      { id: "category", label: "Category (Dummy)", icon: "trend", expandable: true },
      { id: "limits", label: "Limits (Dummy)", icon: "clock", expandable: true },
      { id: "rate", label: "Brokerage rate (Dummy)", icon: "bars", expandable: true },
      { id: "calculator", label: "Calculator (Dummy)", icon: "calc" },
    ],
  },
  {
    id: "other",
    label: "OTHER MODULES",
    items: [
      { id: "claims", label: "Claims (Dummy)", icon: "help" },
      { id: "queries", label: "Queries (Dummy)", icon: "headset" },
      { id: "hr", label: "HR (Dummy)", icon: "user" },
      { id: "contacts", label: "Contacts (Dummy)", icon: "id" },
    ],
  },
] as const;

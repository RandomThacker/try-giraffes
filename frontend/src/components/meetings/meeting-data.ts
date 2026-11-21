export const meetingTypeOptions = ["One to one", "One to many"] as const;

export const purposeOptions = [
  "Courtesy meet",
  "Product",
  "Issue raised",
  "Introductory",
  "Fund manager",
  "Market outlook",
  "Any other",
  "NFO",
  "Business head",
] as const;

export const participantOptions = [
  "Arun Verma",
  "Group Neon",
  "Group besties",
  "Arjun Wadhwa",
  "Label",
] as const;

export const locationModeOptions = ["Physical", "Virtual"] as const;

export const feedbackSteps = [
  {
    fields: [
      { key: "product", label: "Did he say anything about product?" },
      { key: "brand", label: "Did he say anything about brand?" },
    ],
  },
  {
    fields: [
      { key: "pricing", label: "Did he say anything about pricing?" },
      { key: "concern", label: "Did he express any concern?" },
    ],
  },
  {
    fields: [
      { key: "specific", label: "Is he looking for anything specific?" },
      { key: "talked", label: "What did you talk about?" },
    ],
  },
] as const;

export const agendaMeetings = [
  { id: "1", title: "Call with Arun", date: "21 Jul", time: "08:20-10:30" },
  { id: "2", title: "Conference call", date: "21 Jul", time: "08:20-10:30", cancelled: true },
  { id: "3", title: "Meeting with Aatya", date: "21 Jul", time: "08:20-10:30" },
  { id: "4", title: "Meeting in Jaipur", date: "21 Jul", time: "08:20-10:30" },
  { id: "5", title: "Call with Aatya again", date: "21 Jul", time: "08:20-10:30" },
];

export const agendaTasks = [
  { id: "1", name: "Web Dashboard Redesign", due: "21 Jul", done: true },
  { id: "2", name: "Conference call", due: "21 Jul", done: false },
  { id: "3", name: "Follow up with Arun", due: "22 Jul", done: false },
  { id: "4", name: "Prepare NFO notes", due: "23 Jul", done: true },
];

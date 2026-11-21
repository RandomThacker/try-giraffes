import type { Metadata } from "next";
import { AgendaPage } from "@/components/meetings/agenda-page";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function AgendaRoute() {
  return <AgendaPage />;
}

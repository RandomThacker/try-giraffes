import type { Metadata } from "next";
import { GroupMembersPage } from "@/components/meetings/group-members-page";

export const metadata: Metadata = {
  title: "Group Members",
};

export default function GroupMembersRoute() {
  return <GroupMembersPage />;
}

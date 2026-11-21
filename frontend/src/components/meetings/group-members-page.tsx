"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { ModalShell } from "@/components/meetings/modal-shell";
import { ChipSelectField, OutlinedInput, type ChipOption } from "@/components/meetings/outlined-field";
import { ApiError } from "@/lib/api/client";
import { createGroup, deleteGroup, listGroups, type GroupSummary } from "@/lib/api/groups";
import { Tooltip } from "@/components/ui/tooltip";
import { getMeetingDirectory } from "@/lib/api/meetings";
import { Skeleton } from "@/components/ui/skeleton";

function initials(label: string) {
  return label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function GroupMembersPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<ChipOption[]>([]);
  const [memberOptions, setMemberOptions] = useState<ChipOption[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsPayload, directory] = await Promise.all([listGroups(), getMeetingDirectory()]);
      setGroups(groupsPayload.groups);
      setMemberOptions(
        directory.users.map((user) => ({
          id: user.id,
          label: user.full_name || user.email,
          type: "user" as const,
        })),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load groups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => groups, [groups]);

  async function onCreate() {
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createGroup({
        name: name.trim(),
        member_ids: members.map((item) => item.id),
      });
      setCreateOpen(false);
      setName("");
      setMembers([]);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create group.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      await deleteGroup(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete group.");
    }
  }

  return (
    <div className="rounded-[18px] bg-white p-5 shadow-[0_8px_28px_rgba(45,50,90,0.06)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[20px] font-semibold text-[#666CFF]"
        >
          <NavIcon name="arrow-left" className="size-5" />
          Group Members
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#666CFF] px-4 py-2.5 text-[14px] font-medium text-white"
        >
          <NavIcon name="plus" className="size-4" />
          New group
        </button>
      </div>

      {error ? <p className="mb-4 text-[13px] text-[#D14343]">{error}</p> : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-[#EEF0F5]">
          <div className="grid grid-cols-[1.4fr_0.7fr_1fr_0.4fr] bg-[#F7F8FC] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8A8A9A]">
            <span>Group name</span>
            <span>Size</span>
            <span>Members</span>
            <span>Action</span>
          </div>
          <ul>
            {sorted.length === 0 ? (
              <li className="px-4 py-8 text-center text-[13px] text-[#8A8A9A]">No groups yet.</li>
            ) : null}
            {sorted.map((group) => (
              <li
                key={group.id}
                className="grid grid-cols-[1.4fr_0.7fr_1fr_0.4fr] items-center border-t border-[#EEF0F5] px-4 py-3"
              >
                <span className="text-[14px] font-medium text-[#2B2B38]">{group.name}</span>
                <span className="text-[13px] text-[#8A8A9A]">{group.member_count} members</span>
                <div className="flex items-center">
                  {group.member_labels.slice(0, 4).map((label, index) => (
                    <span
                      key={`${group.id}-${label}`}
                      title={label}
                      className="inline-flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#EEF0FF] text-[10px] font-semibold text-[#666CFF]"
                      style={{ marginLeft: index === 0 ? 0 : -8 }}
                    >
                      {initials(label)}
                    </span>
                  ))}
                </div>
                <Tooltip label={`Delete ${group.name}`}>
                  <button
                    type="button"
                    aria-label={`Delete ${group.name}`}
                    onClick={() => void onDelete(group.id)}
                    className="inline-flex size-8 items-center justify-center rounded-[8px] bg-[#FDECEC] text-[#D14343]"
                  >
                    <NavIcon name="close" className="size-3.5" />
                  </button>
                </Tooltip>
              </li>
            ))}
          </ul>
        </div>
      )}

      {createOpen ? (
        <ModalShell title="New group" onClose={() => setCreateOpen(false)}>
          <div className="space-y-4">
            <OutlinedInput label="Group name" value={name} onChange={setName} />
            <ChipSelectField
              label="Members"
              values={members}
              options={memberOptions}
              onChange={setMembers}
              open={membersOpen}
              onOpenChange={setMembersOpen}
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-[10px] border border-[#D9DBE5] px-5 py-2.5 text-[14px] font-medium text-[#2B2B38]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void onCreate()}
              className="rounded-[10px] bg-[#666CFF] px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}

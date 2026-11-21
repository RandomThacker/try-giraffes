"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/dashboard/nav-icons";
import {
  locationModeOptions,
  meetingTypeOptions,
  purposeOptions,
} from "@/components/meetings/meeting-data";
import {
  ChipSelectField,
  OutlinedInput,
  OutlinedSelect,
  OutlinedTextarea,
  type ChipOption,
} from "@/components/meetings/outlined-field";
import { ApiError } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createMeeting,
  getMeetingDirectory,
  locationKindToApi,
  meetingTypeToApi,
  purposeToApi,
} from "@/lib/api/meetings";
import { uploadFile } from "@/lib/api/uploads";

type MeetingFormMode = "instant" | "schedule";

type MeetingFormProps = {
  mode: MeetingFormMode;
};

function defaultDateTimeLocal() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function MeetingForm({ mode }: MeetingFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("NFO Discussion");
  const [meetingType, setMeetingType] = useState<string>("One to one");
  const [arn, setArn] = useState("@1767889");
  const [description, setDescription] = useState("NFO launch discussion..");
  const [purpose, setPurpose] = useState<string>("Courtesy meet");
  const [participants, setParticipants] = useState<ChipOption[]>([]);
  const [broadcast, setBroadcast] = useState<ChipOption[]>([]);
  const [directoryOptions, setDirectoryOptions] = useState<ChipOption[]>([]);
  const [location, setLocation] = useState("IT Park, Bangalore");
  const [locationMode, setLocationMode] = useState<string>("Physical");
  const [dateTime, setDateTime] = useState(defaultDateTimeLocal());
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [typeOpen, setTypeOpen] = useState(false);
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);

  const isOneToMany = meetingType === "One to many";
  const isInstant = mode === "instant";
  const isVirtual = locationMode === "Virtual";
  const showBroadcastAndThumbnail = isOneToMany;

  const pageTitle = isInstant ? "Create Instant Meeting" : "Schedule Meeting";
  const primaryLabel = isInstant ? "Start meeting" : "Schedule";

  useEffect(() => {
    let cancelled = false;
    setDirectoryLoading(true);
    getMeetingDirectory()
      .then((payload) => {
        if (cancelled) {
          return;
        }
        const options: ChipOption[] = [
          ...payload.users.map((user) => ({
            id: user.id,
            label: user.full_name || user.email,
            type: "user" as const,
          })),
          ...payload.groups.map((group) => ({
            id: group.id,
            label: group.name,
            type: "group" as const,
          })),
        ];
        setDirectoryOptions(options);
        const arun = options.find((item) => item.type === "user" && item.label === "Arun Verma");
        const neon = options.find((item) => item.type === "group" && item.label === "Group Neon");
        if (arun) {
          setParticipants([arun]);
        }
        if (arun && neon) {
          setBroadcast([arun, neon]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Unable to load participants.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDirectoryLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const participantChoices = useMemo(() => directoryOptions, [directoryOptions]);

  async function onUpload(file: File | null) {
    if (!file) {
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFile(file);
      setThumbnailUrl(result.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to upload thumbnail.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const selectedParticipants =
        showBroadcastAndThumbnail && participants.length === 0 ? broadcast.slice(0, 1) : participants;
      if (selectedParticipants.length === 0) {
        setError("Select at least one participant.");
        setSubmitting(false);
        return;
      }

      await createMeeting({
        mode: isInstant ? "instant" : "scheduled",
        title: title.trim(),
        description: description.trim(),
        arn: arn.trim(),
        meeting_type: meetingTypeToApi(meetingType),
        purpose: purposeToApi(purpose),
        location: isInstant ? null : isVirtual ? "Online" : location,
        location_kind: isInstant ? null : locationKindToApi(locationMode),
        starts_at: isInstant ? null : new Date(dateTime).toISOString(),
        ends_at: isInstant
          ? null
          : new Date(new Date(dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        thumbnail_url: showBroadcastAndThumbnail ? thumbnailUrl : null,
        participants: selectedParticipants.map((item) => ({ type: item.type, id: item.id })),
        broadcasts: showBroadcastAndThumbnail
          ? broadcast.map((item) => ({ type: item.type, id: item.id }))
          : [],
      });
      router.push("/agenda");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create meeting.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[18px] bg-app-surface p-5 shadow-[var(--app-shadow)] sm:p-7">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-left text-[18px] font-semibold text-brand sm:text-[20px]"
        >
          <NavIcon name="arrow-left" className="size-5 shrink-0" />
          {pageTitle}
        </button>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push("/agenda/groups")}
            className="rounded-[10px] bg-[#EEF0FF] px-3.5 py-2.5 text-[13px] font-medium text-brand sm:px-4 sm:text-[14px]"
          >
            View group members
          </button>
          <button
            type="button"
            disabled={submitting || uploading}
            onClick={() => void onSubmit()}
            className="rounded-[10px] bg-brand px-3.5 py-2.5 text-[13px] font-medium text-white disabled:opacity-60 sm:px-4 sm:text-[14px]"
          >
            {submitting ? "Saving..." : primaryLabel}
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-[13px] text-app-danger">{error}</p> : null}
      {directoryLoading ? (
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : null}

      <div className={`grid gap-8 lg:grid-cols-[1.05fr_1fr] ${directoryLoading ? "hidden" : ""}`}>
        <div className="space-y-4">
          <OutlinedInput label="Meeting Title" value={title} onChange={setTitle} />
          <OutlinedSelect
            label="Meeting Type"
            value={meetingType}
            options={meetingTypeOptions}
            onChange={(value) => {
              setMeetingType(value);
              if (value === "One to one" && participants.length > 1) {
                setParticipants(participants.slice(0, 1));
              }
            }}
            open={typeOpen}
            onOpenChange={setTypeOpen}
          />
          <OutlinedInput label="ARN Number/ Name" value={arn} onChange={setArn} />
          <OutlinedTextarea label="Description" value={description} onChange={setDescription} rows={4} />
          <OutlinedSelect
            label="Purpose Served"
            value={purpose}
            options={purposeOptions}
            onChange={setPurpose}
            open={purposeOpen}
            onOpenChange={setPurposeOpen}
          />
          <p className="pt-2 text-[12px] text-app-faint">
            Note- Please note agenda and meeting schedule will be sent to partner on Whatsapp.
          </p>
        </div>

        <div className="space-y-4 border-t border-app-border-2 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {!isInstant ? (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <OutlinedInput
                  label="Location"
                  value={isVirtual ? "Online" : location}
                  onChange={setLocation}
                  readOnly={isVirtual}
                  className={isVirtual ? "bg-app-muted-bg" : ""}
                />
                <OutlinedSelect
                  label="Type"
                  value={locationMode}
                  options={locationModeOptions}
                  onChange={(value) => {
                    setLocationMode(value);
                    if (value === "Virtual") {
                      setLocation("Online");
                    } else if (location === "Online") {
                      setLocation("IT Park, Bangalore");
                    }
                  }}
                  open={modeOpen}
                  onOpenChange={setModeOpen}
                />
              </div>
              <OutlinedInput
                label="Date-Time"
                value={dateTime}
                onChange={setDateTime}
                type="datetime-local"
                trailing={<NavIcon name="calendar" className="size-4 text-brand" />}
              />
            </>
          ) : null}

          <ChipSelectField
            label={isOneToMany ? "Add participants" : "Add participant"}
            values={participants}
            options={participantChoices}
            onChange={(values) => {
              if (!isOneToMany && values.length > 1) {
                setParticipants(values.slice(-1));
                return;
              }
              setParticipants(values);
            }}
            open={participantsOpen}
            onOpenChange={setParticipantsOpen}
          />

          {showBroadcastAndThumbnail ? (
            <>
              <ChipSelectField
                label="Broadcast this to any group or person"
                values={broadcast}
                options={participantChoices}
                onChange={setBroadcast}
                open={broadcastOpen}
                onOpenChange={setBroadcastOpen}
              />
              <ThumbnailUpload
                url={thumbnailUrl}
                uploading={uploading}
                onFile={(file) => void onUpload(file)}
                onClear={() => setThumbnailUrl(null)}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ThumbnailUpload({
  url,
  uploading,
  onFile,
  onClear,
}: {
  url: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-3">
      <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#D5D7E5] bg-[#F8F9FC] px-4 py-8 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-app-surface text-brand shadow-sm">
          <NavIcon name="upload" className="size-5" />
        </span>
        <p className="text-[14px] text-[#4F4F5F]">
          <span className="font-medium text-brand">
            {uploading ? "Uploading..." : "Click to upload Thumbnail"}
          </span>{" "}
          or drag and drop
        </p>
        <p className="text-[12px] text-app-faint">SVG, PNG, JPG or GIF (max. 800×400px)</p>
        <input
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,image/gif"
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (file) {
              onFile(file);
            }
            event.target.value = "";
          }}
        />
      </label>
      {url ? (
        <div className="flex items-center justify-between gap-3 rounded-[12px] border border-app-border bg-app-surface px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Thumbnail preview" className="h-12 w-20 rounded object-cover" />
          <button type="button" onClick={onClear} className="text-[13px] text-app-danger">
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

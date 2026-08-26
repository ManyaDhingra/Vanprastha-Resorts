import { cn } from "@/lib/utils";

type Tone = "amber" | "emerald" | "red";

const toneClasses: Record<Tone, string> = {
  amber: "bg-amber-50 text-amber-800",
  emerald: "bg-emerald-50 text-emerald-800",
  red: "bg-red-50 text-red-700",
};

/** Small colored status pill used across admin surfaces. */
export function StatusBadge({
  label,
  value,
  tone,
}: {
  label?: string;
  value: number | string;
  tone: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {label ? `${label}: ` : ""}
      {value}
    </span>
  );
}

/** Booking status pill: CONFIRMED=emerald, CANCELLED=red, else amber. */
export function BookingStatusBadge({ status }: { status: string }) {
  const tone: Tone =
    status === "CONFIRMED" ? "emerald" : status === "CANCELLED" ? "red" : "amber";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {status}
    </span>
  );
}
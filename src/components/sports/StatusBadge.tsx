import { memo } from "react";
import { Badge } from "@/components/ui/badge";

function StatusBadgeImpl({ status }: { status?: string }) {
  if (status === "inprogress" || status === "live")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(255,0,0,0.4)]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        LIVE
      </span>
    );
  if (status === "finished") return <Badge variant="secondary" className="rounded-full">Finished</Badge>;
  return <Badge variant="outline" className="rounded-full">Upcoming</Badge>;
}

export const StatusBadge = memo(StatusBadgeImpl);
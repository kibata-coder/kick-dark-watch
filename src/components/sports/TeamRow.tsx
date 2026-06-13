import { memo, useState } from "react";
import { Trophy } from "lucide-react";
import { countryFlagUrl } from "@/lib/country-flags";

function TeamRowImpl({ name, logo }: { name?: string; logo?: string }) {
  const flag = countryFlagUrl(name) ?? null;
  const initial: string | null = logo && logo.trim() ? logo : flag;
  const [src, setSrc] = useState<string | null>(initial);
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border p-1">
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setSrc((cur) => (cur !== flag && flag ? flag : null))}
            className="h-full w-full object-contain"
          />
        ) : (
          <Trophy className="h-4 w-4 text-muted-foreground/60" />
        )}
      </div>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

export const TeamRow = memo(TeamRowImpl);
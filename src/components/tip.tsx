"use client";

import {
  Tooltip, TooltipArrow, TooltipContent, TooltipTrigger,
} from "@animate-ui/react/primitives/tooltip";

export function Tip({
  label,
  side = "top",
  children,
}: {
  label: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
}) {
  return (
    <Tooltip side={side}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="rounded-md bg-foreground px-2.5 py-1 text-xs whitespace-nowrap text-background">
        <TooltipArrow className="size-2.5 fill-foreground" />
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  );
}

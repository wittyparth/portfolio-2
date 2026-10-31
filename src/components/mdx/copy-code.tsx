"use client";

import { CopyButton, CopyButtonIcon } from "@animate-ui/react/primitives/buttons/copy";
import { Check } from "@/components/animate-ui/icons/check";
import { Copy } from "@/components/animate-ui/icons/copy";
import { Tip } from "../tip";

export function CopyCode({ code }: { code: string }) {
  return (
    <Tip label="Copy code">
      <CopyButton
        content={code}
        delay={2000}
        aria-label="Copy code"
        className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-copied:text-emerald-600 dark:data-copied:text-emerald-400"
      >
        <CopyButtonIcon icon={<Copy size={14} />} copiedIcon={<Check size={14} />} />
      </CopyButton>
    </Tip>
  );
}

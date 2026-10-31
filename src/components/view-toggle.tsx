"use client";

import * as React from "react";
import { FilterTabs } from "./filter-tabs";

/** Layout switcher: icon plus a label (the label hides on small screens). */
export function ViewToggle<T extends string>({
  value, onChange, views,
}: {
  value: T;
  onChange: (v: T) => void;
  views: { value: T; label: string; icon: React.ReactNode }[];
}) {
  return (
    <FilterTabs
      label="Layout"
      value={value}
      onChange={onChange}
      options={views.map((v) => ({
        value: v.value,
        label: (
          <>
            {v.icon}
            <span className="max-sm:sr-only">{v.label}</span>
          </>
        ),
      }))}
    />
  );
}

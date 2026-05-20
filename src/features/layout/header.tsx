"use client";

import { Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type HeaderTab = {
  name: string;
  icon: LucideIcon;
  value?: string;
};

export type HeaderProps = {
  tabs: HeaderTab[];
  activeTab?: string;
  defaultTab?: string;
  onTabClick: (tab: HeaderTab) => void;
  className?: string;
};

export function getTabValue(tab: HeaderTab) {
  return tab.value ?? tab.name.toLowerCase().replace(/\s+/g, "-");
}

function NucleusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7 shrink-0 text-primary", className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="2.25" fill="currentColor" />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(120 12 12)"
      />
    </svg>
  );
}

function TabButton({
  tab,
  active,
  onSelect,
  className,
  showLabel = true,
}: {
  tab: HeaderTab;
  active: boolean;
  onSelect: () => void;
  className?: string;
  showLabel?: boolean;
}) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-active={active || undefined}
      className={cn(
        "inline-flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "data-active:bg-muted data-active:text-foreground",
        className
      )}
    >
      <Icon className="size-4 shrink-0" />
      {showLabel && <span>{tab.name}</span>}
    </button>
  );
}

export function Header({
  tabs,
  activeTab,
  defaultTab,
  onTabClick,
  className,
}: HeaderProps) {
  const initialValue = defaultTab ?? (tabs[0] ? getTabValue(tabs[0]) : "");
  const [internalValue, setInternalValue] = useState(initialValue);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentValue = activeTab ?? internalValue;

  const handleTabChange = (value: string) => {
    if (activeTab === undefined) {
      setInternalValue(value);
    }

    const tab = tabs.find((item) => getTabValue(item) === value);
    if (tab) {
      onTabClick(tab);
    }
  };

  const handleMobileSelect = (tab: HeaderTab) => {
    handleTabChange(getTabValue(tab));
    setMobileOpen(false);
  };

  if (tabs.length === 0) {
    return (
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
          className
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <NucleusIcon />
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <div className="flex shrink-0 items-center gap-2">
          <NucleusIcon />
          <span className="sr-only">Home</span>
        </div>

        <Tabs
          value={currentValue}
          onValueChange={handleTabChange}
          className="hidden min-w-0 flex-1 md:block"
        >
          <TabsList variant="line" className="h-9 w-full justify-start bg-transparent">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const value = getTabValue(tab);

              return (
                <TabsTrigger key={value} value={value} className="gap-2 px-3">
                  <Icon />
                  {tab.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className="ml-auto shrink-0 md:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100%,280px)]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <NucleusIcon className="size-6" />
                Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 pb-4">
              {tabs.map((tab) => (
                <TabButton
                  key={getTabValue(tab)}
                  tab={tab}
                  active={getTabValue(tab) === currentValue}
                  onSelect={() => handleMobileSelect(tab)}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

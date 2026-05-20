"use client";

import { BookOpen, Home, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Header, type HeaderTab, getTabValue } from "@/features/layout/header";

const tabs: HeaderTab[] = [
  { name: "Home", icon: Home, value: "home" },
  { name: "Tests", icon: BookOpen, value: "tests" },
  { name: "Settings", icon: Settings, value: "settings" },
];

function tabFromPathname(pathname: string) {
  if (pathname.startsWith("/tests")) return "tests";
  if (pathname.startsWith("/settings")) return "settings";
  return "home";
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => tabFromPathname(pathname));

  useEffect(() => {
    setActiveTab(tabFromPathname(pathname));
  }, [pathname]);

  return (
    <Header
      tabs={tabs}
      activeTab={activeTab}
      onTabClick={(tab) => {
        const value = getTabValue(tab);
        setActiveTab(value);
        if (value === "home") router.push("/");
        if (value === "tests") router.push("/tests");
        if (value === "settings") router.push("/settings");
      }}
    />
  );
}

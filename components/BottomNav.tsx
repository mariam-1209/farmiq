"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/doctor", icon: Stethoscope, label: "Doctor" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: "rgba(250,248,244,0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "#e8eee9",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative transition-colors"
              style={{ color: isActive ? "#1d5c3a" : "#9ca3af" }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-2 w-5 h-1 rounded-full"
                  style={{ background: "#1d5c3a" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="mt-3"
              />
              <span
                className="text-xs font-medium"
                style={{
                  color: isActive ? "#1d5c3a" : "#9ca3af",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
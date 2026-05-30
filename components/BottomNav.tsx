"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, User } from "lucide-react";
const tabs = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/doctor", icon: Stethoscope, label: "Doctor" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              <Icon size={22} />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
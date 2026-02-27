import React from "react";
import { ChevronRight, Search, Bell } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import BankSelector from "../components/BankSelector";
import { useAuth } from "../auth/AuthContext";

const routeNameMap = {
  "": "Dashboard",
  banks: "Banks",
  cards: "Cards",
  tiers: "Tiers",
  vendors: "Vendors",
  partners: "Partners",
};

const TopBar = ({ actions }) => {
  const location = useLocation();
  const { isOperations, isAdmin } = useAuth();
  const pathnames = location.pathname
    .split("/")
    .filter(Boolean)
    .filter(
      (segment) =>
        // filter out numbers (ids)
        isNaN(segment) &&
        // filter out UUIDs (accept both v1-v5 and non-RFC-compliant but still 36-char UUIDs)
        !(
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(segment) ||
          /^[0-9]{1,18,}$/.test(segment)
        )
    );

  return (
    <header className="flex p-6 h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-6 shadow-sm font-['Manrope']">
      <nav className="flex items-center gap-4" aria-label="Breadcrumb">
        {isOperations() && !isAdmin() && (
          <div className="flex items-center gap-2 shrink-0">
            <BankSelector />
          </div>
        )}
        <div className="flex items-center gap-1">
        <NavLink
          to="/"
          className="text-neutral-500 text-sm hover:text-neutral-900"
        >
          Dashboard
        </NavLink>

        {pathnames.map((segment, index) => {
          const to = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          return (
            <div key={to} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-neutral-300" />

              {isLast ? (
                <span className="text-neutral-900 text-sm font-medium">
                  {routeNameMap[segment] || segment}
                </span>
              ) : (
                <NavLink
                  to={to}
                  className="text-neutral-500 text-sm hover:text-neutral-900"
                >
                  {routeNameMap[segment] || segment}
                </NavLink>
              )}
            </div>
          );
        })}
        </div>
      </nav>
      <div className="flex items-center gap-4">
        {actions ? (
          actions
        ) : (
          <div className="flex items-center gap-3">
            <button className="group flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 transition-all hover:border-neutral-400">
              <Search size={16} />
              <span className="text-sm font-medium">Command</span>
              <kbd className="flex h-5 items-center rounded border border-neutral-200 bg-neutral-100 px-1.5 text-[10px]">
                ⌘K
              </kbd>
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
              <Bell size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
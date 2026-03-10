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
  "bank-vendors": "Bank-Vendor Mapping",
  "pricing-rules": "Pricing Rules",
  "visibility-rules": "Visibility Rules",
  "audit-logs": "Audit Logs",
  "vendor-sync-runs": "Vendor Sync Logs",
  users: "Users",
  vouchers: "Vouchers",
  "products": "Products",
  merchandise: "Merchandise",
  approvals: "Approvals",
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
    <header className="flex h-14 w-full items-center justify-between border-b border-border bg-card px-6 shadow-elevated shrink-0">
      <nav className="flex items-center gap-4 min-w-0" aria-label="Breadcrumb">
        {isOperations() && !isAdmin() && (
          <div className="flex items-center gap-2 shrink-0">
            <BankSelector />
          </div>
        )}
        <div className="flex items-center gap-1.5 min-w-0">
          <NavLink
            to="/"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-fast"
          >
            Dashboard
          </NavLink>
          {pathnames.map((segment, index) => {
            const to = "/" + pathnames.slice(0, index + 1).join("/");
            const isLast = index === pathnames.length - 1;
            return (
              <div key={to} className="flex items-center gap-1.5 shrink-0">
                <ChevronRight size={14} className="text-muted-foreground/70" aria-hidden />
                {isLast ? (
                  <span className="text-foreground text-sm font-medium">
                    {routeNameMap[segment] || segment}
                  </span>
                ) : (
                  <NavLink
                    to={to}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-fast"
                  >
                    {routeNameMap[segment] || segment}
                  </NavLink>
                )}
              </div>
            );
          })}
        </div>
      </nav>
      <div className="flex items-center gap-3 shrink-0">
        {actions ?? (
          <>
            <button className="group flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 transition-colors duration-fast hover:border-primary/40 hover:bg-muted/50" type="button">
              <Search size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Command</span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-fast" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
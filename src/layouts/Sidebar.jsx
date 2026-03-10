import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MoreHorizontal, Zap, Tag, Settings, LogOut, ChevronUp, Briefcase, LayoutDashboard, Building2, CreditCard, Layers, ShoppingBag, History, Users, ChevronDown, Logs, SearchCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const getNavStructure = (isAdmin) => [
  {
    type: 'item',
    label: 'Dashboard',
    icon: <LayoutDashboard size={16} />,
    href: '/',
    match: /^\/$/,
    key: 'Dashboard'
  },
  {
    type: 'menu',
    label: 'Entity Management',
    icon: <Building2 size={16} />,
    menuKey: 'entity',
    children: [
      { icon: <Briefcase size={16} />, label: 'Banks', href: '/banks', match: /^\/banks/, key: 'Banks' },
      ...(isAdmin() ? [{ icon: <ShoppingBag size={16} />, label: 'Merchants', href: '/vendors', match: /^\/vendors/, key: 'Merchants' }] : []),
      // ...(isAdmin() ? [{ icon: <Users size={16} />, label: 'Partners', href: '/partners', match: /^\/partners/, key: 'Partners' }] : [])
    ]
  },
  {
    type: 'menu',
    label: 'Product Catalog',
    icon: <Tag size={16} />,
    menuKey: 'catalog',
    children: [
      { icon: <Layers size={16} />, label: 'Vouchers', href: '/vouchers', match: /^\/vouchers/, key: 'Vouchers' },
      // { icon: <ShoppingBag size={16} />, label: 'Merchandise', href: '/merchandise', match: /^\/merchandise/, key: 'Merchandise' }
    ]
  },
  {
    type: 'menu',
    label: 'Configuration',
    icon: <Settings size={16} />,
    menuKey: 'configuration',
    children: [
      { icon: <CreditCard size={16} />, label: 'Bank-Vendor Mapping', href: '/bank-vendors', match: /^\/bank-vendors/, key: 'Bank-Vendor-Mapping' },
      { icon: <Settings size={16} />, label: 'Pricing Rules', href: '/pricing-rules', match: /^\/pricing-rules/, key: 'Pricing-Rules' },
      { icon: <SearchCheck size={16} />, label: 'Visibility Rules', href: '/visibility-rules', match: /^\/visibility-rules/, key: 'Visibility-Rules' }
    ]
  },
  ...(isAdmin()
    ? [{
        type: 'menu',
        label: 'Administration',
        icon: <Users size={16} />,
        menuKey: 'administration',
        children: [
          { icon: <Users size={16} />, label: 'Users', href: '/users', match: /^\/users/, key: 'Users' },
          { icon: <History size={16} />, label: 'Audit Logs', href: '/audit-logs', match: /^\/audit-logs/, key: 'Audit-Logs' },
          { icon: <Logs size={16} />, label: 'Vendor Sync Job Logs', href: '/vendor-sync-runs', match: /^\/vendor-sync-runs/, key: 'Vendor-Sync-Job-Logs' }
        ]
      }]
    : [])
];

const NavItem = ({ icon, label, href, active = false, onClick }) => {
  return (
    <NavLink
      to={href}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-fast ${
        active ? 'bg-primary text-primary-foreground shadow-card' : 'text-slate-600 hover:bg-slate-100'
      }`}
      onClick={onClick}
      end={href === '/'}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
};

const MenuHeader = ({ icon, label, isOpen, onClick }) => {
  return (
    <button
      className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-fast"
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="flex flex-1 text-sm font-medium">{label}</span>
      {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
    </button>
  );
};

const SubNavItem = ({ icon, label, href, active = false, onClick }) => {
  return (
    <NavLink
      to={href}
      className={`w-full pl-9 flex items-center gap-3 pr-3 py-2.5 rounded-lg transition-colors duration-fast
        ${active ? 'bg-primary text-primary-foreground shadow-card' : 'text-slate-600 hover:bg-slate-100'}
      `}
      onClick={onClick}
      end
    >
      <div className={active ? 'opacity-90' : 'opacity-70'}>{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
};

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Track open/closed state of menus
  const [openMenu, setOpenMenus] = useState({
    entity: true,
    catalog: true,
    configuration: true,
    administration: true
  });

  // Track activeItem based on the URL path
  const [activeItem, setActiveItem] = useState('Dashboard');

  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const NAV_STRUCTURE = getNavStructure(isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine menu or nav item to highlight based on the current location.pathname
  useEffect(() => {
    let found = false;
    for (const navEntry of NAV_STRUCTURE) {
      if (navEntry.type === 'item') {
        if (navEntry.match.test(location.pathname)) {
          setActiveItem(navEntry.key);
          found = true;
          break;
        }
      } else if (navEntry.type === 'menu') {
        for (const child of navEntry.children) {
          if (child.match.test(location.pathname)) {
            setActiveItem(child.key);
            // Optionally, open the menu if not already open
            setOpenMenus((prev) => ({ ...prev, [navEntry.menuKey]: true }));
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
    // fallback
    if (!found) setActiveItem('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isAdmin]);

  const toggle = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div
      className={`${
        collapsed ? 'w-16' : 'w-[280px]'
      } flex flex-col h-screen bg-card border-r border-border shadow-card transition-[width] duration-normal ease-out shrink-0`}
    >
      <div className="p-4 flex items-center border-b border-border h-[72px] shrink-0">
        <div className="flex items-center gap-3 w-full min-w-0">
          {!collapsed && (
            <>
              <div className="rounded-xl bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0 shadow-card">
                LR
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-foreground font-bold text-base leading-tight truncate">LR Core</span>
                <span className="text-xs text-muted-foreground font-normal truncate">Voucher Control Program</span>
              </div>
            </>
          )}
          <button
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors duration-fast shrink-0"
            onClick={() => setCollapsed(!collapsed)}
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="px-3 pt-4 pb-3 border-b border-border">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg shadow-card hover:opacity-95 transition-opacity duration-fast" type="button">
          <Zap size={16} className="fill-current" />
          <span className="flex-1 text-left text-sm font-medium">Quick Actions</span>
          <ChevronDown size={16} className="opacity-80" />
        </button>
      </div>

      <div className="flex-1 px-3 pt-3 overflow-y-auto overflow-x-hidden space-y-0.5 no-scrollbar">
        {NAV_STRUCTURE.map((navEntry) => {
          if (navEntry.type === 'item') {
            return (
              <NavItem
                key={navEntry.key}
                icon={navEntry.icon}
                href={navEntry.href}
                label={navEntry.label}
                active={activeItem === navEntry.key}
                onClick={() => setActiveItem(navEntry.key)}
              />
            );
          }
          if (navEntry.type === 'menu') {
            return (
              <div className="mt-2" key={navEntry.menuKey}>
                <MenuHeader
                  icon={navEntry.icon}
                  label={navEntry.label}
                  isOpen={openMenu[navEntry.menuKey]}
                  onClick={() => toggle(navEntry.menuKey)}
                />
                {openMenu[navEntry.menuKey] && (
                  <div className="ml-2 space-y-1">
                    {navEntry.children.map((child) => (
                      <SubNavItem
                        key={child.key}
                        icon={child.icon}
                        label={child.label}
                        href={child.href}
                        active={activeItem === child.key}
                        onClick={() => setActiveItem(child.key)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="p-4 border-t border-border bg-muted/50 flex gap-3 flex-col shrink-0">
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-card">
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shrink-0">
            {user?.username?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex flex-1 min-w-0 flex-col">
            <span className="text-sm font-semibold text-foreground truncate">{user?.username}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {user?.roles?.join(', ')}
            </span>
          </div>
          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
        </div>

        <div className="space-y-0.5">
          <button className="flex w-full gap-3 px-3 py-2 items-center text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-fast text-sm font-medium" type="button">
            <Settings size={16} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-fast text-sm font-medium" onClick={handleLogout} type="button">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
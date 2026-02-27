import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MoreHorizontal, Zap, Tag, Settings, LogOut, ChevronUp, Briefcase, LayoutDashboard, Building2, CreditCard, Layers, ShoppingBag, History, Users, ChevronDown, Logs } from 'lucide-react';
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
      { icon: <Settings size={16} />, label: 'Pricing Rules', href: '/pricing-rules', match: /^\/pricing-rules/, key: 'Pricing-Rules' }
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
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        active ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
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
      className="w-full flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors"
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="flex flex-1">{label}</span>
      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );
};

const SubNavItem = ({ icon, label, href, active = false, onClick }) => {
  return (
    <NavLink
      to={href}
      className={`w-full pl-9 flex items-center gap-3 pr-3 py-2 rounded-xl transition-colors
        ${active ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}
      `}
      onClick={onClick}
      end // so exact path matches for leaf route
    >
      <div className="opacity-70">{icon}</div>
      <span className="text-sm font-normal">{label}</span>
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
        collapsed ? 'w-16' : 'w-72'
      } flex flex-col h-screen bg-white border-r border-neutral-200 transition-all duration-300 font-['Manrope']`}
    >
      <div className="p-4 flex items-center border-b border-neutral-200 h-[77px]">
        <div className="flex items-center gap-3 p-4">
          {!collapsed && (
            <>
              <div className="rounded-[14px] text-white bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 w-10 h-10 text-center flex items-center justify-center font-bold text-lg">
                LR
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-neutral-900 font-bold text-lg leading-tight">LR Core</span>
                <span className="text-xs text-neutral-500 font-normal">Voucher Control Program</span>
              </div>{' '}
            </>
          )}
          <button
            className="p-2 rounded-lg hover:bg-neutral-100  text-neutral-500"
            onClick={() => setCollapsed(!collapsed)}
            type="button"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 bg-gradient-to-b from-emerald-50 to-white border-b border-neutral-50">
        <button className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-600 rounded-xl shadow-sm text-white hover:bg-emerald-700 transition-colors">
          <Zap size={16} className="text-white fill-white" />
          <span className="text-white flex-1 text-left text-sm font-medium">Quick Actions</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex-1 px-3 pt-3 overflow-y-auto space-y-1 no-scrollbar">
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

      <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-3 flex-col">
        <div className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-semibold flex items-center justify-center text-lg">
            A
          </div>
          <div className="flex flex-1 ml-2 flex-col">
            <span className="text-sm font-semibold text-neutral-900">{user?.username}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              {user?.roles?.join(', ')}
            </span>
          </div>
          <div>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="space-y-1">
          <button className="flex w-full gap-3 px-3 py-2 items-center text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors text-sm font-medium">
            <Settings size={16} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium" onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
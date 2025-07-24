"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  SolicitudIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons/index";

const storedRoles = typeof window !== 'undefined' ? localStorage.getItem("roles") : null;
const userRoles: string[] = storedRoles ? JSON.parse(storedRoles) : [];

const hasAccess = (roles?: string[]) => {
  if (!roles) return true;
  return roles.some(role => userRoles.includes(role));
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: { name: string; path: string; roles?: string[] }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    roles: ["Admin", "Coordinador"]
  },
  {
    icon: <CalenderIcon />,
    name: "Calendario",
    path: "/calendar",
    roles: ["Admin", "Coordinador", "Secretario"]
  },
  {
    icon: <TaskIcon />,
    name: "Campañas",
    roles: ["Admin", "Periodista"],
    subItems: [
      { name: "WhatsApp Verificado", path:"/what-bot-meta", roles: ["Admin", "Periodista"]},
      { name: "ChatBot WhatsApp", path: "/what-bot", roles: ["Admin"] },
      { name: "WhatsApp Legacy", path: "/what-panel", roles: ["Admin", "Periodista"] },
      { name: "Telegram", path: "/telegram-panel", roles: ["Admin"] },
      { name: "Correos", path: "/what-email", roles: ["Admin"] },
      { name: "SMS", path: "/what-sms", roles: ["Admin"] },
    ],
  },
  {
    name: "Prospectos",
    icon: <ListIcon />,
    roles: ["Admin", "Coordinador"],
    subItems: [
      { name: "Panel Prospectos", path: "/prospect-panel", roles: ["Admin"] },
      { name: "Listar Prospectos", path: "/prospect-listar", roles: ["Admin", "Coordinador"] },
      { name: "Cargar Prospectos", path: "/upload-prospect", roles: ["Admin", "Coordinador"] },
    ],
  },
  {
    name: "Solicitudes",
    icon: <SolicitudIcon />,
    roles: ["Admin", "Secretario","Pasante","Periodista"],
    subItems: [
      { name: "Panel Solicitudes", path: "/solicitud-panel", roles: ["Admin","Secretario","Pasante","Periodista"] },
      { name: "Seguimiento Solicitudes", path: "/solicitud-listar", roles: ["Admin", "Secretario", "Pasante","Periodista"] },
    ],
  },
  {
    name: "Administracion",
    icon: <TableIcon />,
    roles: ["Admin", "Secretario"],
    subItems: [
      { name: "Usuarios", path: "/usuarios", roles: ["Admin"] },
      { name: "Formularios", path: "/formularios", roles: ["Admin", "Secretario"] },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Perfil de Usuario",
    path: "/profile",
    roles: ["Admin", "Coordinador", "Secretario", "Periodista", "Pasante"]
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Soporte",
    path: "/",
    roles: ["Admin"]
  }
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev?.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        hasAccess(nav.roles) && (
          <li key={nav.name}>
            {nav.subItems ? (
              <>
                <button onClick={() => handleSubmenuToggle(index, type)} className={`menu-item group ${openSubmenu?.type === type && openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}>
                  <span className={`${openSubmenu?.type === type && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className={`menu-item-text`}>{nav.name}</span>}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === type && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`} />
                  )}
                </button>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <div ref={(el) => { subMenuRefs.current[`${type}-${index}`] = el; }} className="overflow-hidden transition-all duration-300" style={{ height: openSubmenu?.type === type && openSubmenu?.index === index ? `${subMenuHeight[`${type}-${index}`]}px` : "0px" }}>
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems.filter(sub => hasAccess(sub.roles)).map((sub) => (
                        <li key={sub.name}>
                          <Link href={sub.path} className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>{sub.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              nav.path && (
                <Link href={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                  <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className={`menu-item-text`}>{nav.name}</span>}
                </Link>
              )
            )}
          </li>
        )
      ))}
    </ul>
  );

  useEffect(() => {
    let matched = false;
    ["main", "others"].forEach((type) => {
      const items = type === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        nav.subItems?.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({ type: type as "main" | "others", index });
            matched = true;
          }
        });
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  return (
    
    <aside className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} onMouseEnter={() => !isExpanded && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/logo white.png" alt="Logo" width={150} height={40} />
              <Image className="hidden dark:block" src="/images/logo/logo dark.png" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <Image src="/images/logo/logo-uscate-icon.jpg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Otros" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>

  );
};

export default AppSidebar;

"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard,
  UserPlus,
  Users,
  BookOpen,
  FileText,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  LogOut,
  UserCheck,
  UserMinus,
  UserCog,
  Plus,
  Trash2,
  Edit,
  ClipboardList,
} from "lucide-react";

export default function AdminDashboardLayout({ children }) {
  const [pathname, setPathname] = useState("/dashboard/admin");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const menu = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/admin",
    },
    {
      title: "Student",
      icon: UserPlus,
      children: [
        { name: "Add Student", href: "/dashboard/admin/addStudent", icon: UserCheck },
        { name: "Delete Student", href: "/dashboard/admin/deleteStudent", icon: UserMinus },
        { name: "Update Student", href: "/dashboard/admin/updateStudent", icon: UserCog },
      ],
    },
    {
      title: "Faculty",
      icon: Users,
      children: [
        { name: "Add Faculty", href: "/dashboard/admin/addFaculty", icon: Plus },
        { name: "Delete Faculty", href: "/dashboard/admin/deleteFaculty", icon: Trash2 },
      ],
    },
    {
      title: "Course",
      icon: BookOpen,
      children: [
        { name: "Add Course", href: "/dashboard/admin/addCourse", icon: Plus },
        { name: "Assign Course", href: "/dashboard/admin/assignCourse", icon: ClipboardList },
      ],
    },
    {
      title: "Reports",
      icon: FileText,
      href: "/dashboard/admin/reports",
    },
  ];

  const handleNavigation = (href) => {
    setPathname(href);
    setMobileOpen(false);
  };

  useEffect(() => {
    menu.forEach((m) => {
      if (m.children?.some((sub) => sub.href === pathname)) {
        setOpenMenu(m.title);
      }
    });
  }, [pathname]);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* TOP NAVBAR */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-gray-800">
            Academic Module Tracker
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Kaushik Rajbongshi</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="w-4 h-4 text-gray-500" />
                  Profile
                </a>

                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  Settings
                </a>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                  onClick={() => {
                    setDropdownOpen(false);
                    console.log("Logout clicked");
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR */}
        <aside
          className={`bg-white border-r border-gray-200 h-[calc(100vh-4rem)] fixed lg:sticky top-16 left-0 z-50 transition-all duration-300 ease-in-out ${
            collapsed ? "w-20" : "w-64"
          } ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {!collapsed && (
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Admin Panel
                  </h2>
                )}
                <button
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setCollapsed(!collapsed)}
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* SIDEBAR MENU */}
            <nav className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {menu.map((item) => {
                  const Icon = item.icon;

                  // NORMAL LINK (NO CHILDREN)
                  if (!item.children) {
                    const active = pathname === item.href;

                    return (
                      <a
                        key={item.title}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(item.href);
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                          active
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? item.title : ""}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${
                          active ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-700"
                        }`} />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </a>
                    );
                  }

                  // DROPDOWN MENU
                  const isOpen = openMenu === item.title;
                  const hasActiveChild = item.children?.some((sub) => sub.href === pathname);

                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all group ${
                          hasActiveChild
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-700 hover:bg-gray-50"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? item.title : ""}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${
                          hasActiveChild ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-700"
                        }`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left text-sm">{item.title}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`} />
                          </>
                        )}
                      </button>

                      {/* Submenu */}
                      {!collapsed && (
                        <div
                          className={`transition-all duration-200 ease-in-out ${
                            isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                          } overflow-hidden`}
                        >
                          <div className="pl-11 pr-2 space-y-1">
                            {item.children.map((sub) => {
                              const active = pathname === sub.href;
                              const SubIcon = sub.icon;
                              return (
                                <a
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigation(sub.href);
                                  }}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                                    active
                                      ? "bg-indigo-50 text-indigo-600 font-medium"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  {SubIcon && <SubIcon className="w-4 h-4" />}
                                  {sub.name}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile Toggle Button */}
        <button
          className="fixed top-20 left-4 z-30 lg:hidden bg-indigo-600 text-white p-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 bg-gray-50 p-4 lg:p-8 overflow-y-auto">
          <div className="lg:hidden h-16" />
          {children}
        </main>
      </div>
    </div>
  );
}
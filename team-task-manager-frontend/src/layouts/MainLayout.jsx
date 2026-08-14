import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: CheckSquare,
    },
    {
      name: "Team",
      path: "/team",
      icon: Users,
      adminOnly: true,
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly) {
      return user?.role === "admin";
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white hidden md:flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>

          <span className="text-lg font-bold">Task Manager</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5" />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>

              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut className="w-5 h-5" />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Team Task Manager
          </h1>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>

              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

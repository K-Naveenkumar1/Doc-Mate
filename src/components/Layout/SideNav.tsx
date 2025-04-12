
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ActivityIcon, Calendar, FileText, User, 
  List, Dumbbell, LayoutDashboard, Settings,
  Menu, X, FolderOpen, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";

const SideNav: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/appointments", icon: <Calendar size={20} />, label: "Appointments" },
    { path: "/prescriptions", icon: <FileText size={20} />, label: "Prescriptions" },
    { path: "/files", icon: <FolderOpen size={20} />, label: "Files" },
    { path: "/todos", icon: <List size={20} />, label: "Todo List" },
    { path: "/workouts", icon: <Dumbbell size={20} />, label: "Workouts" },
    { path: "/ai-analysis", icon: <BrainCircuit size={20} />, label: "AI Analysis" },
    { path: "/settings", icon: <Settings size={20} />, label: "Settings" },
    { path: "/profile", icon: <User size={20} />, label: "Profile" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {expanded && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button 
        className="md:hidden fixed bottom-20 left-4 z-50 p-2 rounded-full bg-primary shadow-lg text-primary-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Collapse button for desktop */}
      <button
        className="hidden md:flex fixed bottom-20 left-4 z-50 p-2 rounded-full bg-primary shadow-lg text-primary-foreground"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-16 left-0 bottom-0 z-40 bg-sidebar border-r border-border transition-all duration-300 ease-in-out flex flex-col h-[calc(100vh-4rem)]",
          expanded ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-20" : "w-64 md:w-64"
        )}
      >
        <div className="flex flex-col h-full py-6 overflow-y-auto">
          <nav className="flex-1">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors group",
                      isActive(item.path) 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:text-white hover:bg-sidebar-accent"
                    )}
                    onClick={() => setExpanded(false)}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className={cn(
                      "ml-3 whitespace-nowrap", 
                      collapsed ? "md:hidden" : "md:block"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default SideNav;

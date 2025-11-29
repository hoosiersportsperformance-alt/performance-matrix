import React from "react";
import {
  Home,
  Dumbbell,
  User,
  Bot,
  ClipboardList,
  Layers,
  Activity,
  Calendar,
  FileBarChart,
  Microscope,
} from "lucide-react";
import { TabKey } from "../types";

const PT_RED = "#C63527";

interface SidebarProps {
  currentTab: TabKey;
  onTabChange: (key: TabKey) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpen,
  onClose,
}) => {
  const navItem = (
    key: TabKey,
    label: string,
    icon: React.ReactNode,
    isLast = false
  ) => (
    <button
      onClick={() => {
        onTabChange(key);
        onClose();
      }}
      className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold rounded-xl transition-colors
        ${
          currentTab === key
            ? "bg-red-600 text-white shadow-md"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        } ${isLast ? "mb-8" : ""}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 bg-black border-r border-gray-800 p-6 z-40 transform transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* HEADER BRANDING */}
      <div className="mb-10 select-none leading-tight">
        {/* Line 1 */}
        <h2 className="text-2xl font-extrabold tracking-tight">
          <span style={{ color: "white" }}>Park </span>
          <span style={{ color: PT_RED }}>Tudor</span>
        </h2>

        {/* Line 2 */}
        <h2 className="text-2xl font-extrabold tracking-tight">
          <span style={{ color: PT_RED }}>Performance </span>
          <span style={{ color: "white" }}>Matrix</span>
        </h2>
      </div>

      {/* NAV ITEMS */}
      <nav className="flex flex-col gap-2">
        {navItem("dashboard", "Dashboard", <Home className="w-5 h-5" />)}

        {navItem(
          "profile",
          "My Profile",
          <User className="w-5 h-5" />
        )}

        {navItem(
          "coach",
          "Performance Chat AI",
          <Bot className="w-5 h-5" />
        )}

        {navItem(
          "trainer",
          "Sports Medicine AI",
          <Microscope className="w-5 h-5" />
        )}

        {navItem(
          "compare",
          "Output Leader Boards",
          <Layers className="w-5 h-5" />
        )}

        {navItem(
          "workouts",
          "Panther Workouts",
          <Dumbbell className="w-5 h-5" />
        )}

        {navItem(
          "nutrition",
          "Nutrition Calculator",
          <Activity className="w-5 h-5" />
        )}

        {navItem(
          "library",
          "Exercise Library",
          <ClipboardList className="w-5 h-5" />
        )}

        {navItem(
          "inbody",
          "InBody Scan Results",
          <FileBarChart className="w-5 h-5" />
        )}

        {navItem(
          "schedule",
          "PT Game Center",
          <Calendar className="w-5 h-5" />,
          true
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;






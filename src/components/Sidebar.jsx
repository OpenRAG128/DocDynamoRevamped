import { useState } from "react";
import {
  MessageCircle,
  Folder,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  PlusIcon,
  PencilIcon,
  HatGlassesIcon,
  Youtube,
  GraduationCap,
  Moon,
  Sun,
} from "lucide-react";

export default function Sidebar({ darkMode, toggleDarkMode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen border-r flex flex-col justify-between transition-all duration-200
      ${collapsed ? "w-16" : "w-64"}
      ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
    >
      <div>
        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-2 px-4 py-4">
          {!collapsed && (
            <span
              className={`text-lg font-bold ${darkMode ? "text-purple-400" : "text-purple-600"
                }`}
            >
              DocDynamo
            </span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded transition-colors ${darkMode
              ? "hover:bg-gray-800 text-gray-300"
              : "hover:bg-gray-100 text-gray-700"
              }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>

          {!collapsed && (
            <button
              className={`ml-auto border px-4 py-2 rounded-full text-sm transition-colors ${darkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              +New
            </button>
          )}
        </div>

        {/* ================= COLLAPSED VIEW ================= */}
        {collapsed && (
          <div className="flex flex-col items-center gap-6 mt-10">
            <button
              onClick={() => setCollapsed(false)}
              className={`transition-colors ${darkMode
                ? "text-gray-400 hover:text-purple-400"
                : "text-gray-600 hover:text-purple-600"
                }`}
              aria-label="Chats"
            >
              <MessageCircle size={20} />
            </button>

            <button
              onClick={() => setCollapsed(false)}
              className={`transition-colors ${darkMode
                ? "text-gray-400 hover:text-purple-400"
                : "text-gray-600 hover:text-purple-600"
                }`}
              aria-label="Folders"
            >
              <Folder size={20} />
            </button>

            <button
              onClick={() => setCollapsed(false)}
              className={`transition-colors ${darkMode
                ? "text-gray-400 hover:text-purple-400"
                : "text-gray-600 hover:text-purple-600"
                }`}
              aria-label="Tools"
            >
              <Wrench size={20} />
            </button>
          </div>
        )}

        {/* ================= EXPANDED VIEW ================= */}
        {!collapsed && (
          <>
            {/* Chats */}
            <div className="px-4 mt-4">
              <p
                className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                Chats
              </p>
              <button
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${darkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <PlusIcon size={18} />
                Start your first chat
              </button>
            </div>

            {/* Folders */}
            <div className="px-4 mt-4">
              <p
                className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                Folders
              </p>
              <button
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${darkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <PlusIcon size={18} />
                New folder
              </button>
            </div>

            {/* Tools */}
            {/* <div className="px-4 mt-6">
              <p className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tools</p>

              <button className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
                darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
              }`}>
                <PencilIcon size={18} />
                AI Writer
              </button>

              <button className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
                darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
              }`}>
                <HatGlassesIcon size={18} />
                AI Detector
              </button>

              <button className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
                darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Youtube size={18} />
                YouTube chat
              </button>

              <button className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
                darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
              }`}>
                <GraduationCap size={18} />
                Research
              </button>
            </div> */}
          </>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      {!collapsed && (
        <div
          className={`p-4 space-y-2 border-t ${darkMode ? "border-gray-700" : "border-gray-200"
            }`}
        >
          <button
            className={`block w-full text-center py-2 rounded-full font-medium transition-colors ${darkMode
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
          >
            Sign up
          </button>
        </div>
      )}
    </aside>
  );
}

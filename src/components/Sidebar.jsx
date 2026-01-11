import { useState , useEffect} from "react";
import { AnimatedList } from "./AnimatedList.jsx";
import {
  MessageCircle,
  Folder,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  PlusIcon,
  EyeIcon,
  Lightbulb,
  CircleQuestionMarkIcon,
  Smartphone,
} from "lucide-react";

export default function Sidebar({ darkMode, toggleDarkMode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 9000); // re-animate every 3s

    return () => clearInterval(interval);
  }, []);
  return (
    <aside
      className={`h-screen border-r flex flex-col justify-between transition-all duration-200
      ${collapsed ? "w-16" : "w-64"}
     ${darkMode
  ? "bg-gray-900"
  : "bg-white"}

`}
    >
      <div>
        {/* ================= HEADER ==============
        === */}
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

            {/* Tools */}
            <div className="px-4 mt-6">
              <p className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tools</p>

              <button className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
                darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
              }`}>
                <CircleQuestionMarkIcon size={18} />
                Questions
              </button>

              <button className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
                darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Lightbulb size={18} />
                Concepts
              </button>

              <button className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
                darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
              }`}>
                <EyeIcon size={18} />
                Add-on info
              </button>

              <button className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
                darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Smartphone size={18} />
                Mobile App
              </button>

            </div>
          </>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      {!collapsed && (
        <div
          className={`p-4 space-y-2 border-t ${darkMode ? "border-gray-700" : "border-gray-200"
            }`}
        >
        


    <div
  className="mb-4 overflow-hidden"
>
     <AnimatedList key={cycle} delay={2000} className="space-y-2">
  <div
    className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl border
      ${darkMode
        ? "bg-white/10 border-white/25 text-gray-200"
        : "bg-black/10 border-black/25 text-gray-800"}
    `}
  >
    Know what's better than Static Documents?
  </div>

  <div
  
    className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl font-medium border
      ${darkMode
        ? "bg-white/10 border-white/25 text-purple-300"
        : "bg-black/10 border-black/25 text-purple-700"}
        `}
    
  >
    DocDynamo
  </div>

  <div
    className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl border
      ${darkMode
        ? "bg-white/10 border-white/25 text-gray-300"
        : "bg-black/10 border-black/25 text-gray-700"}
    `}
  >
    Coz it makes them talk
  </div>
</AnimatedList>


    </div>


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

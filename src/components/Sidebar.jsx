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
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen border-r bg-white flex flex-col justify-between transition-all duration-200
      ${collapsed ? "w-16" : "w-64"}`}
    >
      <div>
        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-2 px-4 py-4">
          {!collapsed && (
            <span className="text-lg font-bold text-purple-600">
              DocDynamo
            </span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded hover:bg-gray-100"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>

          {!collapsed && (
            <button className="ml-auto border px-4 py-2 rounded-full text-sm hover:bg-gray-100">
              +New
            </button>
          )}
        </div>

        {/* ================= COLLAPSED VIEW ================= */}
        {collapsed && (
          <div className="flex flex-col items-center gap-6 mt-10">
            <button
              onClick={() => setCollapsed(false)}
              className="hover:text-purple-600"
            >
              <MessageCircle size={20} />
            </button>

            <button
              onClick={() => setCollapsed(false)}
              className="hover:text-purple-600"
            >
              <Folder size={20} />
            </button>

            <button
              onClick={() => setCollapsed(false)}
              className="hover:text-purple-600"
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
              <p className="text-m text-black-400 mb-2">Chats</p>
              <button className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm hover:bg-gray-100">
                <PlusIcon size={18} />
                Start your first chat
              </button>
            </div>

            {/* Folders */}
            <div className="px-4 mt-4">
              <p className="text-m text-black-400 mb-2">Folders</p>
              <button className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm hover:bg-gray-100">
                <PlusIcon size={18} />
                New folder
              </button>
            </div>

            {/* Tools */}
            {/* <div className="px-4 mt-6">
              <p className="text-m text-black-400 mb-2">Tools</p>

              <button className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm hover:bg-gray-100">
                <PencilIcon size={18} />
                AI Writer
              </button>

              <button className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm hover:bg-gray-100">
                <HatGlassesIcon size={18} />
                AI Detector
              </button>

              <button className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm hover:bg-gray-100">
                <Youtube size={18} />
                YouTube chat
              </button>

              <button className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm hover:bg-gray-100">
                <GraduationCap size={18} />
                Research
              </button>
            </div> */}
          </>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      {!collapsed && (
        <div className="p-4">
          <button className="block w-full text-center bg-purple-600 text-white py-2 rounded-full font-medium hover:bg-purple-700">
            Sign up
          </button>
        </div>
      )}
    </aside>
  );
}

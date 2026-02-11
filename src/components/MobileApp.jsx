import React from "react";
import { Smartphone, X } from "lucide-react";
import { FaGooglePlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


export default function MobileApp() {
      const navigate = useNavigate();
      useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "auto";
  };
}, []);
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 flex items-center justify-center px-6 overflow-hidden relative">
     <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200 hover:scale-105"
        >
          <X className="text-grey-800" size={24} />
        </button>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 max-w-2xl w-full text-center">
        

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 p-4 rounded-2xl shadow-lg">
            <Smartphone size={48} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-family-sans font-bold text-white mb-6">
          Download the DocDynamo Mobile App from the Google Play Store!
        </h1>

        {/* Play Store Button */}
        <button
          href="#"
          className="inline-flex items-center gap-3 bg-black hover:bg-gray-900 transition-all duration-300 text-white px-6 py-4 rounded-xl shadow-lg hover:scale-105"
        >
          {/* Play Store SVG */}
          

          <div className="flex items-center  text-lg font-semibold">
            <FaGooglePlay size={18} className="mr-2"/>
            Get it on Google Play
          </div>
        </button>

      </div>
    </div>
  );
}

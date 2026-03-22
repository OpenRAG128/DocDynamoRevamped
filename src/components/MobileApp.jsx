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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
     <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200 hover:scale-105"
        >
          <X className="text-gray-800" size={24} />
        </button>
      <div className="flex gap-4">
      <h1 className="text-4xl md:text-6xl font-family-sans font-extrabold text-gray-900 mb-4 text-purple-600">
        DocDynamo,
      </h1>
      <span className="text-white text-4xl font-family-sans md:text-6xl font-extrabold">On Google Play too.</span>
      </div>
      <p className="text-gray-600 text-lg mb-8 max-w-md">
        Experience the full power of our platform directly from your phone.
      </p>
      
      <div className="flex gap-30">
      <div className="flex flex-col sm:flex-row gap-4 mt-50 ">
        <a href="#" >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
            alt="Download on Google Play" 
            className="h-14"
          />
        </a>
      </div>

      <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl"></div>
        <div className="p-4 pt-10 text-white text-left">
           <div className="w-full h-32 bg-blue-500 rounded-lg mb-4 animate-pulse"></div>
           <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
           <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
    </div>
  );
}
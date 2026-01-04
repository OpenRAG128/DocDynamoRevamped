import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from './components/Sidebar'
import MainSection from './components/MainSection'

const Page = ({ title }) => (
  <div className="p-8 text-xl font-semibold">{title}</div>
);

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <MainSection />
        <div className="flex-1 bg-gray-50">
          {/* <Routes>
            
            <Route path="/chats" element={<Page title="Chats" />} />
            <Route path="/folders" element={<Page title="Folders" />} />
            <Route path="/ai-writer" element={<Page title="AI Writer" />} />
            <Route path="/ai-detector" element={<Page title="AI Detector" />} />
            <Route path="/youtube-chat" element={<Page title="YouTube Chat" />} />
            <Route path="/research" element={<Page title="Research" />} /> 
            <Route path="/signup" element={<Page title="Sign Up" />} />
          </Routes> */}
        </div>
      </div>
    </Router>
  );
}

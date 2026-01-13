import { FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="flex-shrink-0 text-text-400 text-sm mt-auto px-6 py-4 flex flex-col items-center gap-3 bg-background font-body">
      <div className="flex gap-6 text-xl">
        <a href="https://www.instagram.com/open.rag?igsh=MWRvMmpmMDJ0Ym94NA==" target="_blank" className="text-text hover:text-primary transition-colors">
          <FaInstagram />
        </a>
        <a href="https://www.linkedin.com/company/openrag1/posts/?feedView=all" target="_blank" className="text-text hover:text-primary transition-colors">
          <FaLinkedin />
        </a>
        <a href="mailto:openrag189@gmail.com" className="text-text hover:text-primary transition-colors">
          <FaEnvelope />
        </a>
      </div>
      <p className="text-xs text-center text-text">
        Powered by <span className="text-text font-semibold">OpenRAG</span> | © 2024
      </p>
    </footer>
  );
}
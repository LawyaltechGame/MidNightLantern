import { FaBlog, FaCrown, FaHome, FaServicestack, FaProjectDiagram, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

const NavItem = ({ icon: Icon, label, to }: { icon: React.ComponentType<{ className?: string }>; label: string; to: string }) => (
  <motion.span
    whileHover={{ y: -2, textShadow: "0 0 12px rgba(80,200,255,0.9)" }}
    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-200/90 hover:text-cyan-300 transition-colors"
  >
    <Link to={to} className="flex items-center gap-2">
      <Icon className="text-lg" />
      <span className="hidden md:inline">{label}</span>
    </Link>
  </motion.span>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-2 z-40">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <motion.span
              className="flex items-center gap-3 text-xl font-extrabold tracking-wide"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src="/Logo For GameForge.jpeg"
                alt="Midnight Lantern logo"
                className="h-8 w-8 object-cover rounded drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              />
              <Link to="/">
                <span className="uppercase bg-gradient-to-r from-cyan-300 via-amber-300 to-fuchsia-300 bg-clip-text text-transparent tracking-[0.2em] drop-shadow-[0_0_10px_rgba(251,191,36,0.35)]">
                  MIDNIGHT LANTERN
                </span>
              </Link>
            </motion.span>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem icon={FaHome} label="Home" to="/" />
              <NavItem icon={FaProjectDiagram} label="Portfolio" to="/portfolio" />
              <NavItem icon={FaCrown} label="Client Work" to="/clients" />
              <NavItem icon={FaServicestack} label="Services" to="/services" />
              <NavItem icon={FaBlog} label="Blog" to="/blog" />
            </nav>

            {/* Mobile hamburger */}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/15 bg-slate-800/60 p-2 text-slate-200 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden px-3 pb-3"
              >
                <div className="grid gap-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 p-2">
                  <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/60">
                    <FaHome className="text-lg" /> <span>Home</span>
                  </Link>
                  <Link to="/portfolio" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/60">
                    <FaProjectDiagram className="text-lg" /> <span>Portfolio</span>
                  </Link>
                  <Link to="/clients" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/60">
                    <FaCrown className="text-lg" /> <span>Client Work</span>
                  </Link>
                  <Link to="/services" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/60">
                    <FaServicestack className="text-lg" /> <span>Services</span>
                  </Link>
                  <Link to="/blog" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/60">
                    <FaBlog className="text-lg" /> <span>Blog</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Navbar;



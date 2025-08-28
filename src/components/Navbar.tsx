import { FaBlog, FaCrown, FaHome, FaServicestack, FaProjectDiagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NavItem = ({ icon: Icon, label, to }: { icon: any; label: string; to: string }) => (
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

            <nav className="flex items-center gap-1">
              <NavItem icon={FaHome} label="Home" to="/" />
              <NavItem icon={FaProjectDiagram} label="Portfolio" to="/portfolio" />
              <NavItem icon={FaCrown} label="Client Work" to="/clients" />
              <NavItem icon={FaServicestack} label="Services" to="/services" />
              <NavItem icon={FaBlog} label="Blog" to="/blog" />
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;



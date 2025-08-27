import { motion } from "framer-motion";

const StatCard = ({ value, label, hue }: { value: string; label: string; hue: number }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center backdrop-blur-md"
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
  >
    <div className="text-4xl font-extrabold tracking-wider" style={{ color: `hsl(${hue} 90% 60%)` }}>{value}</div>
    <div className="mt-2 text-sm text-slate-300">{label}</div>
  </motion.div>
);

const Stats = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value="50+" label="Games Developed" hue={190} />
        <StatCard value="100M+" label="Players Reached" hue={280} />
        <StatCard value="25+" label="Awards Won" hue={60} />
        <StatCard value="5" label="Years Experience" hue={40} />
      </div>
    </div>
  );
};

export default Stats;



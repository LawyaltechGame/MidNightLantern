
import { Suspense, lazy } from "react";
import AnimatedBackground from "./components/AnimatedBackground";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";

const HomePage = lazy(() => import("./pages/HomePage.tsx"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage.tsx"));
const ClientWorkPage = lazy(() => import("./pages/ClientWorkPage.tsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.tsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.tsx"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage.tsx"));

const App = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0f1a] text-white">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16 text-slate-300">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/clients" element={<ClientWorkPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </div>
  )
}

export default App
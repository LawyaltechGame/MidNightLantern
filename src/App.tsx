
import AnimatedBackground from "./components/AnimatedBackground";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import PortfolioPage from "./pages/PortfolioPage.tsx";
import ClientWorkPage from "./pages/ClientWorkPage.tsx";
import ServicesPage from "./pages/ServicesPage.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import BlogDetailPage from "./pages/BlogDetailPage.tsx";

const App = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0f1a] text-white">
      <AnimatedBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/clients" element={<ClientWorkPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
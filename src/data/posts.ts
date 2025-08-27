export type Category = "News" | "Articles" | "Blogs" | "Event Coverage";

export type BlogPost = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  content: string[];
  category: Category;
  accent: string; // tailwind gradient classes
  iconEmoji: string;
  imageUrl: string;
};

export const POSTS: BlogPost[] = [
  {
    id: "1",
    date: "December 15, 2024",
    title: "Next-Gen Gaming Engines Revolutionize Development",
    excerpt:
      "The latest gaming engines introduce groundbreaking features changing how developers craft immersive experiences...",
    content: [
      "Modern engines are rethinking the rendering pipeline with hardware-accelerated ray tracing and smarter scene management.",
      "Tooling improvements shorten iteration time with live reloading, deterministic networking sandboxes, and AI-assisted asset workflows.",
      "Studios adopting these engines report faster prototyping and higher visual ceilings across platforms.",
    ],
    category: "News",
    accent: "from-cyan-400 to-blue-600",
    iconEmoji: "🎮",
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "2",
    date: "December 12, 2024",
    title: "VR Gaming Market Reaches New Heights",
    excerpt:
      "Virtual reality continues to grow exponentially with hardware and software innovations driving adoption...",
    content: [
      "Inside-out tracking and lightweight optics are transforming comfort and presence for mainstream audiences.",
      "Developers focus on natural interactions, haptics, and social presence to sustain engagement.",
      "Cross-play and cloud rendering are opening new genres and formats for VR-first design.",
    ],
    category: "Articles",
    accent: "from-fuchsia-400 to-pink-500",
    iconEmoji: "🚀",
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "3",
    date: "December 10, 2024",
    title: "Cloud Gaming Transforms Industry Landscape",
    excerpt:
      "Major tech companies invest heavily in cloud gaming infrastructure, promising seamless experiences...",
    content: [
      "Latency compensation, edge compute, and adaptive encoding reduce input delay and artifacts.",
      "Subscription models and instant play blur discovery and ownership in interesting ways.",
      "Studios can target broader audiences without heavy device constraints.",
    ],
    category: "News",
    accent: "from-emerald-400 to-teal-500",
    iconEmoji: "🌐",
    imageUrl:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&q=80",
  },
];

export const findPostById = (id: string) => POSTS.find((p) => p.id === id);



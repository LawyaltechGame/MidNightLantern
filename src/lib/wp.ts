export const WP_BASE = "https://test.lawyaltech.org";

export type WpMedia = { source_url?: string; alt_text?: string };
export type WpAuthor = {
  id: number;
  name: string;
  description?: string;
  url?: string;
  slug: string;
  avatar_urls?: { [key: string]: string };
};
export type WpPost = {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    ["wp:featuredmedia"]?: WpMedia[];
    author?: WpAuthor[];
  };
};

const FALLBACK_THUMB = "https://firstsiteguide.com/wp-content/uploads/2021/06/best-gaming-blogs.png";

export function getFeaturedImage(p: WpPost): { src: string; alt: string } {
  const media = p?._embedded?.["wp:featuredmedia"]?.[0];
  let src = media?.source_url || "";
  const alt = media?.alt_text || p?.title?.rendered || "Featured image";

  if (!src) {
    // Fallback: find first image in content HTML
    const html = p?.content?.rendered || "";
    const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (match && match[1]) {
      src = match[1];
    }
  }

  if (!src) {
    src = FALLBACK_THUMB;
  }

  return { src, alt };
}

export async function fetchPosts({ page = 1, perPage = 6 }: { page?: number; perPage?: number }): Promise<{ posts: WpPost[]; totalPages: number }> {
  const url = `${WP_BASE}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed=1`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status}`);
  }
  const totalPagesHeader = res.headers.get("X-WP-TotalPages");
  const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
  const posts = (await res.json()) as WpPost[];
  return { posts, totalPages };
}

export async function fetchPostBySlug(slug: string): Promise<WpPost | null> {
  const url = `${WP_BASE}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch post by slug: ${res.status}`);
  }
  const arr = (await res.json()) as WpPost[];
  return arr[0] || null;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

// Fetch full author object by id. Useful when _embed author lacks description
export async function fetchAuthorById(authorId: number, authorSlug?: string): Promise<WpAuthor | null> {
  if (!authorId && authorId !== 0) return null;
  // Try direct users endpoint first
  try {
    const byIdUrl = `${WP_BASE}/wp-json/wp/v2/users/${authorId}?_fields=id,name,description,slug,avatar_urls`;
    const res = await fetch(byIdUrl);
    if (res.ok) {
      const author = (await res.json()) as WpAuthor;
      return author || null;
    }
  } catch (_) {}
  // Fallback: some sites block /users/{id}. Try query by slug
  if (authorSlug) {
    try {
      const bySlugUrl = `${WP_BASE}/wp-json/wp/v2/users?slug=${encodeURIComponent(authorSlug)}&_fields=id,name,description,slug,avatar_urls`;
      const res2 = await fetch(bySlugUrl);
      if (res2.ok) {
        const arr = (await res2.json()) as WpAuthor[];
        return arr?.[0] || null;
      }
    } catch (_) {}
  }
  return null;
}



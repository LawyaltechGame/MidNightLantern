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
    // Prefer non-blob http(s) or site-relative urls
    const imgTag = html.match(/<img[^>]*>/i)?.[0] || "";
    const candidates: string[] = [];
    const pushAttr = (attr: string) => {
      const m = imgTag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
      if (m && m[1]) candidates.push(m[1]);
    };
    pushAttr("data-orig-file");
    pushAttr("data-large-file");
    pushAttr("data-src");
    pushAttr("data-lazy-src");
    pushAttr("src");
    src = candidates.find((u) => u && !u.startsWith("blob:")) || "";
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

// Normalize WP HTML so inline images render correctly in React without WP's JS
// - Promote data-src/data-lazy-src to src
// - Convert protocol-relative URLs (//example.com) to https
// - Ensure site-relative URLs (/wp-content/...) are absolute
export function normalizeWpHtml(html: string): string {
  if (!html) return html;

  let out = html;

  // Replace any <img> that has a blob: src with a better candidate from data attributes
  out = out.replace(/<img([^>]*)>/gi, (full, attrs) => {
    const getAttr = (name: string) => {
      const m = String(attrs).match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
      return m ? m[1] : "";
    };
    const hasBlobSrc = /^blob:/i.test(getAttr("src"));
    if (!hasBlobSrc) return full;
    const candidates = [
      getAttr("data-orig-file"),
      getAttr("data-large-file"),
      getAttr("data-src"),
      getAttr("data-lazy-src"),
      getAttr("srcset")?.split(/[,\s]+/)[0] || ""
    ].filter(Boolean) as string[];
    const replacement = candidates.find((u) => u && !/^blob:/i.test(u)) || "";
    if (!replacement) return full.replace(/\ssrc=["'][^"']+["']/i, "");
    return `<img${String(attrs).replace(/\ssrc=["'][^"']+["']/i, "")} src="${replacement}">`;
  });

  // Promote common lazy-load attributes to src
  // data-src, data-lazy-src, data-original
  out = out.replace(/<img([^>]*?)\s(?:data-src|data-lazy-src|data-original)=["']([^"']+)["']([^>]*)>/gi, (_m, pre, url, post) => {
    // If an existing src exists later in the tag, remove it to avoid duplicates
    const cleanedPre = String(pre).replace(/\s(src)=["'][^"']+["']/i, " ");
    const cleanedPost = String(post).replace(/\s(src)=["'][^"']+["']/i, " ");
    return `<img${cleanedPre} src="${url}"${cleanedPost}>`;
  });

  // Remove blob: entries inside srcset
  out = out.replace(/\ssrcset=["']([^"']+)["']/gi, (_m, list) => {
    const filtered = String(list)
      .split(",")
      .map((s) => s.trim())
      .filter((entry) => entry && !/^blob:/i.test(entry))
      .join(", ");
    return filtered ? ` srcset="${filtered}"` : "";
  });

  // Ensure protocol-relative URLs use https
  out = out.replace(/\s(src|href)=["']\/\/([^"']+)["']/gi, (_m, attr, rest) => ` ${attr}="https://${rest}"`);

  // Ensure site-relative URLs are absolute against WP_BASE
  // Matches src="/wp-content/..." or href="/wp-content/..."
  const wpBase = WP_BASE.replace(/\/$/, "");
  out = out.replace(/\s(src|href)=["'](\/wp-content\/[^"']+)["']/gi, (_m, attr, path) => ` ${attr}="${wpBase}${path}"`);

  return out;
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



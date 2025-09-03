import { API_BASE_URL } from "./apiConfig.js";

// Fetch blogs (paginated, sortable, searchable)
export async function fetchBlogs({ page = 0, size = 6, sort = "publishedAt,desc", query = "" }) {
  let url = query
    ? `${API_BASE_URL}/public-blogs/public/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=${sort}`
    : `${API_BASE_URL}/public-blogs/public?page=${page}&size=${size}&sort=${sort}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch blogs: ${res.status}`);
  return res.json();
}

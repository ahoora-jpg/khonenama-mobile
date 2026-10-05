export function apiEndpoint(base: string, path: string) {
  const server = new URL(base);
  if (server.protocol !== "https:" || server.username || server.password || server.search || server.hash || server.pathname !== "/") throw new Error("INVALID_API_SERVER");
  if (!path.startsWith("/api/") || path.includes("\\")) throw new Error("INVALID_API_PATH");
  const endpoint = new URL(path, server);
  if (endpoint.origin !== server.origin || !endpoint.pathname.startsWith("/api/")) throw new Error("INVALID_API_PATH");
  return endpoint.href;
}

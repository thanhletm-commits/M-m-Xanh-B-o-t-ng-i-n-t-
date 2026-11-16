export const isStaticPages = import.meta.env.MODE === 'pages';

export const siteHome = isStaticPages ? import.meta.env.BASE_URL : '/';
export const adminPath = siteHome + 'admin';

export function publicAsset(path: string): string {
  return path.startsWith('/assets/') ? import.meta.env.BASE_URL + path.slice(1) : path;
}

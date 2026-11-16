export const isStaticPages = import.meta.env.MODE === 'pages';

export function publicAsset(path: string): string {
  return path.startsWith('/assets/') ? import.meta.env.BASE_URL + path.slice(1) : path;
}

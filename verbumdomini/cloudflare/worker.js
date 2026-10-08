/* verbumdomini.ca: Cloudflare serves the files in _site_en/ directly. This runs only for requests
   that match no file: "/" and folder paths get their index.html, and an address without ".html"
   (as GitHub Pages also accepted) is sent to the .html page. Anything else gets 404.html.
   The 404 page is sent from here, not by Cloudflare's not_found_handling, because with that
   setting a browser's page request that matches no file never reaches this script.
   /api/contact (the contact form) is handled in contact.js. */
import { contact } from './contact.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/api/contact') return contact(request, env);
    if (path.endsWith('/')) {
      const index = await env.ASSETS.fetch(new URL(path + 'index.html', url));
      if (index.ok) return index;
    } else if (!path.slice(path.lastIndexOf('/') + 1).includes('.')) {
      const page = await env.ASSETS.fetch(new URL(path + '.html', url), { method: 'HEAD' });
      if (page.ok) return Response.redirect(new URL(path + '.html' + url.search, url), 301);
    }
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;
    const notFound = await env.ASSETS.fetch(new URL('/404.html', url));
    return new Response(notFound.body, { status: 404, headers: notFound.headers });
  }
};

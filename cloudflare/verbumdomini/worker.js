/* verbumdomini.ca: Cloudflare serves the files in _site_en/ directly. This runs only for requests
   that match no file: "/" and folder paths get their index.html, and an address without ".html"
   (as GitHub Pages also accepted) is sent to the .html page. Anything else gets 404.html. */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path.endsWith('/')) {
      const index = await env.ASSETS.fetch(new URL(path + 'index.html', url));
      if (index.ok) return index;
    } else if (!path.slice(path.lastIndexOf('/') + 1).includes('.')) {
      const page = await env.ASSETS.fetch(new URL(path + '.html', url), { method: 'HEAD' });
      if (page.ok) return Response.redirect(new URL(path + '.html' + url.search, url), 301);
    }
    return env.ASSETS.fetch(request);
  }
};

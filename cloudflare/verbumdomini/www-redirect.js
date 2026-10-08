/* www.verbumdomini.ca: sends every request to the same address on verbumdomini.ca. */
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'verbumdomini.ca';
    url.protocol = 'https:';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  }
};

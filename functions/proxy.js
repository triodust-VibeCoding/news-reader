// Cloudflare Pages Function — RSS Proxy
export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    });
  }

  const target = url.searchParams.get('url');
  if (!target) return new Response('Missing ?url=', { status: 400 });

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClarityRSSReader/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      cf: { cacheTtl: 300 }
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'text/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      }
    });
  } catch (err) {
    return new Response('Fetch failed: ' + err.message, { status: 502 });
  }
}

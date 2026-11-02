import type { APIRoute } from 'astro';
import { ADSENSE_CLIENT } from '../data/site';

// ads.txt wordt alleen gevuld als PUBLIC_ADSENSE_CLIENT bekend is.
// Let op: ads.txt moet in de root van het domein staan. Op een GitHub-projectsite (/repo/) werkt dat pas met een eigen domein.
export const GET: APIRoute = () => {
  const pub = ADSENSE_CLIENT.replace(/^ca-/, '');
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '# Nog geen AdSense publisher-ID ingesteld (PUBLIC_ADSENSE_CLIENT)\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

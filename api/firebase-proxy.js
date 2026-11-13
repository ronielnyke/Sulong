// Serves Firebase sign-in helper files from your own domain, so the Google sign-in window shows your domain.
const fs = require('fs');
const path = require('path');

function projectId() {
  if (process.env.FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID;
  const text = fs.readFileSync(path.join(process.cwd(), 'js', 'firebase-config.js'), 'utf8');
  const match = text.match(/projectId\s*:\s*["']([^"']+)["']/);
  return match ? match[1] : '';
}

module.exports = async (req, res) => {
  try {
    const id = projectId();
    if (!id || /PASTE/i.test(id)) {
      res.statusCode = 500;
      return res.end('Firebase project is not configured.');
    }
    const url = new URL(req.url, 'http://localhost');
    const target = url.searchParams.get('p') || '';
    if (target.indexOf('__/auth/') !== 0 && target !== '__/firebase/init.json') {
      res.statusCode = 404;
      return res.end('Not found');
    }
    url.searchParams.delete('p');
    const query = url.searchParams.toString();
    const upstream = await fetch('https://' + id + '.firebaseapp.com/' + target + (query ? '?' + query : ''), { method: 'GET', redirect: 'follow' });
    const body = Buffer.from(await upstream.arrayBuffer());
    res.statusCode = upstream.status;
    const type = upstream.headers.get('content-type');
    if (type) res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(body);
  } catch (e) {
    res.statusCode = 502;
    res.end('Proxy error');
  }
};

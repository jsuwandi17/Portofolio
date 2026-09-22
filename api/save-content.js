export default async function handler(req, res) {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const filePath = process.env.GITHUB_FILE_PATH || 'data/content.json';

    // Jika env vars belum diatur di Vercel Dashboard
    if (!token || !owner || !repo) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'GitHub integration env variables not set on Vercel.'
      });
    }

    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Vercel-Serverless-Function'
    };

    let sha;
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    const base64Content = Buffer.from(bodyData).toString('base64');

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'chore: update content.json via Admin Dashboard',
        content: base64Content,
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return res.status(500).json({ success: false, error: `GitHub API error: ${errText}` });
    }

    return res.status(200).json({
      success: true,
      message: 'Saved to GitHub! Website akan ter-update otomatis dalam ~1 menit.'
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
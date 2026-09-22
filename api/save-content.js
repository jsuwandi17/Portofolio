export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const filePath = process.env.GITHUB_FILE_PATH || 'data/content.json';

  if (!token || !owner || !repo) {
    return res.status(200).json({
      success: false,
      fallback: true,
      message: 'GitHub integration not configured on server environment variables.'
    });
  }

  try {
    const newContent = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Vercel-Serverless-Admin'
    };

    let sha = undefined;
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    // Menggunakan Buffer secara aman
    const base64Content = Buffer.from(newContent, 'utf-8').toString('base64');

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'chore: update content via Admin Dashboard',
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
      message: 'Saved to GitHub! Situs akan ter-update otomatis dalam ~1 menit.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
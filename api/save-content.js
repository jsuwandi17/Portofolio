/**
 * /api/save-content.js — Vercel Serverless Function
 * Menerima POST JSON dari Admin Dashboard, lalu commit ke GitHub repo
 * sehingga Vercel auto-deploy dan situs ter-update otomatis.
 *
 * Env vars (Vercel Dashboard → Settings → Environment Variables):
 *   GITHUB_TOKEN  : Personal Access Token dengan akses Contents: Read & Write
 *   GITHUB_OWNER  : username GitHub (mis. jsuwandi17)
 *   GITHUB_REPO   : nama repo (mis. Portfolio)
 *   GITHUB_BRANCH : (opsional, default "main")
 *   GITHUB_FILE_PATH : (opsional, default "data/content.json")
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const filePath = process.env.GITHUB_FILE_PATH || 'data/content.json';

  // Kalau GitHub belum dikonfigurasi → bilang ke client utk fallback localStorage
  if (!token || !owner || !repo) {
    res.status(200).json({
      success: false,
      fallback: true,
      message: 'GitHub integration not configured on server.'
    });
    return;
  }

  try {
    const newContent = JSON.stringify(req.body, null, 2);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // Ambil SHA file yang ada (wajib utk update file existing)
    let sha = undefined;
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    // Commit file baru
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'chore: update content.json via Admin Dashboard',
        content: Buffer.from(newContent, 'utf8').toString('base64'),
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      res.status(500).json({ success: false, error: `GitHub API error: ${errText}` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Saved to GitHub! Situs akan ter-update otomatis dalam ~1 menit (Vercel re-deploy).'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Vercel Serverless — Gmail API Proxy
// Gère OAuth2, envoi d'emails, lecture inbox, suivi des réponses

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${req.headers.origin || 'http://localhost:3000'}/api/gmail?action=callback`;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'Gmail OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });
  }

  try {
    const { action, code, refreshToken, to, subject, body, htmlBody, threadId, query, maxResults } = req.body;

    // ─── AUTH URL ─────────────────────────────────────────────────────────
    if (action === 'auth_url') {
      const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
      ];
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}` +
        `&access_type=offline&prompt=consent`;
      return res.status(200).json({ authUrl });
    }

    // ─── TOKEN EXCHANGE ──────────────────────────────────────────────────
    if (action === 'exchange_token' || action === 'callback') {
      if (!code) return res.status(400).json({ error: 'No authorization code' });
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (tokens.error) return res.status(400).json(tokens);
      return res.status(200).json({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      });
    }

    // ─── REFRESH TOKEN ───────────────────────────────────────────────────
    if (action === 'refresh') {
      if (!refreshToken) return res.status(400).json({ error: 'No refresh token' });
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token',
        }),
      });
      const tokens = await tokenRes.json();
      if (tokens.error) return res.status(400).json(tokens);
      return res.status(200).json({
        accessToken: tokens.access_token,
        expiresIn: tokens.expires_in,
      });
    }

    // Helper: get valid access token
    async function getAccessToken() {
      if (!refreshToken) throw new Error('No refresh token. Please connect Gmail first.');
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token',
        }),
      });
      const tokens = await tokenRes.json();
      if (tokens.error) throw new Error(tokens.error_description || tokens.error);
      return tokens.access_token;
    }

    // ─── SEND EMAIL ──────────────────────────────────────────────────────
    if (action === 'send') {
      const accessToken = await getAccessToken();
      const headers_part = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
      ];
      if (threadId) headers_part.push(`In-Reply-To: ${threadId}`);

      const email = headers_part.join('\r\n') + '\r\n\r\n' + (htmlBody || body || '');
      const raw = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw, threadId: threadId || undefined }),
      });
      const sendData = await sendRes.json();
      if (sendData.error) return res.status(400).json(sendData);
      return res.status(200).json({ success: true, messageId: sendData.id, threadId: sendData.threadId });
    }

    // ─── LIST EMAILS / CHECK REPLIES ─────────────────────────────────────
    if (action === 'list') {
      const accessToken = await getAccessToken();
      const params = new URLSearchParams({
        q: query || 'is:inbox',
        maxResults: (maxResults || 20).toString(),
      });
      const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const listData = await listRes.json();
      if (listData.error) return res.status(400).json(listData);

      // Fetch message details
      const messages = [];
      for (const msg of (listData.messages || []).slice(0, 10)) {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        messages.push({
          id: msgData.id,
          threadId: msgData.threadId,
          from: headers.find(h => h.name === 'From')?.value || '',
          subject: headers.find(h => h.name === 'Subject')?.value || '',
          date: headers.find(h => h.name === 'Date')?.value || '',
          snippet: msgData.snippet || '',
          labelIds: msgData.labelIds || [],
        });
      }
      return res.status(200).json({ messages, total: listData.resultSizeEstimate || 0 });
    }

    // ─── GET USER PROFILE ────────────────────────────────────────────────
    if (action === 'profile') {
      const accessToken = await getAccessToken();
      const profRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const profData = await profRes.json();
      return res.status(200).json(profData);
    }

    return res.status(400).json({ error: 'Unknown action. Use: auth_url, exchange_token, refresh, send, list, profile' });
  } catch (error) {
    console.error('Gmail proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

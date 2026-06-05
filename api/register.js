export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    const response = await fetch('https://tychique-qr-api.infinityfreeapp.com/api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });
    
    const text = await response.text();
    const data = JSON.parse(text);
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
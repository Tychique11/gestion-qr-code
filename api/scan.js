import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) return res.status(400).send("Code manquant.");

  const { data: qr, error } = await supabase
    .from('qr_code')
    .select('id_qrcode, lien_destination, limite_scans, nb_scans_actuel')
    .eq('code_unique', code)
    .single();

  if (error || !qr) return res.status(404).send("QR Code introuvable.");

  if (qr.nb_scans_actuel >= qr.limite_scans) {
    return res.status(403).send("Ce QR Code a atteint sa limite de scans.");
  }

  const adresse_ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const user_agent = req.headers['user-agent'] || 'Inconnu';

  // Géolocalisation
  let ville = '', region = '', pays = '';
  try {
    const geo = await fetch(`http://ip-api.com/json/${adresse_ip}?fields=status,country,regionName,city&lang=fr`);
    const geoData = await geo.json();
    if (geoData.status !== 'fail') {
      ville = geoData.city || '';
      region = geoData.regionName || '';
      pays = geoData.country || '';
    }
  } catch (e) {}

  await supabase.from('scan_history').insert([{
    id_qrcode: qr.id_qrcode,
    adresse_ip,
    user_agent,
    ville,
    zone_geographique: region,
    pays
  }]);

  await supabase
    .from('qr_code')
    .update({ nb_scans_actuel: qr.nb_scans_actuel + 1 })
    .eq('id_qrcode', qr.id_qrcode);

  return res.redirect(qr.lien_destination);
}
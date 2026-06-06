import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
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

  const adresse_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  await supabase.from('scan_history').insert([{
    id_qrcode: qr.id_qrcode,
    adresse_ip
  }]);

  await supabase
    .from('qr_code')
    .update({ nb_scans_actuel: qr.nb_scans_actuel + 1 })
    .eq('id_qrcode', qr.id_qrcode);

  return res.redirect(qr.lien_destination);
}
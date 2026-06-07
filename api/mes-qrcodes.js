import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id_user } = req.query;

  if (!id_user) {
    return res.status(400).json({ success: false, message: "Utilisateur non identifié." });
  }

  const { data: qrcodes, error } = await supabase
    .from('qr_code')
    .select(`
      id_qrcode,
      code_unique,
      lien_destination,
      limite_scans,
      nb_scans_actuel,
      created_at,
      scan_history (
        id_scan,
        adresse_ip,
        user_agent,
        date_scan
      )
    `)
    .eq('id_user', id_user)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.status(200).json({ success: true, qrcodes });
}
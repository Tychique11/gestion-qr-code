import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id_user, lien_destination, limite_scans } = req.body;

  if (!id_user || !lien_destination) {
    return res.status(400).json({ success: false, message: "Utilisateur non identifié ou lien manquant." });
  }

  const code_unique = Math.random().toString(36).substring(2, 10);

  const { data, error } = await supabase
    .from('qr_code')
    .insert([{
      id_user,
      code_unique,
      lien_destination,
      limite_scans: limite_scans || 100
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: "Erreur de génération." });
  }

  const url_suivi = `https://gestion-qr-code.vercel.app/api/scan?code=${code_unique}`;

  return res.status(200).json({
    success: true,
    code_unique,
    url_suivi
  });
}
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { persistSession: false },
    db: { schema: 'public' }
  }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
    }

    const { data: existing, error: selectError } = await supabase
      .from('utilisateurs')
      .select('id_user')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      return res.status(500).json({ success: false, message: "Erreur BDD: " + selectError.message });
    }

    if (existing) {
      return res.status(409).json({ success: false, message: "Cet email est déjà utilisé." });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error: insertError } = await supabase
      .from('utilisateurs')
      .insert([{ email, password: hash }])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ success: false, message: "Erreur insertion: " + insertError.message });
    }

    return res.status(201).json({ success: true, message: "Inscription réussie.", id_user: data.id_user });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur: " + err.message });
  }
}
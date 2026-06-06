import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
  }

  const { data: user } = await supabase
    .from('utilisateurs')
    .select('id_user, email, password')
    .eq('email', email)
    .single();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Identifiants incorrects." });
  }

  return res.status(200).json({
    success: true,
    message: "Connexion réussie.",
    user: { id_user: user.id_user, email: user.email }
  });
}
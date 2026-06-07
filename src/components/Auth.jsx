import { useState } from 'react';
import './Auth.css';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Chargement...');

    const endpoint = isLogin ? 'login.php' : 'register.php';
    const url = `/api/${endpoint.replace('.php', '')}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        throw new Error("Le serveur a renvoyé du HTML au lieu de JSON : " + textResponse.substring(0, 100));
      }

      if (data.success) {
        setMessage(data.message);
        if (isLogin) {
          localStorage.setItem('id_user', data.user.id_user);
          onLoginSuccess();
        } else {
          setIsLogin(true);
          setPassword('');
        }
      } else {
        setMessage(data.message || "Erreur inconnue");
      }
    } catch (erreur) {
      console.error("Erreur complète :", erreur);
      setMessage("Erreur : " + erreur.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>

        {message && <div className="auth-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Ex: nom@domaine.com"
            />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-auth">
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Inscrivez-vous ici" : "Connectez-vous ici"}
          </span>
        </p>
      </div>
    </div>
  );
}
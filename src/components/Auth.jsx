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

  const handleGoogleAuth = () => {
    console.log("En attente de la configuration Google");
  };

  return (
    <div className="auth-container">
      <div className="auth-card liquid-glass">
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

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <button type="button" className="btn-google" onClick={handleGoogleAuth}>
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

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
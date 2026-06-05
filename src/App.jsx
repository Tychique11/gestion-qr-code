import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('id_user'));
  const [url, setUrl] = useState('https://www.google.com');
  const [fgColor, setFgColor] = useState('#0a0a0a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [taille, setTaille] = useState(250);
  const [typeContenu, setTypeContenu] = useState('url');
  const [limiteScans, setLimiteScans] = useState(100);

  const qrRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('id_user');
    setIsLoggedIn(false);
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = bgColor; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Mon_QRCode.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon QR Code',
          text: 'Scannez ce QR Code pour accéder au lien !',
          url: url,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Lien du QR Code copié dans le presse-papier !");
    }
  };

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Générateur de QR Code Pro</h1>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </header>

      <main className="main-content liquid-glass">
        
        <section className="form-section">
          <h2>Personnalisation</h2>
          
          <div className="input-group">
            <label>Lien ou texte du QR Code</label>
            <input 
              type="text" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://exemple.com"
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Couleur du QR</label>
              <input 
                type="color" 
                value={fgColor} 
                onChange={(e) => setFgColor(e.target.value)} 
              />
            </div>

            <div className="input-group">
              <label>Couleur de fond</label>
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)} 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Taille (pixels) : {taille}px</label>
            <input 
              type="range" 
              min="150" 
              max="400" 
              value={taille} 
              onChange={(e) => setTaille(Number(e.target.value))} 
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Type de contenu</label>
              <select value={typeContenu} onChange={(e) => setTypeContenu(e.target.value)}>
                <option value="url">Lien Web (URL)</option>
                <option value="texte">Texte simple</option>
              </select>
            </div>

            <div className="input-group">
              <label>Limite de scans</label>
              <input 
                type="number" 
                value={limiteScans} 
                onChange={(e) => setLimiteScans(Number(e.target.value))} 
                min="1"
              />
            </div>
          </div>
        </section>

        <section className="preview-section">
          <h2>Aperçu</h2>
          
          <div className="qr-box" style={{ backgroundColor: bgColor }} ref={qrRef}>
            <QRCodeSVG 
              value={url} 
              size={taille} 
              bgColor={bgColor} 
              fgColor={fgColor} 
              level="M" 
              includeMargin={true}
            />
          </div>

          <div className="action-buttons">
            <button onClick={handleDownload} className="icon-btn" title="Enregistrer comme image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>

            <button onClick={handleShare} className="icon-btn" title="Partager">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
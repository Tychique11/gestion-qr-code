import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './MesQRCodes.css';

export default function MesQRCodes({ onRetour }) {
  const [qrcodes, setQrcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const id_user = localStorage.getItem('id_user');
    fetch(`/api/mes-qrcodes?id_user=${id_user}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setQrcodes(data.qrcodes);
        else setErreur(data.message);
        setLoading(false);
      })
      .catch(() => {
        setErreur("Erreur de connexion.");
        setLoading(false);
      });
  }, []);

  const formatDate = (d) => new Date(d).toLocaleString('fr-FR');

  const parseUA = (ua) => {
    if (!ua || ua === 'Inconnu') return 'Inconnu';
    if (ua.includes('iPhone')) return '📱 iPhone';
    if (ua.includes('Android')) return '📱 Android';
    if (ua.includes('iPad')) return '📱 iPad';
    if (ua.includes('Windows')) return '💻 Windows';
    if (ua.includes('Mac')) return '💻 Mac';
    if (ua.includes('Linux')) return '🖥️ Linux';
    return '🌐 Autre';
  };

  if (loading) return <div className="mes-qr-loading">Chargement...</div>;

  return (
    <div className="mes-qr-container">
      <div className="mes-qr-header">
        <button onClick={onRetour} className="retour-btn">← Retour</button>
        <h1>Mes QR Codes</h1>
        <span className="qr-count">{qrcodes.length} QR Code{qrcodes.length > 1 ? 's' : ''}</span>
      </div>

      {erreur && <div className="mes-qr-erreur">{erreur}</div>}

      {qrcodes.length === 0 && !erreur && (
        <div className="mes-qr-vide">Vous n'avez pas encore créé de QR Code.</div>
      )}

      <div className="qr-liste">
        {qrcodes.map((qr) => (
          <div key={qr.id_qrcode} className="qr-card">
            <div className="qr-card-header">
              <div className="qr-apercu">
                <QRCodeSVG
                  value={`https://gestion-qr-code.vercel.app/api/scan?code=${qr.code_unique}`}
                  size={80}
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                  level="M"
                />
              </div>
              <div className="qr-infos">
                <div className="qr-lien">{qr.lien_destination}</div>
                <div className="qr-meta">
                  <span className="badge">🔗 Code : {qr.code_unique}</span>
                  <span className="badge">📅 {formatDate(qr.created_at)}</span>
                  <span className={`badge ${qr.nb_scans_actuel >= qr.limite_scans ? 'badge-red' : 'badge-green'}`}>
                    📊 {qr.nb_scans_actuel} / {qr.limite_scans} scans
                  </span>
                </div>
              </div>
              <button
                className="toggle-btn"
                onClick={() => setExpanded(expanded === qr.id_qrcode ? null : qr.id_qrcode)}
              >
                {expanded === qr.id_qrcode ? '▲ Masquer' : '▼ Voir scans'}
              </button>
            </div>

            {expanded === qr.id_qrcode && (
              <div className="scan-table-wrapper">
                <h3>Historique des scans ({qr.scan_history?.length || 0})</h3>
                {!qr.scan_history || qr.scan_history.length === 0 ? (
                  <p className="no-scan">Aucun scan enregistré pour ce QR Code.</p>
                ) : (
                  <table className="scan-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Adresse IP</th>
                        <th>Appareil</th>
                        <th>Ville</th>
                        <th>Région</th>
                        <th>Pays</th>
                        <th>Date du scan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qr.scan_history.map((scan, i) => (
                        <tr key={scan.id_scan}>
                          <td>{i + 1}</td>
                          <td>{scan.adresse_ip || 'Inconnue'}</td>
                          <td>{parseUA(scan.user_agent)}</td>
                          <td>{scan.ville || '-'}</td>
                          <td>{scan.zone_geographique || '-'}</td>
                          <td>{scan.pays || '-'}</td>
                          <td>{formatDate(scan.date_scan)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
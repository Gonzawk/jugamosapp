import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import { legalApi, type LegalDocument } from './api';

type LegalType = 'TERMS' | 'PRIVACY';

// Intentionally no dangerouslySetInnerHTML: user-supplied Markdown is rendered as text.
function Inline({ text }: { text: string }) {
  const pieces = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g);
  return <>{pieces.map((piece, i) => {
    if (piece.startsWith('**') && piece.endsWith('**')) return <strong key={i}>{piece.slice(2, -2)}</strong>;
    if (/^https?:\/\//.test(piece)) return <a key={i} href={piece} target="_blank" rel="noopener noreferrer">{piece}</a>;
    return <React.Fragment key={i}>{piece}</React.Fragment>;
  })}</>;
}

function LegalText({ content }: { content: string }) {
  const blocks = content.replace(/\r\n/g, '\n').trim().split(/\n\s*\n/);
  return <div className="legalDocument">{blocks.map((block, i) => {
    const text = block.trim();
    const heading = /^(#{1,3})\s+(.+)$/.exec(text);
    if (heading) {
      if (heading[1].length === 1) return <h2 key={i}><Inline text={heading[2]} /></h2>;
      return <h3 key={i}><Inline text={heading[2]} /></h3>;
    }
    const lines = text.split('\n');
    if (lines.every(line => /^[-*]\s+/.test(line))) return <ul key={i}>{lines.map((line, j) => <li key={j}><Inline text={line.replace(/^[-*]\s+/, '')} /></li>)}</ul>;
    return <p key={i}>{lines.map((line, j) => <React.Fragment key={j}>{j > 0 ? <br /> : null}<Inline text={line} /></React.Fragment>)}</p>;
  })}</div>;
}

export function LegalPage({ type }: { type: LegalType }) {
  const [legalDoc, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const title = type === 'TERMS' ? 'Términos y condiciones' : 'Política de privacidad';
  const load = () => {
    setLoading(true); setError(''); setDocument(null);
    legalApi.current().then(documents => {
      const found = Array.isArray(documents) ? documents.find(d => d.type === type && d.content && d.version > 0) : null;
      if (!found) throw new Error('El documento vigente no está disponible.');
      setDocument(found);
    }).catch(() => setError('No pudimos cargar el documento vigente. Intentá nuevamente.')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); document.title = `${title} | Jugamos?`; return () => { document.title = 'Jugamos?'; }; }, [type]);
  return <div className="legalPage">
    <header className="legalHeader"><a className="brand" href="/" aria-label="Ir al inicio de Jugamos?"><img className="brandLogo" src="/branding/logo.png" alt=""/><strong>Jugamos?</strong></a><a className="legalBack" href="/"><ArrowLeft size={17}/> Volver al inicio</a></header>
    <main className="legalMain"><div className="legalIntro"><span className="legalEyebrow">{type === 'TERMS' ? <FileText size={16}/> : <ShieldCheck size={16}/>} INFORMACIÓN LEGAL</span><h1>{title}</h1><p>Consultá la versión oficial y vigente de este documento, publicada por Jugamos?.</p></div>
    <section className="legalPanel" aria-busy={loading}>{loading ? <div className="legalState" role="status">Cargando documento vigente…</div> : error ? <div className="legalState" role="alert"><p>{error}</p><button className="legalRetry" onClick={load}><RefreshCw size={16}/> Reintentar</button></div> : legalDoc ? <><div className="legalMeta"><span>Versión {legalDoc.version}</span>{legalDoc.publishedAtUtc ? <span>Publicado el {new Intl.DateTimeFormat('es-AR',{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Argentina/Buenos_Aires'}).format(new Date(legalDoc.publishedAtUtc))}</span> : null}</div><LegalText content={legalDoc.content}/></> : null}</section>
    <div className="legalBottom"><a href={type === 'TERMS' ? '/privacidad' : '/terminos'}>{type === 'TERMS' ? 'Ver Política de privacidad' : 'Ver Términos y condiciones'}</a><button onClick={() => window.scrollTo({top:0,behavior:'smooth'})}><ArrowUp size={16}/> Volver arriba</button></div></main>
    <footer className="legalFooter"><span>© 2026 Jugamos? · Argentina</span><span>Consultas: <a href="mailto:soporte@jugamosapp.com">soporte@jugamosapp.com</a></span></footer>
  </div>;
}

import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import './styles.css';

type AuthScreenProps = { onLocalDemo: () => void };

export default function AuthScreen({ onLocalDemo }: AuthScreenProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null); setMessage(null); setBusy(true);
    if (!supabase) {
      setError('Supabase n’est pas encore configuré. Utilisez le mode local ou renseignez les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
      setBusy(false); return;
    }
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { school_name: schoolName } } });
    if (result.error) setError(result.error.message);
    else if (mode === 'sign-up') setMessage('Compte créé. Vérifiez votre adresse e-mail si la confirmation est activée.');
    setBusy(false);
  };

  return <main className="auth-shell"><section className="auth-visual"><div className="brand-row"><div className="brand-mark">Z</div><div><strong>Zeno</strong><span>School OS</span></div></div><div className="auth-copy"><p className="eyebrow">Gestion scolaire pensée pour le terrain</p><h1>Une école claire, même quand la journée ne l’est pas.</h1><p>Un espace sécurisé pour les équipes de direction, les enseignants, le secrétariat et la comptabilité.</p><div className="auth-benefits"><span><CheckCircle2 size={17} /> Présences et notes sans friction</span><span><ShieldCheck size={17} /> Données isolées par établissement</span><span><Sparkles size={17} /> Une structure qui s’adapte à votre école</span></div></div><small className="auth-footnote">Zeno · version pré-production</small></section><section className="auth-card-wrap"><form className="auth-card" onSubmit={submit}><div className="auth-card-head"><p className="eyebrow">{mode === 'sign-in' ? 'Espace sécurisé' : 'Créer votre espace'}</p><h2>{mode === 'sign-in' ? 'Bienvenue dans Zeno.' : 'Commencez avec votre école.'}</h2><p>{mode === 'sign-in' ? 'Connectez-vous pour retrouver vos données et vos droits.' : 'Créez le compte administrateur de votre établissement.'}</p></div>{mode === 'sign-up' && <label>Nom de l’établissement<input required value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="Ex. Complexe Scolaire La Sagesse" /></label>}<label>Adresse e-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@ecole.cd" autoComplete="email" /></label><label>Mot de passe<span className="password-field"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>{error && <div className="auth-message error">{error}</div>}{message && <div className="auth-message success">{message}</div>}<button className="button primary auth-submit" disabled={busy}>{busy ? 'Connexion…' : mode === 'sign-in' ? 'Se connecter' : 'Créer le compte'} <ArrowRight size={17} /></button><div className="auth-divider"><span>ou</span></div><button type="button" className="button secondary auth-demo" onClick={onLocalDemo}>Continuer en mode local de démonstration</button><p className="auth-switch">{mode === 'sign-in' ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?'} <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(null); setMessage(null); }}>{mode === 'sign-in' ? 'Créer un compte' : 'Se connecter'}</button></p><small className="auth-config">{isSupabaseConfigured ? 'Connexion sécurisée activée.' : 'Mode local disponible tant que Supabase n’est pas configuré.'}</small></form></section></main>;
}

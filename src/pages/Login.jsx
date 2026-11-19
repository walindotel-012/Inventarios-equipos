import { useState } from 'react';
import { signInWithPopup, linkWithPopup } from 'firebase/auth';
import { auth, googleProvider, microsoftProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Boxes, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [pendingProvider, setPendingProvider] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignInWithProvider = async (provider, providerName) => {
    setPendingProvider(providerName);
    setErrorMessage('');
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        try {
          const alternative = provider === googleProvider ? microsoftProvider : googleProvider;
          const result = await signInWithPopup(auth, alternative);
          await linkWithPopup(result.user, provider);
          navigate('/');
          return;
        } catch {
          setErrorMessage('Esta cuenta usa otro proveedor. Inicia sesión con el método utilizado originalmente.');
        }
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(`No pudimos iniciar sesión con ${providerName}. Inténtalo nuevamente.`);
      }
    } finally {
      setPendingProvider('');
    }
  };

  const isLoading = Boolean(pendingProvider);

  return (
    <main className="grid min-h-screen bg-[#f8f9fb] lg:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
      <section className="flex flex-col justify-between bg-[#1B2438] p-6 text-white sm:p-10 lg:p-14">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-[#714B67]"><Boxes size={25} /></div>
          <div><p className="text-xs font-bold uppercase tracking-widest text-white/55">AUTOMÍA</p><p className="font-semibold text-white">Gestión de activos</p></div>
        </div>
        <div className="hidden max-w-lg lg:block">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d9bdcf]">Espacio de trabajo</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white">Inventario claro.<br />Operaciones bajo control.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Consulta, asigna y da seguimiento a los equipos desde un entorno seguro para el personal autorizado.</p>
          <div className="mt-10 grid gap-4 text-sm text-slate-200">
            <p className="flex items-center gap-3"><CheckCircle2 size={19} className="text-[#d9bdcf]" /> Información centralizada y actualizada</p>
            <p className="flex items-center gap-3"><ShieldCheck size={19} className="text-[#d9bdcf]" /> Acceso protegido por tu cuenta corporativa</p>
          </div>
        </div>
        <p className="hidden text-xs text-slate-400 lg:block">Uso exclusivo para personal autorizado</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-widest text-[#714B67]">Bienvenido</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Inicia sesión</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Usa la cuenta autorizada por el equipo de Sistemas.</p>

          {errorMessage && <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{errorMessage}</div>}

          <div className="mt-8 space-y-3">
            <button disabled={isLoading} onClick={() => handleSignInWithProvider(googleProvider, 'Google')} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#714B67] px-5 font-semibold text-white shadow-sm transition hover:bg-[#5f3d56] disabled:cursor-wait disabled:opacity-60">
              <span className="text-lg font-bold">G</span>{pendingProvider === 'Google' ? 'Conectando...' : 'Continuar con Google'}
            </button>
            <button disabled={isLoading} onClick={() => handleSignInWithProvider(microsoftProvider, 'Microsoft')} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60">
              <span className="grid grid-cols-2 gap-0.5" aria-hidden="true">{[0,1,2,3].map(i => <i key={i} className="block h-2 w-2 bg-[#714B67]" />)}</span>{pendingProvider === 'Microsoft' ? 'Conectando...' : 'Continuar con Microsoft'}
            </button>
          </div>
          <p className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">¿Problemas para acceder? Contacta al equipo de Sistemas.</p>
        </div>
      </section>
    </main>
  );
}

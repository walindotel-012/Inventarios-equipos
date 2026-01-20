import { signInWithPopup, linkWithPopup } from 'firebase/auth';
import { auth, googleProvider, microsoftProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleSignInWithProvider = async (provider, providerName) => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      // Si la cuenta existe con otro proveedor, intentar vincularla
      if (error.code === 'auth/account-exists-with-different-credential') {
        try {
          const email = error.customData?.email;
          if (email) {
            // Intentar vincular el nuevo proveedor con la cuenta existente
            const result = await signInWithPopup(auth, provider === googleProvider ? microsoftProvider : googleProvider);
            await linkWithPopup(result.user, provider);
            navigate('/');
            return;
          }
        } catch (linkError) {
          console.error('Error al vincular cuenta:', linkError);
          alert('Esta cuenta ya existe con otro proveedor. Intenta con el mismo proveedor que usaste antes.');
        }
      } else {
        console.error('Error al iniciar sesión:', error);
        alert(`Error al iniciar sesión con ${providerName}: ${error.message}`);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    await handleSignInWithProvider(googleProvider, 'Google');
  };

  const handleMicrosoftSignIn = async () => {
    await handleSignInWithProvider(microsoftProvider, 'Microsoft');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-blue-500 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white backdrop-blur-lg bg-opacity-95 rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent mb-2">
              Inventario de Equipos
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Sistema de gestión integral de equipos de oficina
            </p>
          </div>

          {/* Sign In Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Iniciar sesión con Google</span>
            </button>

            <button
              onClick={handleMicrosoftSignIn}
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
              </svg>
              <span>Iniciar sesión con Microsoft</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-lg">📊</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Gestión Centralizada</p>
                <p className="text-gray-600 text-xs">Controla todos tus equipos en un solo lugar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🔒</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Seguridad Garantizada</p>
                <p className="text-gray-600 text-xs">Acceso seguro con autenticación Google</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">📄</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Reportes en PDF</p>
                <p className="text-gray-600 text-xs">Genera hojas de entrega personalizadas</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-6">
            <p>Acceso solo para personal autorizado</p>
            <p>Para más información, contacta a Sistemas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

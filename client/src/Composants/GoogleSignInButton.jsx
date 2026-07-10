import { useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult, isSignInWithEmailLink } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { useUserAuth } from '../contexts/useUserAuth';
import { toast } from 'react-toastify';

const GoogleSignInButton = ({
  onSuccess,
  onError,
  disabled = false,
  variant = 'login',
  className = '',
  style = {}
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { login } = useUserAuth();

  const theme = {
    transition: 'all 0.3s ease',
    buttonBorderRadius: '30px'
  };

  const buttonText = variant === 'signup' ? "S'inscrire avec Google" : "Se connecter avec Google";

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Vérifier le résultat de la redirection au montage
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setIsLoading(false);
          if (onSuccess) {
            onSuccess(result.user);
          }
        }
      } catch (error) {
        console.error('Erreur redirect result:', error);
      }
    };
    checkRedirectResult();
  }, [onSuccess]);

  const handleGoogleSignIn = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);

    try {
      if (isMobile) {
        // Sur mobile : utiliser la redirection (pas de popup bloquée)
        await signInWithRedirect(auth, googleProvider);
        // Le résultat sera traité dans le useEffect ci-dessus après redirection
      } else {
        // Sur desktop : popup
        const result = await signInWithPopup(auth, googleProvider);
        if (onSuccess) {
          onSuccess(result.user);
        }
      }
    } catch (error) {
      console.error('Erreur Google Auth:', error);
      let errorMessage = "Erreur lors de l'authentification Google";

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Connexion annulée";
      } else if (error.code === 'auth/popup-blocked') {
        // Fallback vers redirect si popup bloquée
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          errorMessage = "Veuillez autoriser les popups ou réessayer";
        }
      }

      toast.error(errorMessage);
      if (onError) onError(error);
    } finally {
      if (!isMobile) setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn w-100 py-2 d-flex align-items-center justify-content-center ${className}`}
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      style={{
        backgroundColor: "#fff",
        color: "#4285F4",
        borderRadius: theme.buttonBorderRadius,
        fontWeight: '500',
        border: '1px solid #4285F4',
        boxShadow: "0 2px 8px rgba(66,133,244,0.08)",
        transition: theme.transition,
        opacity: (disabled || isLoading) ? 0.6 : 1,
        cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
        ...style
      }}
      onMouseOver={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(66,133,244,0.15)";
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = "#fff";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(66,133,244,0.08)";
        }
      }}
    >
      {isLoading ? (
        <>
          <div
            className="spinner-border spinner-border-sm me-2"
            role="status"
            style={{ width: '16px', height: '16px' }}
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          Connexion en cours...
        </>
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            style={{ marginRight: 8, flexShrink: 0 }}
          >
            <g>
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.6 6.2 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z" />
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.4 16.1 19.3 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.6 6.2 29.6 4 24 4c-7.1 0-13.1 3.7-16.7 9.3z" />
              <path fill="#FBBC05" d="M24 44c5.6 0 10.6-1.8 14.5-4.9l-6.7-5.5C29.6 35.7 27 36.5 24 36.5c-5.7 0-10.6-3-13.2-7.5l-7 5.4C6.9 40.3 14.7 44 24 44z" />
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C15.4 41.9 19.3 44 24 44c7.1 0 13.1-3.7 16.7-9.3z" />
            </g>
          </svg>
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
import React from 'react';
import { MdErrorOutline, MdRefresh, MdHome } from 'react-icons/md';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Met à jour l'état pour que le prochain rendu affiche l'UI de secours.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // On peut logger l'erreur vers un service d'analyse ici
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="mb-4" style={{ color: '#dc3545' }}>
                        <MdErrorOutline size={80} />
                    </div>
                    <h1 className="h3 mb-3 fw-bold text-dark">Oups ! Quelque chose s'est mal passé.</h1>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                        Une erreur inattendue est survenue dans l'application. Ne vous inquiétez pas, vos données sont en sécurité.
                    </p>

                    <div className="d-flex gap-3 flex-wrap justify-content-center">
                        <button
                            onClick={this.handleReload}
                            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                            style={{ borderRadius: '50px' }}
                        >
                            <MdRefresh size={20} /> Réessayer
                        </button>
                        <button
                            onClick={this.handleGoHome}
                            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                            style={{ borderRadius: '50px' }}
                        >
                            <MdHome size={20} /> Retour à l'accueil
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-5 p-3 text-start bg-white border rounded shadow-sm overflow-auto" style={{ maxWidth: '100%', fontSize: '0.8rem' }}>
                            <p className="fw-bold text-danger mb-1">Détails de l'erreur (visible en mode dév) :</p>
                            <pre className="mb-0 text-dark">{this.state.error?.toString()}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

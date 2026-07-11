import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { UserAuthProvider } from './contexts/UserAuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import ErrorBoundary from './Composants/ErrorBoundary';
import InstallPWA from './Composants/InstallPWA';
import { cleanExpiredPrepas } from './services/offlineCache';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes : évite les refetch incessants sur réseau instable
            gcTime: 1000 * 60 * 30,    // 30 minutes : garde les données en mémoire plus longtemps
            retry: 2,                 // Réessayer automatiquement en cas d'erreur réseau
            refetchOnWindowFocus: false, // Ne pas rafraîchir à chaque changement d'onglet (économie de data)
        },
    },
});

// Pages & Components avec Lazy Loading pour optimiser le bundle (crucial pour le marché camerounais)
const Home = lazy(() => import('./Pages/Home'));
const Menu = lazy(() => import('./Pages/Menu'));
const Dashboard = lazy(() => import('./Pages/Dashboard'));
const Prepas = lazy(() => import('./Composants/Dashboard/Prepas'));
const DisciplinesView = lazy(() => import('./Pages/DisciplinesView'));
const DisciplinesViewConsultation = lazy(() => import('./Pages/DisciplinesViewConsultation'));
const PrepaPage = lazy(() => import('./Pages/PrepaPage'));
const PrepaPageConsultation = lazy(() => import('./Pages/PrepaPageConsultation'));
const AdminRedirect = lazy(() => import('./Pages/AdminRedirect'));
const Admin = lazy(() => import('./Pages/Admin'));
const Discipline = lazy(() => import('./Pages/Discipline'));
const AdminInscription = lazy(() => import('./Pages/AdminInscription'));
const AdminConnexion = lazy(() => import('./Pages/AdminConnexion'));
const PaymentSuccess = lazy(() => import('./Pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./Pages/PaymentCancel'));
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./Pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./Pages/VerifyEmail'));

// Utils restent en import direct car petits ou nécessaires au démarrage
import AdminPrivateRoute from './utils/AdminPrivateRoute';
import UserPrivateRoute from './utils/UserPrivateRoute';

export default function App() {
    // Nettoyage automatique des prépas expirées au démarrage
    useEffect(() => {
        cleanExpiredPrepas().then(count => {
            if (count > 0) {
                console.log(`${count} préparation(s) expirée(s) supprimée(s) du cache hors-ligne`);
            }
        });
    }, []);

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AdminAuthProvider>
                    <UserAuthProvider>
                        <BrowserRouter>
                            <Suspense fallback={
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Chargement...</span>
                                    </div>
                                </div>
                            }>
                                <Routes>
                                    <Route path='/' element={<Home />}>
                                        <Route index element={<Menu />} />
                                        <Route element={<UserPrivateRoute />}>
                                            <Route path='user/dashboard' element={<Dashboard />} >
                                                <Route index element={<Prepas />} />
                                            </Route>
                                            <Route path='user/prepa/:prepaId' element={<DisciplinesView />} />
                                            <Route path='user/prepa/:prepaId/:disciplineId' element={<PrepaPage />} />
                                            <Route path='user/prepa/consultation/:prepaId' element={<DisciplinesViewConsultation />} />
                                            <Route path='user/prepa/consultation/:prepaId/:disciplineId' element={<PrepaPageConsultation />} />
                                            <Route path='user/dashboard/success/:prepaId' element={<PaymentSuccess />} />
                                            <Route path='user/dashboard/cancel' element={<PaymentCancel />} />
                                        </Route>
                                        <Route path='/verify-email-info' element={<VerifyEmail />} />
                                        <Route path='/forgot-password' element={<ForgotPassword />} />
                                        <Route path='/reset-password' element={<ResetPassword />} />
                                        <Route path='/login' element={<Navigate to="/" replace />} />

                                        <Route element={<AdminPrivateRoute />}>
                                            <Route path='admin/dashboard' element={<Admin />} />
                                            <Route path='admin/discipline/:disciplineId' element={<Discipline />} />
                                        </Route>
                                        <Route path='admin/inscription' element={<AdminRedirect />}>
                                            <Route index element={<AdminInscription />} />
                                        </Route>
                                        <Route path='admin/connexion' element={<AdminRedirect />}>
                                            <Route index element={<AdminConnexion />} />
                                        </Route>
                                    </Route>
                                </Routes>
                            </Suspense>
                        </BrowserRouter>
                        <InstallPWA />
                        <ToastContainer />
                    </UserAuthProvider>
                </AdminAuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation();

    return (
        <div className="app-layout">
            <header className="app-header">
                <h1>🧬 3D Bin Packing - Genetik Algoritma</h1>
                <nav className="main-nav">
                    <Link
                        to="/"
                        className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
                    >
                        📊 Optimizasyon
                    </Link>
                    <Link
                        to="/machines"
                        className={location.pathname === '/machines' ? 'nav-link active' : 'nav-link'}
                    >
                        🏭 Makin eler
                    </Link>
                    <Link
                        to="/parts"
                        className={location.pathname === '/parts' ? 'nav-link active' : 'nav-link'}
                    >
                        📦 Parçalar
                    </Link>
                </nav>
            </header>
            <main className="app-content">
                {children}
            </main>
            <footer className="app-footer">
                <p>3D Bin Packing & Scheduling - Genetik Algoritma ile Eklemeli Üretim Optimizasyonu</p>
            </footer>
        </div>
    );
}

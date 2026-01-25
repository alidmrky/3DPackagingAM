import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OptimizationPage } from './pages/OptimizationPage';
import { MachinesPage } from './pages/MachinesPage';
import { PartsPage } from './pages/PartsPage';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<OptimizationPage />} />
                    <Route path="/machines" element={<MachinesPage />} />
                    <Route path="/parts" element={<PartsPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;

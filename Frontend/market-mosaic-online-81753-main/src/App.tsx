
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Animales from "./pages/Animales";
import Alimentos from "./pages/Alimentos";
import Limpieza from "./pages/Limpieza";
import Entradas from "./pages/Entradas";
import RRHH from "./pages/RRHH";
import Reportes from "./pages/Reportes";
import Settings from "./pages/Settings";
import Empleados from "./pages/Empleados";
import Clinico from "./pages/Clinico";
import AlertasMedicas from "./pages/AlertasMedicas";
import { SideNav } from "./components/SideNav";
import { Toaster } from "./components/ui/toaster";
import { isAuthenticated } from "./utils/auth";

const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

const AppLayout = () => (
  <div className="flex min-h-screen">
    <SideNav className="w-64 hidden md:block" />
    <main className="flex-1 p-8 bg-gray-50">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/animales" element={<Animales />} />
            <Route path="/alimentos" element={<Alimentos />} />
            <Route path="/limpieza" element={<Limpieza />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/empleados" element={<Empleados />} />
            <Route path="/alertas-medicas" element={<AlertasMedicas />} />
            <Route path="/clinico" element={<Clinico />} />
            <Route path="/rrhh" element={<RRHH />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;

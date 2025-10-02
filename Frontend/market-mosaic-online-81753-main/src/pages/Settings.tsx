import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/profile', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-96">
      <p className="text-muted-foreground">Redirigiendo...</p>
    </div>
  );
}

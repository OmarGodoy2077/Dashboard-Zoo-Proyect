import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { API_BASE_URL } from '../config/api';

export default function Reportes() {

  const handleDownload = async (reportType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/dashboard/reports/${reportType}/excel`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error(`Failed to download ${reportType} report`);
      }
    } catch (error) {
      console.error(`An error occurred while downloading the ${reportType} report:`, error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Generación de Reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReportCard title="Reporte de Animales" onClick={() => handleDownload('animals')} />
        <ReportCard title="Reporte de Empleados" onClick={() => handleDownload('employees')} />
        <ReportCard title="Reporte Financiero" onClick={() => handleDownload('financial')} />
        <ReportCard title="Reporte de Planilla Mensual" onClick={() => handleDownload('planilla')} />
        <ReportCard title="Reporte Consolidado" onClick={() => handleDownload('consolidated')} />
      </div>
    </div>
  );
}

function ReportCard({ title, onClick }: { title: string, onClick: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onClick} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Descargar Excel
        </Button>
      </CardContent>
    </Card>
  );
}
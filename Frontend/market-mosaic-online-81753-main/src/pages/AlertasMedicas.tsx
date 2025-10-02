import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';
import { Loader2, AlertCircle, Activity, Heart, Stethoscope, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Animal {
  id: number;
  nombre: string;
  especie: string;
  estado_salud: string;
  habitat?: string;
  edad?: number;
  fecha_ingreso?: string;
}

interface Tratamiento {
  id: number;
  animal_id: number;
  diagnostico: string;
  tratamiento: string;
  medicamento?: string;
  dosis?: string;
  frecuencia?: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  veterinario?: string;
  notas?: string;
  animal?: Animal;
}

export default function AlertasMedicas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [animalesEnfermos, setAnimalesEnfermos] = useState<Animal[]>([]);
  const [tratamientosActivos, setTratamientosActivos] = useState<Tratamiento[]>([]);
  const [todosAnimales, setTodosAnimales] = useState<Animal[]>([]);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTratamiento, setEditingTratamiento] = useState<Tratamiento | null>(null);
  
  const [formData, setFormData] = useState({
    animal_id: '',
    diagnostico: '',
    tratamiento: '',
    medicamento: '',
    dosis: '',
    frecuencia: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    estado: 'activo',
    veterinario: '',
    notas: ''
  });

  useEffect(() => {
    fetchAlertasMedicas();
    fetchTodosAnimales();
    fetchVeterinarios();
  }, []);

  const fetchTodosAnimales = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/animales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTodosAnimales(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error('Error cargando animales:', error);
    }
  };

  const fetchVeterinarios = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/empleados?puesto=veterinario&estado=activo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVeterinarios(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error('Error cargando veterinarios:', error);
    }
  };

  const fetchAlertasMedicas = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      // Obtener animales enfermos
      const responseAnimales = await fetch(`${API_BASE_URL}/api/animales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (responseAnimales.ok) {
        const dataAnimales = await responseAnimales.json();
        const animales = Array.isArray(dataAnimales.data) ? dataAnimales.data : (Array.isArray(dataAnimales) ? dataAnimales : []);
        const animalesConProblemas = animales.filter((animal: Animal) =>
          animal.estado_salud &&
          (animal.estado_salud.toLowerCase().includes('enfermo') ||
           animal.estado_salud.toLowerCase().includes('critico') ||
           animal.estado_salud.toLowerCase().includes('en tratamiento'))
        );
        setAnimalesEnfermos(animalesConProblemas);
      }

      // Obtener tratamientos activos
      const responseTratamientos = await fetch(`${API_BASE_URL}/api/clinico/tratamientos?estado=activo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (responseTratamientos.ok) {
        const dataTratamientos = await responseTratamientos.json();
        setTratamientosActivos(Array.isArray(dataTratamientos.data) ? dataTratamientos.data : (Array.isArray(dataTratamientos) ? dataTratamientos : []));
      } else {
  // ...existing code...
        setTratamientosActivos([]);
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las alertas médicas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTratamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const url = editingTratamiento
        ? `${API_BASE_URL}/api/clinico/tratamientos/${editingTratamiento.id}`
        : `${API_BASE_URL}/api/clinico/tratamientos`;

      const tratamientoData = {
        ...formData,
        animal_id: parseInt(formData.animal_id)
      };

      const response = await fetch(url, {
        method: editingTratamiento ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tratamientoData),
      });

      if (response.ok) {
        toast({
          title: editingTratamiento ? "Tratamiento actualizado" : "Tratamiento registrado",
          description: editingTratamiento 
            ? "El tratamiento se actualizó correctamente" 
            : "El tratamiento se registró exitosamente",
        });
        
        setOpenDialog(false);
        resetForm();
        fetchAlertasMedicas();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el tratamiento",
      });
    }
  };

  const handleDeleteTratamiento = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este tratamiento?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/clinico/tratamientos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Tratamiento eliminado",
          description: "El tratamiento se eliminó correctamente",
        });
        fetchAlertasMedicas();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el tratamiento",
      });
    }
  };

  const handleEditTratamiento = (tratamiento: Tratamiento) => {
    setEditingTratamiento(tratamiento);
    setFormData({
      animal_id: tratamiento.animal_id.toString(),
      diagnostico: tratamiento.diagnostico,
      tratamiento: tratamiento.tratamiento,
      medicamento: tratamiento.medicamento || '',
      dosis: tratamiento.dosis || '',
      frecuencia: tratamiento.frecuencia || '',
      fecha_inicio: tratamiento.fecha_inicio,
      fecha_fin: tratamiento.fecha_fin,
      estado: tratamiento.estado,
      veterinario: tratamiento.veterinario || '',
      notas: tratamiento.notas || ''
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingTratamiento(null);
    setFormData({
      animal_id: '',
      diagnostico: '',
      tratamiento: '',
      medicamento: '',
      dosis: '',
      frecuencia: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      estado: 'activo',
      veterinario: '',
      notas: ''
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'critico':
        return 'bg-red-600 text-white';
      case 'enfermo':
        return 'bg-orange-500 text-white';
      case 'en tratamiento':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'critico':
        return <AlertCircle className="h-4 w-4" />;
      case 'enfermo':
        return <Heart className="h-4 w-4" />;
      case 'en tratamiento':
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando alertas médicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              Alertas Médicas
            </h1>
            <p className="text-muted-foreground">
              Animales que requieren atención veterinaria
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Tratamiento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTratamiento ? 'Editar Tratamiento' : 'Registrar Nuevo Tratamiento'}
                </DialogTitle>
                <DialogDescription>
                  Complete la información del tratamiento veterinario
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitTratamiento}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="animal_id">Animal *</Label>
                    <Select 
                      value={formData.animal_id} 
                      onValueChange={(value) => setFormData({ ...formData, animal_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar animal" />
                      </SelectTrigger>
                      <SelectContent>
                        {animalesEnfermos.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id.toString()}>
                            {animal.nombre} - {animal.especie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="diagnostico">Diagnóstico *</Label>
                    <Textarea
                      id="diagnostico"
                      value={formData.diagnostico}
                      onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                      placeholder="Describa el diagnóstico médico"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tratamiento">Tratamiento *</Label>
                    <Textarea
                      id="tratamiento"
                      value={formData.tratamiento}
                      onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                      placeholder="Describa el tratamiento a seguir"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="medicamento">Medicamento</Label>
                      <Input
                        id="medicamento"
                        value={formData.medicamento}
                        onChange={(e) => setFormData({ ...formData, medicamento: e.target.value })}
                        placeholder="Nombre del medicamento"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="dosis">Dosis</Label>
                      <Input
                        id="dosis"
                        value={formData.dosis}
                        onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                        placeholder="ej: 10mg"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="frecuencia">Frecuencia</Label>
                    <Input
                      id="frecuencia"
                      value={formData.frecuencia}
                      onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                      placeholder="ej: Cada 8 horas"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
                      <Input
                        id="fecha_inicio"
                        type="date"
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="fecha_fin">Fecha Fin Estimada *</Label>
                      <Input
                        id="fecha_fin"
                        type="date"
                        value={formData.fecha_fin}
                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select 
                        value={formData.estado} 
                        onValueChange={(value) => setFormData({ ...formData, estado: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="completado">Completado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="veterinario">Veterinario</Label>
                      <Select 
                        value={formData.veterinario} 
                        onValueChange={(value) => setFormData({ ...formData, veterinario: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar veterinario" />
                        </SelectTrigger>
                        <SelectContent>
                          {veterinarios.map((vet) => (
                            <SelectItem key={vet.id} value={vet.nombre}>
                              {vet.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notas">Notas Adicionales</Label>
                    <Textarea
                      id="notas"
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      placeholder="Observaciones o notas adicionales"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setOpenDialog(false);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTratamiento ? 'Actualizar' : 'Registrar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => navigate('/animales')}>
            Ver Todos los Animales
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Animales Enfermos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {animalesEnfermos.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              Tratamientos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {tratamientosActivos.length}
            </div>
            <p className="text-xs text-muted-foreground">
              En proceso de recuperación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              Estados Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {animalesEnfermos.filter(a => a.estado_salud?.toLowerCase().includes('critico')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Prioridad máxima
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Animales Enfermos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Animales que Requieren Atención
          </CardTitle>
          <CardDescription>
            Lista de animales con problemas de salud
          </CardDescription>
        </CardHeader>
        <CardContent>
          {animalesEnfermos.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">¡Excelente!</h3>
              <p className="text-muted-foreground">
                No hay animales enfermos en este momento
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Estado de Salud</TableHead>
                  <TableHead>Hábitat</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animalesEnfermos.map((animal) => (
                  <TableRow key={animal.id} className="hover:bg-red-50">
                    <TableCell className="font-medium">{animal.nombre}</TableCell>
                    <TableCell>{animal.especie}</TableCell>
                    <TableCell>
                      <Badge className={getEstadoColor(animal.estado_salud)}>
                        <span className="flex items-center gap-1">
                          {getEstadoIcon(animal.estado_salud)}
                          {animal.estado_salud}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{animal.habitat || 'No especificado'}</TableCell>
                    <TableCell>{animal.edad ? `${animal.edad} años` : 'N/A'}</TableCell>
                    <TableCell>
                      {animal.fecha_ingreso 
                        ? new Date(animal.fecha_ingreso).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/animales?id=${animal.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Tratamientos Activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            Tratamientos en Curso
          </CardTitle>
          <CardDescription>
            Tratamientos veterinarios activos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tratamientosActivos.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">
                No hay tratamientos activos en este momento
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead>Tratamiento</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tratamientosActivos.map((tratamiento) => (
                  <TableRow key={tratamiento.id}>
                    <TableCell className="font-medium">
                      {tratamiento.animal?.nombre || `Animal #${tratamiento.animal_id}`}
                    </TableCell>
                    <TableCell>{tratamiento.diagnostico}</TableCell>
                    <TableCell>{tratamiento.tratamiento}</TableCell>
                    <TableCell>
                      {new Date(tratamiento.fecha_inicio).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(tratamiento.fecha_fin).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500 text-white">
                        {tratamiento.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTratamiento(tratamiento)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/animales?id=${tratamiento.animal_id}`)}
                        >
                          Ver Animal
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTratamiento(tratamiento.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

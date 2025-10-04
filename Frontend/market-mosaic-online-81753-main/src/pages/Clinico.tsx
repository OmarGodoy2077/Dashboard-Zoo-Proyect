import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getToken, getUserRole } from '../utils/auth';
import { Loader2, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

// Función para convertir fecha UTC a hora de Guatemala
const formatGuatemalaTime = (dateString: string | null) => {
  if (!dateString) return 'Nunca';
  const date = new Date(dateString);
  // Guatemala está en GMT-6
  const guatemalaTime = new Date(date.getTime() - (6 * 60 * 60 * 1000));
  return guatemalaTime.toLocaleString('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface Animal {
  id: number;
  nombre: string;
  especie: string;
  estado_salud: string;
}

interface Alimento {
  id: number;
  nombre: string;
  tipo: string;
  unidad_medida: string;
}

interface HorarioAlimentacion {
  id: number;
  animal_id: number;
  alimento_id: number;
  hora: string;
  frecuencia: string;
  cantidad: number;
  observaciones: string;
  activo: boolean;
  ultima_ejecucion?: string;
  proxima_ejecucion?: string;
  alimento_nombre: string;
  alimento_tipo: string;
  unidad_medida: string;
}

export default function Dietas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [horarios, setHorarios] = useState<{[key: number]: HorarioAlimentacion[]}>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [editingHorario, setEditingHorario] = useState<HorarioAlimentacion | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [proximasEjecuciones, setProximasEjecuciones] = useState<any[]>([]);
  const [estadisticasEjecuciones, setEstadisticasEjecuciones] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    alimento_id: '',
    hora: '',
    frecuencia: 'diario',
    cantidad: '',
    observaciones: '',
  });

  useEffect(() => {
    setUserRole(getUserRole());
    fetchAnimales();
    fetchAlimentos();
    fetchEstadisticasEjecuciones();

    // Actualización automática cada 30 segundos
    const interval = setInterval(() => {
      if (!dialogOpen && !refreshing) {
        refreshAllData();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [dialogOpen, refreshing]);

  const fetchAnimales = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/animales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnimales(data.data || data);
      } else {
        if (response.status === 401) {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching animales:', error);
    }
  };

  const fetchAlimentos = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/alimentos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlimentos(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching alimentos:', error);
    }
  };

  const fetchHorariosAnimal = async (animalId: number) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/dietas/animal/${animalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHorarios(prev => ({
          ...prev,
          [animalId]: data.data || []
        }));
      }
    } catch (error) {
      console.error('Error fetching horarios:', error);
    }
  };

  const fetchEstadisticasEjecuciones = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/dietas/ejecuciones/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEstadisticasEjecuciones(data.data);
        setProximasEjecuciones(data.data?.proximasEjecuciones || []);
      }
    } catch (error) {
      console.error('Error fetching estadísticas de ejecuciones:', error);
    }
  };

  const refreshAllData = async () => {
    setRefreshing(true);
    try {
      // Actualizar estadísticas
      await fetchEstadisticasEjecuciones();
      
      // Actualizar horarios de animales que ya tienen horarios cargados
      for (const animal of animales) {
        if (horarios[animal.id] && horarios[animal.id].length > 0) {
          await fetchHorariosAnimal(animal.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateHorario = async () => {
    if (!selectedAnimal) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/dietas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animal_id: selectedAnimal.id,
          alimento_id: parseInt(formData.alimento_id),
          hora: formData.hora,
          frecuencia: formData.frecuencia,
          cantidad: parseFloat(formData.cantidad),
          observaciones: formData.observaciones,
        }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Horario de alimentación creado exitosamente",
        });
        setDialogOpen(false);
        resetForm();
        fetchHorariosAnimal(selectedAnimal.id);
        fetchEstadisticasEjecuciones();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear el horario",
        });
      }
    } catch (error) {
      console.error('Error creating horario:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al crear el horario",
      });
    }
  };

  const handleUpdateHorario = async () => {
    if (!editingHorario || !selectedAnimal) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/dietas/${editingHorario.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animal_id: selectedAnimal.id,
          alimento_id: parseInt(formData.alimento_id),
          hora: formData.hora,
          frecuencia: formData.frecuencia,
          cantidad: parseFloat(formData.cantidad),
          observaciones: formData.observaciones,
          activo: true,
        }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Horario de alimentación actualizado exitosamente",
        });
        setDialogOpen(false);
        resetForm();
        setEditingHorario(null);
        fetchHorariosAnimal(selectedAnimal.id);
        fetchEstadisticasEjecuciones();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar el horario",
        });
      }
    } catch (error) {
      console.error('Error updating horario:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el horario",
      });
    }
  };

  const handleEjecutarAlimentacion = async (horarioId: number) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/dietas/${horarioId}/ejecutar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Alimentación ejecutada exitosamente",
        });
        // Recargar datos
        fetchEstadisticasEjecuciones();
        if (selectedAnimal) {
          fetchHorariosAnimal(selectedAnimal.id);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo ejecutar la alimentación",
        });
      }
    } catch (error) {
      console.error('Error ejecutando alimentación:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al ejecutar la alimentación",
      });
    }
  };

  const handleDeleteHorario = async (horarioId: number) => {
    if (!selectedAnimal) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/dietas/${horarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Horario de alimentación eliminado exitosamente",
        });
        fetchHorariosAnimal(selectedAnimal.id);
        fetchEstadisticasEjecuciones();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el horario",
        });
      }
    } catch (error) {
      console.error('Error deleting horario:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar el horario",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      alimento_id: '',
      hora: '',
      frecuencia: 'diario',
      cantidad: '',
      observaciones: '',
    });
  };

  const openCreateDialog = (animal: Animal) => {
    setSelectedAnimal(animal);
    setEditingHorario(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (animal: Animal, horario: HorarioAlimentacion) => {
    setSelectedAnimal(animal);
    setEditingHorario(horario);
    setFormData({
      alimento_id: horario.alimento_id.toString(),
      hora: horario.hora,
      frecuencia: horario.frecuencia,
      cantidad: horario.cantidad.toString(),
      observaciones: horario.observaciones,
    });
    setDialogOpen(true);
  };

  const canModify = userRole === 'admin' || userRole === 'veterinario';

  useEffect(() => {
    if (animales.length > 0) {
      setLoading(false);
    }
  }, [animales]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Control de Dietas de Animales</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <div className="text-sm text-gray-600">
            Actualización automática cada 30s
          </div>
        </div>
      </div>

      {/* Estadísticas de ejecuciones */}
      {estadisticasEjecuciones && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Estadísticas de Alimentaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticasEjecuciones.ejecutadasHoy || 0}</div>
              <div className="text-sm text-gray-600">Ejecutadas Hoy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{proximasEjecuciones.length}</div>
              <div className="text-sm text-gray-600">Próximas Ejecuciones</div>
            </div>
            <div className="text-center">
              <Button
                onClick={fetchEstadisticasEjecuciones}
                variant="outline"
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Próximas ejecuciones */}
      {proximasEjecuciones.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Próximas Alimentaciones</h2>
          <div className="space-y-2">
            {proximasEjecuciones.slice(0, 5).map((ejecucion: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                <div>
                  <span className="font-medium">{ejecucion.animales?.nombre}</span> - {ejecucion.alimentos?.nombre}
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(ejecucion.proxima_ejecucion).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {animales.map((animal) => (
          <div key={animal.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">{animal.nombre}</h2>
                <p className="text-gray-600">{animal.especie} - Estado: {animal.estado_salud}</p>
              </div>
              {canModify && (
                <Button onClick={() => openCreateDialog(animal)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Horario
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Alimento</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Última Ejecución</TableHead>
                    <TableHead>Próxima Ejecución</TableHead>
                    {canModify && <TableHead>Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(horarios[animal.id] || []).map((horario) => (
                    <TableRow key={horario.id}>
                      <TableCell>{horario.hora}</TableCell>
                      <TableCell>{horario.alimento_nombre}</TableCell>
                      <TableCell>{horario.cantidad} {horario.unidad_medida}</TableCell>
                      <TableCell>{horario.frecuencia}</TableCell>
                      <TableCell>{horario.observaciones}</TableCell>
                      <TableCell>
                        {horario.ultima_ejecucion
                          ? formatGuatemalaTime(horario.ultima_ejecucion)
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        {horario.proxima_ejecucion
                          ? formatGuatemalaTime(horario.proxima_ejecucion)
                          : 'Pendiente'
                        }
                      </TableCell>
                      {canModify && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEjecutarAlimentacion(horario.id)}
                              title="Ejecutar alimentación ahora"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(animal, horario)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará el horario de alimentación.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteHorario(horario.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {(horarios[animal.id] || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canModify ? 8 : 7} className="text-center text-gray-500">
                        No hay horarios de alimentación configurados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {(horarios[animal.id] || []).length === 0 && (
              <Button
                variant="outline"
                onClick={() => fetchHorariosAnimal(animal.id)}
                className="mt-4"
              >
                <Clock className="h-4 w-4 mr-2" />
                Cargar Dieta
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingHorario ? 'Editar Horario de Alimentación' : 'Crear Horario de Alimentación'}
            </DialogTitle>
            <DialogDescription>
              {selectedAnimal && `Para el animal: ${selectedAnimal.nombre} (${selectedAnimal.especie})`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="alimento" className="text-right">
                Alimento
              </Label>
              <Select value={formData.alimento_id} onValueChange={(value) => setFormData({...formData, alimento_id: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar alimento" />
                </SelectTrigger>
                <SelectContent>
                  {alimentos.map((alimento) => (
                    <SelectItem key={alimento.id} value={alimento.id.toString()}>
                      {alimento.nombre} ({alimento.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hora" className="text-right">
                Hora
              </Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({...formData, hora: e.target.value})}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frecuencia" className="text-right">
                Frecuencia
              </Label>
              <Select value={formData.frecuencia} onValueChange={(value) => setFormData({...formData, frecuencia: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="cada_dos_dias">Cada dos días</SelectItem>
                  <SelectItem value="cada_tres_dias">Cada tres días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cantidad" className="text-right">
                Cantidad
              </Label>
              <Input
                id="cantidad"
                type="number"
                step="0.1"
                value={formData.cantidad}
                onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observaciones" className="text-right">
                Observaciones
              </Label>
              <Input
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" onClick={editingHorario ? handleUpdateHorario : handleCreateHorario}>
              {editingHorario ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

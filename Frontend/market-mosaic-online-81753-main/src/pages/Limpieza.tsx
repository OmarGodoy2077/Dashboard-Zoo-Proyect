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
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getToken } from '../utils/auth';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Limpieza() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tareas, setTareas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [allEmpleados, setAllEmpleados] = useState([]); // Para mostrar información histórica
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    area: '',
    descripcion: '',
    encargado_id: '',
    estado: 'pendiente',
    fecha_limite: '',
  });

  const getEmpleadoDisplayName = (tarea: any) => {
    if (tarea.encargado) return tarea.encargado;
    
    const empleado = allEmpleados.find((e: any) => e.id === tarea.encargado_id);
    if (!empleado) return 'Sin asignar';
    
    if (empleado.estado === 'vacaciones') {
      return `${empleado.nombre} (En vacaciones)`;
    }
    
    return empleado.nombre;
  };

  const fetchTareas = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/limpieza`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
  // ...existing code...
        // El backend devuelve { success: true, data: [...] }
        // Mapear campos de la base de datos al formato del frontend
        const mappedTareas = (result.data || result || []).map((tarea: any) => ({
          ...tarea,
          descripcion: tarea.notas || tarea.descripcion,
          fecha_limite: tarea.proxima_fecha || tarea.fecha_limite,
          isVencida: new Date(tarea.proxima_fecha || tarea.fecha_limite) < new Date() && tarea.estado !== 'completada'
        }));
        setTareas(mappedTareas);
      } else if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente",
        });
        navigate('/login');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las tareas",
        });
        setTareas([]);
      }
    } catch (error) {
      console.error('Error fetching tareas:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al cargar las tareas",
      });
      setTareas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found for empleados');
        return;
      }
      
  // ...existing code...
      const response = await fetch(`${API_BASE_URL}/api/limpieza/empleados/disponibles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
  // ...existing code...
      
      if (response.ok) {
        const result = await response.json();
  // ...existing code...
        const empleadosData = result.data || result || [];
  // ...existing code...
        setEmpleados(empleadosData);
      } else {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        toast({
          variant: "destructive",
          title: "Error al cargar empleados",
          description: `Status: ${response.status} - No se pudieron cargar los empleados`,
        });
      }
    } catch (error) {
      console.error('Error fetching empleados:', error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor para obtener empleados",
      });
    }
  };

  const fetchAllEmpleados = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found for all empleados');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/empleados`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        const empleadosData = result.data || result || [];
        setAllEmpleados(empleadosData);
      } else {
        console.error('Error fetching all empleados:', response.status);
        setAllEmpleados([]);
      }
    } catch (error) {
      console.error('Error fetching all empleados:', error);
      setAllEmpleados([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await Promise.all([fetchTareas(), fetchEmpleados(), fetchAllEmpleados()]);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateTarea = async () => {
    try {
      const token = getToken();
      
      // Preparar datos, omitir encargado_id si está vacío
      const dataToSend: any = {
        area: formData.area,
        descripcion: formData.descripcion,
        estado: formData.estado,
        fecha_limite: formData.fecha_limite,
      };
      
      // Solo incluir encargado_id si tiene valor
      if (formData.encargado_id && formData.encargado_id !== '') {
        dataToSend.encargado_id = formData.encargado_id;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/limpieza`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast({
          title: "Tarea creada",
          description: "La tarea de limpieza fue creada exitosamente",
        });
        setDialogOpen(false);
        setFormData({
          area: '',
          descripcion: '',
          encargado_id: '',
          estado: 'pendiente',
          fecha_limite: '',
        });
        fetchTareas();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "No se pudo crear la tarea",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al crear la tarea",
      });
    }
  };

  const handleUpdateTarea = async () => {
    if (!editingTarea) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/limpieza/${editingTarea.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Tarea actualizada",
          description: "La tarea fue actualizada exitosamente",
        });
        setDialogOpen(false);
        setEditingTarea(null);
        setFormData({
          area: '',
          descripcion: '',
          encargado_id: '',
          estado: 'pendiente',
          fecha_limite: '',
        });
        fetchTareas();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar la tarea",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al actualizar la tarea",
      });
    }
  };

  const handleDeleteTarea = async () => {
    if (!deletingId) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/limpieza/${deletingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Tarea eliminada",
          description: "La tarea fue eliminada exitosamente",
        });
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchTareas();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la tarea",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar la tarea",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingTarea(null);
    setFormData({
      area: '',
      descripcion: '',
      encargado_id: '',
      estado: 'pendiente',
      fecha_limite: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (tarea: any) => {
    setEditingTarea(tarea);
    setFormData({
      area: tarea.area || '',
      descripcion: tarea.descripcion || tarea.notas || '',
      encargado_id: tarea.encargado_id?.toString() || '',
      estado: tarea.estado || 'pendiente',
      fecha_limite: (tarea.fecha_limite || tarea.proxima_fecha) ? (tarea.fecha_limite || tarea.proxima_fecha).split('T')[0] : '',
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (tarea: any) => {
    if (tarea.isVencida) {
      return <Badge className="bg-red-500">Vencida</Badge>;
    }
    switch (tarea.estado) {
      case 'pendiente':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'en_progreso':
        return <Badge className="bg-blue-500">En Progreso</Badge>;
      case 'completada':
        return <Badge className="bg-green-500">Completada</Badge>;
      default:
        return <Badge>{tarea.estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Limpieza</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTarea ? 'Editar Tarea' : 'Nueva Tarea de Limpieza'}
              </DialogTitle>
              <DialogDescription>
                {editingTarea ? 'Actualiza la información de la tarea' : 'Completa los datos de la nueva tarea'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="area">Área</Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) => setFormData({...formData, area: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jaulas">Jaulas</SelectItem>
                    <SelectItem value="sanitarios">Sanitarios</SelectItem>
                    <SelectItem value="jardines">Jardines</SelectItem>
                    <SelectItem value="area_juegos">Área de Juegos</SelectItem>
                    <SelectItem value="oficinas">Oficinas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe la tarea de limpieza"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="encargado_id">Encargado (Opcional)</Label>
                <Select
                  value={formData.encargado_id || 'none'}
                  onValueChange={(value) => setFormData({...formData, encargado_id: value === 'none' ? '' : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {empleados.length === 0 ? (
                      <SelectItem value="empty" disabled>Cargando empleados...</SelectItem>
                    ) : (
                      empleados.map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.nombre} - {emp.puesto || emp.cargo || 'Sin puesto'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData({...formData, estado: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha_limite">Fecha y Hora Límite</Label>
                <Input
                  id="fecha_limite"
                  type="datetime-local"
                  value={formData.fecha_limite}
                  onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={editingTarea ? handleUpdateTarea : handleCreateTarea}>
                {editingTarea ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="activas" className="w-full">
        <TabsList>
          <TabsTrigger value="activas">Tareas Activas</TabsTrigger>
          <TabsTrigger value="historial">Historial de Tareas</TabsTrigger>
        </TabsList>
        <TabsContent value="activas">
          <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Área</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Encargado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tareas.filter(t => !t.isVencida && t.estado !== 'completada').length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay tareas activas de limpieza
                </TableCell>
              </TableRow>
            ) : (
              tareas.filter(t => !t.isVencida && t.estado !== 'completada').map((tarea: any) => (
                <TableRow key={tarea.id}>
                  <TableCell className="font-medium">{tarea.area}</TableCell>
                  <TableCell>{tarea.descripcion}</TableCell>
                  <TableCell>
                    {getEmpleadoDisplayName(tarea)}
                  </TableCell>
                  <TableCell>{getStatusBadge(tarea)}</TableCell>
                  <TableCell>{new Date(tarea.fecha_limite).toLocaleString('es-ES')}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => openEditDialog(tarea)}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => openDeleteDialog(tarea.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
        </TabsContent>
        <TabsContent value="historial">
          <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Área</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Encargado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...tareas].sort((a: any, b: any) => new Date(b.fecha_limite).getTime() - new Date(a.fecha_limite).getTime()).map((tarea: any) => (
              <TableRow key={tarea.id}>
                <TableCell className="font-medium">{tarea.area}</TableCell>
                <TableCell>{tarea.descripcion}</TableCell>
                <TableCell>
                  {getEmpleadoDisplayName(tarea)}
                </TableCell>
                <TableCell>{getStatusBadge(tarea)}</TableCell>
                <TableCell>{new Date(tarea.fecha_limite).toLocaleString('es-ES')}</TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => openEditDialog(tarea)}
                    className="mr-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => openDeleteDialog(tarea.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tareas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No hay tareas de limpieza
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta tarea de limpieza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTarea}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
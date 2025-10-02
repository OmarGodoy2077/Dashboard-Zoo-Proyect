import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';
import { Loader2, Plus, Trash2, Edit, Users, DollarSign } from 'lucide-react';

interface Empleado {
  id: number;
  nombre: string;
  puesto: string;
  departamento?: string;
  salario: number;
  fecha_contratacion: string;
  estado: string;
  telefono?: string;
  email?: string;
}

export default function Empleados() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  
  // Filtros
  const [filtroPuesto, setFiltroPuesto] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    puesto: 'cuidador',
    salario: 0,
    fecha_contratacion: new Date().toISOString().split('T')[0],
    estado: 'activo',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones de estado en componente desmontado
    
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = getToken();
        
        // console.log('Token status:', token ? 'Token exists' : 'No token');
        
        if (!token) {
          console.error('No token found, redirecting to login');
          if (isMounted) {
            navigate('/login');
          }
          return;
        }

        let url = `${API_BASE_URL}/api/empleados?`;
        if (filtroPuesto && filtroPuesto !== 'todos') url += `puesto=${filtroPuesto}&`;
        if (filtroEstado && filtroEstado !== 'todos') url += `estado=${filtroEstado}&`;

        // console.log('Fetching empleados from:', url);
        // console.log('Using API_BASE_URL:', API_BASE_URL);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache', // Forzar respuesta fresca
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!isMounted) return;

      // Manejar 304 Not Modified - usar datos en caché del navegador
      if (response.status === 304) {
        // console.log('Respuesta 304 - usando caché, no hay datos nuevos');
        // No hacer nada, mantener datos actuales
        return;
      }

      if (!response.ok) {
        // Intentar parsear como JSON primero
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Error data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Si no es JSON, obtener como texto
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        console.error('Error response:', response.status, errorMessage);
        throw new Error(errorMessage);
      }

      // Intentar parsear la respuesta como JSON
      let data;
      try {
        data = await response.json();
        // console.log('Empleados data received:', data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Respuesta del servidor no válida');
      }
      
      if (!isMounted) return; // No actualizar si el componente se desmontó

      // Validar estructura de respuesta - backend devuelve { success: true, data: [...] }
      if (data && data.success && Array.isArray(data.data)) {
        setEmpleados(data.data);
      } else if (data && Array.isArray(data.data)) {
        setEmpleados(data.data);
      } else if (Array.isArray(data)) {
        setEmpleados(data);
      } else {
        console.warn('Formato de datos inesperado:', data);
        setEmpleados([]);
      }        
      setError(null);
      } catch (error: any) {
        console.error('Error fetching empleados:', error);
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (isMounted) {
          let errorMessage = 'Error al cargar empleados';
          
          // Detectar el tipo de error
          if (error.message === 'Failed to fetch') {
            errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000';
          } else if (error.name === 'TypeError') {
            errorMessage = 'Error de conexión con el servidor';
          } else {
            errorMessage = error.message || 'Error al cargar empleados';
          }
          
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Error de conexión",
            description: errorMessage,
          });
          setEmpleados([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup para evitar memory leaks
    };
  }, [filtroPuesto, filtroEstado, navigate, toast]);

  const fetchEmpleados = async () => {
    try {
      setError(null);
      setLoading(true);
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      let url = `${API_BASE_URL}/api/empleados?`;
      if (filtroPuesto && filtroPuesto !== 'todos') url += `puesto=${filtroPuesto}&`;
      if (filtroEstado && filtroEstado !== 'todos') url += `estado=${filtroEstado}&`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      // Manejar 304 Not Modified
      if (response.status === 304) {
        // console.log('Respuesta 304 - usando caché');
        return;
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Respuesta del servidor no válida');
      }
      
      if (data && data.success && Array.isArray(data.data)) {
        setEmpleados(data.data);
      } else if (data && Array.isArray(data.data)) {
        setEmpleados(data.data);
      } else if (Array.isArray(data)) {
        setEmpleados(data);
      } else {
        setEmpleados([]);
      }
      
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error al cargar empleados');
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los empleados",
      });
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const url = editingEmpleado 
        ? `${API_BASE_URL}/api/empleados/${editingEmpleado.id}`
        : `${API_BASE_URL}/api/empleados`;

      const response = await fetch(url, {
        method: editingEmpleado ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingEmpleado ? "Empleado actualizado" : "Empleado registrado",
          description: editingEmpleado 
            ? "El empleado se actualizó correctamente" 
            : "El empleado se registró exitosamente",
        });
        
        setOpenDialog(false);
        resetForm();
        fetchEmpleados();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el empleado",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/empleados/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Empleado eliminado",
          description: "El empleado se eliminó correctamente",
        });
        fetchEmpleados();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el empleado",
      });
    }
  };

  const handleEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      nombre: empleado.nombre,
      puesto: empleado.puesto,
      salario: empleado.salario,
      fecha_contratacion: empleado.fecha_contratacion,
      estado: empleado.estado,
      telefono: empleado.telefono || '',
      email: empleado.email || ''
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingEmpleado(null);
    setFormData({
      nombre: '',
      puesto: 'cuidador',
      salario: 0,
      fecha_contratacion: new Date().toISOString().split('T')[0],
      estado: 'activo',
      telefono: '',
      email: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => {
              setError(null);
              setLoading(true);
              fetchEmpleados();
            }} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const empleadosActivos = empleados.filter(e => e.estado === 'activo').length;
  const salarioPromedio = empleados.length > 0 
    ? empleados.reduce((sum, e) => sum + e.salario, 0) / empleados.length 
    : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Empleados</h1>
          <p className="text-muted-foreground">Gestión de personal del zoológico</p>
        </div>
        
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
              </DialogTitle>
              <DialogDescription>
                Complete los datos del empleado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="puesto">Puesto</Label>
                    <Select value={formData.puesto} onValueChange={(value) => setFormData({ ...formData, puesto: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cuidador">Cuidador</SelectItem>
                        <SelectItem value="veterinario">Veterinario</SelectItem>
                        <SelectItem value="guia">Guía</SelectItem>
                        <SelectItem value="limpieza">Limpieza</SelectItem>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="salario">Salario</Label>
                    <Input
                      id="salario"
                      type="number"
                      step="0.01"
                      value={formData.salario}
                      onChange={(e) => setFormData({ ...formData, salario: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fecha_contratacion">Fecha de Contratación</Label>
                    <Input
                      id="fecha_contratacion"
                      type="date"
                      value={formData.fecha_contratacion}
                      onChange={(e) => setFormData({ ...formData, fecha_contratacion: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="vacaciones">Vacaciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  {editingEmpleado ? 'Actualizar' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empleados.length}</div>
            <p className="text-xs text-muted-foreground">{empleadosActivos} activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salario Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${salarioPromedio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Por empleado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nómina Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${empleados.reduce((sum, e) => sum + e.salario, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Mensual</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Puesto</Label>
              <Select value={filtroPuesto} onValueChange={setFiltroPuesto}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="cuidador">Cuidador</SelectItem>
                  <SelectItem value="veterinario">Veterinario</SelectItem>
                  <SelectItem value="guia">Guía</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="vacaciones">Vacaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Empleados */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Empleados</CardTitle>
          <CardDescription>
            {empleados.length} {empleados.length === 1 ? 'empleado' : 'empleados'} registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Fecha Contratación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empleados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay empleados registrados
                  </TableCell>
                </TableRow>
              ) : (
                empleados.map((empleado) => (
                  <TableRow key={empleado.id}>
                    <TableCell className="font-medium">{empleado.nombre}</TableCell>
                    <TableCell className="capitalize">{empleado.puesto}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      ${empleado.salario.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(empleado.fecha_contratacion).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        empleado.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : empleado.estado === 'vacaciones'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {empleado.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(empleado)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(empleado.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

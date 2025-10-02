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
import { getToken, getUserRole } from '../utils/auth';
import { API_BASE_URL } from '../config/api';
import { Loader2, Plus, Trash2, Edit, Ticket, DollarSign } from 'lucide-react';

interface Entrada {
  id: number;
  tipo_ticket: string;
  precio_unitario: number;
  cantidad: number;
  total_venta: number;
  fecha_venta: string;
  metodo_pago: string;
  created_at?: string;
}

interface EstadisticasData {
  total_visitantes: number;
  total_ingresos: number;
  por_tipo_ticket: Record<string, { cantidad: number; ingresos: number }>;
  por_metodo_pago: Record<string, { cantidad: number; ingresos: number }>;
}

export default function Entradas() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntrada, setEditingEntrada] = useState<Entrada | null>(null);
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [formData, setFormData] = useState({
    tipo_ticket: 'Adulto',
    precio_unitario: 15.00,
    cantidad: 1,
    fecha_venta: new Date().toISOString().split('T')[0], // CORREGIDO: formato YYYY-MM-DD sin problemas de zona horaria
    metodo_pago: 'efectivo'
  });

  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones de estado en componente desmontado
    
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = getToken();
        
  // ...existing code...
        
        if (!token) {
          console.error('No token found, redirecting to login');
          if (isMounted) {
            navigate('/login');
          }
          return;
        }

        let url = `${API_BASE_URL}/api/entradas?`;
        if (filtroTipo && filtroTipo !== 'todos') url += `tipo_ticket=${filtroTipo}&`;
        if (filtroMetodo && filtroMetodo !== 'todos') url += `metodo_pago=${filtroMetodo}&`;
        if (filtroFecha) url += `fecha_venta=${filtroFecha}&`;

  // ...existing code...

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache', // Forzar respuesta fresca
          'Content-Type': 'application/json',
        },
      });

  // ...existing code...

      if (!isMounted) return;

      // Manejar 304 Not Modified - usar datos en caché del navegador
      if (response.status === 304) {
  // ...existing code...
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
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Respuesta del servidor no válida');
      }
      
      if (!isMounted) return; // No actualizar si el componente se desmontó

      // Validar estructura de respuesta - backend devuelve { success: true, data: [...] }
      if (data && data.success && Array.isArray(data.data)) {
  setEntradas(data.data);
      } else if (data && Array.isArray(data.data)) {
  setEntradas(data.data);
      } else if (Array.isArray(data)) {
  setEntradas(data);
      } else {
  setEntradas([]);
      }        
      setError(null);
      } catch (error: any) {
  // ...existing code...
        
        if (isMounted) {
          let errorMessage = 'Error al cargar entradas';
          
          // Detectar el tipo de error
          if (error.message === 'Failed to fetch') {
            errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000';
          } else if (error.name === 'TypeError') {
            errorMessage = 'Error de conexión con el servidor';
          } else {
            errorMessage = error.message || 'Error al cargar entradas';
          }
          
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Error de conexión",
            description: errorMessage,
          });
          setEntradas([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchEstadisticas = async () => {
      try {
        const token = getToken();
        if (!token || !isMounted) return;

        const response = await fetch(`${API_BASE_URL}/api/entradas/estadisticas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setEstadisticas(data.data || data);
          }
        } else {
          console.error('Error en respuesta de estadísticas:', response.status);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    fetchData();
    fetchEstadisticas();

    return () => {
      isMounted = false; // Cleanup para evitar memory leaks
    };
  }, [filtroTipo, filtroMetodo, filtroFecha, navigate, toast]);

  const fetchEntradas = async () => {
    try {
      setError(null);
      setLoading(true);
      const token = getToken();
      
  // ...existing code...
      
      if (!token) {
  // ...existing code...
        navigate('/login');
        return;
      }

      let url = `${API_BASE_URL}/api/entradas?`;
      if (filtroTipo && filtroTipo !== 'todos') url += `tipo_ticket=${filtroTipo}&`;
      if (filtroMetodo && filtroMetodo !== 'todos') url += `metodo_pago=${filtroMetodo}&`;
      if (filtroFecha) url += `fecha_venta=${filtroFecha}&`;

  // ...existing code...

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
      });

  // ...existing code...

      // Manejar 304 Not Modified
      if (response.status === 304) {
  // ...existing code...
        return;
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('fetchEntradas - Error data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('fetchEntradas - Error text:', errorText);
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
  setEntradas(data.data);
      } else if (data && Array.isArray(data.data)) {
  setEntradas(data.data);
      } else if (Array.isArray(data)) {
  setEntradas(data);
      } else {
  setEntradas([]);
      }
      
      setError(null);
  // ...existing code...
    } catch (error: any) {
      console.error('fetchEntradas - Error caught:', error);
      console.error('fetchEntradas - Error type:', error.constructor.name);
      console.error('fetchEntradas - Error message:', error.message);
      
      let errorMessage = 'Error al cargar entradas';
      
      // Detectar el tipo de error
      if (error.message === 'Failed to fetch') {
        errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Error de conexión con el servidor';
      } else {
        errorMessage = error.message || 'Error al cargar entradas';
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: errorMessage,
      });
      setEntradas([]);
    } finally {
  setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/entradas/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data.data || data);
      } else {
        console.error('Error en respuesta de estadísticas:', response.status);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
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

      const url = editingEntrada 
        ? `${API_BASE_URL}/api/entradas/${editingEntrada.id}`
        : `${API_BASE_URL}/api/entradas`;

      const response = await fetch(url, {
        method: editingEntrada ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingEntrada ? "Entrada actualizada" : "Entrada registrada",
          description: editingEntrada 
            ? "La entrada se actualizó correctamente" 
            : "La venta se registró exitosamente",
        });
        
        setOpenDialog(false);
        resetForm();
        fetchEntradas();
        fetchEstadisticas();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la entrada",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta entrada?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/entradas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Entrada eliminada",
          description: "La entrada se eliminó correctamente",
        });
        fetchEntradas();
        fetchEstadisticas();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la entrada",
      });
    }
  };

  const handleEdit = (entrada: Entrada) => {
    setEditingEntrada(entrada);
    setFormData({
      tipo_ticket: entrada.tipo_ticket,
      precio_unitario: entrada.precio_unitario,
      cantidad: entrada.cantidad,
      fecha_venta: entrada.fecha_venta,
      metodo_pago: entrada.metodo_pago,
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingEntrada(null);
    setFormData({
      tipo_ticket: 'Adulto',
      precio_unitario: 15.00,
      cantidad: 1,
      fecha_venta: new Date().toISOString().split('T')[0], // CORREGIDO: formato YYYY-MM-DD sin problemas de zona horaria
      metodo_pago: 'efectivo'
    });
  };

  const handleTipoTicketChange = (value: string) => {
    const precios: Record<string, number> = {
      'Adulto': 15.00,
      'Niño': 8.00,
      'Adulto Mayor': 10.00,
      'Estudiante': 12.00
    };
    
    setFormData({
      ...formData,
      tipo_ticket: value,
      precio_unitario: precios[value] || 15.00
    });
  };

  const calcularTotal = () => {
    return (formData.precio_unitario * formData.cantidad).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando entradas...</p>
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
              fetchEntradas();
            }} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Entradas y Visitantes</h1>
          <p className="text-muted-foreground">Gestión de ventas de tickets y estadísticas</p>
        </div>
        
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEntrada ? 'Editar Entrada' : 'Registrar Nueva Venta'}
              </DialogTitle>
              <DialogDescription>
                Complete los datos de la venta de tickets
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo_ticket">Tipo de Ticket</Label>
                  <Select value={formData.tipo_ticket} onValueChange={handleTipoTicketChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adulto">Adulto ($15.00)</SelectItem>
                      <SelectItem value="Niño">Niño ($8.00)</SelectItem>
                      <SelectItem value="Adulto Mayor">Adulto Mayor ($10.00)</SelectItem>
                      <SelectItem value="Estudiante">Estudiante ($12.00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="precio_unitario">Precio Unitario</Label>
                    <Input
                      id="precio_unitario"
                      type="number"
                      step="0.01"
                      value={formData.precio_unitario}
                      onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Total a Pagar</Label>
                  <div className="text-2xl font-bold text-green-600">
                    ${calcularTotal()}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="metodo_pago">Método de Pago</Label>
                  <Select value={formData.metodo_pago} onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fecha_venta">Fecha de Venta</Label>
                  <Input
                    id="fecha_venta"
                    type="date"
                    value={formData.fecha_venta}
                    onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
                    required
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
                  {editingEntrada ? 'Actualizar' : 'Registrar Venta'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Visitantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_visitantes || 0}</div>
              <p className="text-xs text-muted-foreground">Todos los registros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(estadisticas.total_ingresos || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Ventas generadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {estadisticas.por_tipo_ticket && Object.keys(estadisticas.por_tipo_ticket).length > 0 ? (
                Object.entries(estadisticas.por_tipo_ticket).map(([tipo, data]) => (
                  <div key={tipo} className="text-sm">
                    {tipo}: {data.cantidad}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Sin datos</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              {estadisticas.por_metodo_pago && Object.keys(estadisticas.por_metodo_pago).length > 0 ? (
                Object.entries(estadisticas.por_metodo_pago).map(([metodo, data]) => (
                  <div key={metodo} className="text-sm capitalize">
                    {metodo}: ${data.ingresos.toFixed(2)}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Sin datos</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Ticket</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Adulto">Adulto</SelectItem>
                  <SelectItem value="Niño">Niño</SelectItem>
                  <SelectItem value="Adulto Mayor">Adulto Mayor</SelectItem>
                  <SelectItem value="Estudiante">Estudiante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Método de Pago</Label>
              <Select value={filtroMetodo} onValueChange={setFiltroMetodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Entradas */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Entradas</CardTitle>
          <CardDescription>
            {entradas.length} {entradas.length === 1 ? 'registro' : 'registros'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay entradas registradas
                  </TableCell>
                </TableRow>
              ) : (
                entradas.map((entrada) => {
                  // CORREGIDO: Formatear fecha correctamente sin problemas de zona horaria
                  // Si la fecha es "2025-10-02", debe mostrar "2/10/2025" sin restar días
                  const formatearFecha = (fechaStr: string) => {
                    if (!fechaStr) return 'N/A';
                    // Tomar solo la parte de la fecha (YYYY-MM-DD) y dividirla
                    const [year, month, day] = fechaStr.split('T')[0].split('-');
                    return `${parseInt(day)}/${parseInt(month)}/${year}`;
                  };
                  
                  return (
                    <TableRow key={entrada.id}>
                      <TableCell>
                        {formatearFecha(entrada.fecha_venta)}
                      </TableCell>
                      <TableCell className="font-medium">{entrada.tipo_ticket}</TableCell>
                      <TableCell>${entrada.precio_unitario.toFixed(2)}</TableCell>
                      <TableCell>{entrada.cantidad}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${entrada.total_venta.toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">{entrada.metodo_pago}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(entrada)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(entrada.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )
}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


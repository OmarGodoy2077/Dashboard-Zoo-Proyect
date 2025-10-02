import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getToken, getUserRole } from '../utils/auth';
import { Loader2, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function RRHH() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vacaciones, setVacaciones] = useState([]);
  const [inasistencias, setInasistencias] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [bonos, setBonos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (endpoint: string, setter: Function) => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/rrhh/${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setter(data.data || data || []);
        } else {
          if (response.status === 401) {
            toast({
              variant: "destructive",
              title: "Sesión expirada",
              description: "Por favor, inicia sesión nuevamente",
            });
            navigate('/login');
          } else {
            console.error(`Failed to fetch ${endpoint}`);
            setter([]); // Set empty array on error
          }
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        setter([]); // Set empty array on error
      }
    };

    const fetchEmpleados = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/empleados`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setEmpleados(data.data || data || []);
        } else {
          setEmpleados([]);
        }
      } catch (error) {
        console.error('Error fetching empleados:', error);
        setEmpleados([]);
      }
    };

    // Set user role
    setUserRole(getUserRole());

    Promise.all([
      fetchData('vacaciones', setVacaciones),
      fetchData('inasistencias', setInasistencias),
      fetchData('descuentos', setDescuentos),
      fetchData('bonos', setBonos),
      fetchEmpleados(),
    ]).finally(() => setLoading(false));
  }, [navigate, toast]);

  const handleDelete = async (endpoint: string, id: number, refetch: Function) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/rrhh/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Eliminado",
          description: "El registro ha sido eliminado exitosamente",
        });
        refetch();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el registro",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar",
      });
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
        <h1 className="text-3xl font-bold">Gestión de Recursos Humanos</h1>
        <Button onClick={() => navigate('/empleados')} variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Ver Empleados
        </Button>
      </div>
      {userRole !== 'admin' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-yellow-800">
            Solo los administradores pueden gestionar registros de RRHH.
          </p>
        </div>
      )}
      <Tabs defaultValue="vacaciones">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vacaciones">Vacaciones</TabsTrigger>
          <TabsTrigger value="inasistencias">Inasistencias</TabsTrigger>
          <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
          <TabsTrigger value="bonos">Bonos</TabsTrigger>
        </TabsList>
        <TabsContent value="vacaciones">
          <RRHHTable 
            title="Vacaciones" 
            data={vacaciones} 
            columns={['empleado_id', 'fecha_inicio', 'fecha_fin', 'estado']}
            columnLabels={['Empleado', 'Fecha Inicio', 'Fecha Fin', 'Estado']}
            endpoint="vacaciones"
            empleados={empleados}
            userRole={userRole}
            onDelete={(id) => handleDelete('vacaciones', id, () => {
              const token = getToken();
              fetch(`${API_BASE_URL}/api/rrhh/vacaciones`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json()).then(d => setVacaciones(d.data || d || []));
            })}
            onRefetch={() => {
              const token = getToken();
              fetch(`${API_BASE_URL}/api/rrhh/vacaciones`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json()).then(d => setVacaciones(d.data || d || []));
            }}
          />
        </TabsContent>
        <TabsContent value="inasistencias">
          <RRHHTable 
            title="Inasistencias" 
            data={inasistencias} 
            columns={['empleado_id', 'fecha', 'tipo', 'justificado']}
            columnLabels={['Empleado', 'Fecha', 'Tipo', 'Justificado']}
            endpoint="inasistencias"
            empleados={empleados}
            userRole={userRole}
            onDelete={(id) => handleDelete('inasistencias', id, () => {
              const token = getToken();
              fetch(`${API_BASE_URL}/api/rrhh/inasistencias`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json()).then(d => setInasistencias(d.data || d || []));
            })}
            onRefetch={() => {
              const token = getToken();
              fetch(`${API_BASE_URL}/api/rrhh/inasistencias`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json()).then(d => setInasistencias(d.data || d || []));
            }}
          />
        </TabsContent>
        <TabsContent value="descuentos">
          <RRHHTable 
            title="Descuentos" 
            data={descuentos} 
            columns={['empleado_id', 'monto', 'motivo', 'fecha']}
            columnLabels={['Empleado', 'Monto', 'Motivo', 'Fecha']}
            endpoint="descuentos"
            empleados={empleados}
            userRole={userRole}
            onDelete={(id) => handleDelete('descuentos', id, () => {
              const token = getToken();
              fetch(`${API_BASE_URL}/api/rrhh/descuentos`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json()).then(d => setDescuentos(d.data || d || []));
            })}
            onRefetch={() => {
              const token = getToken();
              fetch(`${API_BASE_URL}/api/rrhh/descuentos`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json()).then(d => setDescuentos(d.data || d || []));
            }}
          />
        </TabsContent>
        <TabsContent value="bonos">
          <RRHHTable 
            title="Bonos" 
            data={bonos} 
            columns={['empleado_id', 'monto', 'motivo', 'fecha']}
            columnLabels={['Empleado', 'Monto', 'Motivo', 'Fecha']}
            endpoint="bonos"
            empleados={empleados}
            userRole={userRole}
            onDelete={(id) => handleDelete('bonos', id, () => {
              const token = getToken();
              fetch(`${API_BASE_URL}/api/rrhh/bonos`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json()).then(d => setBonos(d.data || d || []));
            })}
            onRefetch={() => {
              const token = getToken();
              fetch(`${API_BASE_URL}/api/rrhh/bonos`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json()).then(d => setBonos(d.data || d || []));
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RRHHTableProps {
  title: string;
  data: any[];
  columns: string[];
  columnLabels: string[];
  endpoint: string;
  empleados: any[];
  userRole: string | null;
  onDelete: (id: number) => void;
  onRefetch: () => void;
}

function RRHHTable({ title, data, columns, columnLabels, endpoint, empleados, userRole, onDelete, onRefetch }: RRHHTableProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const handleCreate = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/rrhh/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Creado",
          description: `${title} creado exitosamente`,
        });
        setDialogOpen(false);
        setFormData({});
        onRefetch(); // Refresh data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear el registro",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al crear",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/rrhh/${endpoint}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Actualizado",
          description: `${title} actualizado exitosamente`,
        });
        setDialogOpen(false);
        setEditingItem(null);
        setFormData({});
        onRefetch(); // Refresh data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar el registro",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al actualizar",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({});
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    const newFormData: any = {};
    columns.forEach(col => {
      if (col === 'empleado_id') {
        newFormData[col] = item[col].toString();
      } else {
        newFormData[col] = item[col];
      }
    });
    setFormData(newFormData);
    setDialogOpen(true);
  };

  const getEmpleadoNombre = (id: number) => {
    const empleado = empleados.find(emp => emp.id === id);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : `ID: ${id}`;
  };

  const formatValue = (value: any, label: string, col: string) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (label.toLowerCase().includes('fecha')) {
      return new Date(value).toLocaleDateString('es-ES');
    }
    if (label.toLowerCase().includes('monto')) {
      return `$${Number(value).toFixed(2)}`;
    }
    if (col === 'empleado_id') {
      return getEmpleadoNombre(value);
    }
    return value;
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {userRole === 'admin' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Añadir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? `Editar ${title}` : `Nuevo ${title}`}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Actualiza la información' : 'Completa los datos'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {columns.map((col, idx) => (
                  <div key={col} className="grid gap-2">
                    <Label htmlFor={col}>{columnLabels[idx]}</Label>
                    {col === 'empleado_id' ? (
                      <Select
                        value={formData[col]?.toString() || ''}
                        onValueChange={(value) => setFormData({...formData, [col]: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un empleado" />
                        </SelectTrigger>
                        <SelectContent>
                          {empleados.map((emp: any) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.nombre} {emp.apellido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : col === 'estado' && endpoint === 'vacaciones' ? (
                      <Select
                        value={formData[col] || ''}
                        onValueChange={(value) => setFormData({...formData, [col]: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solicitada">Solicitada</SelectItem>
                          <SelectItem value="aprobada">Aprobada</SelectItem>
                          <SelectItem value="rechazada">Rechazada</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : col === 'justificado' ? (
                      <Select
                        value={formData[col] ? 'Sí' : 'No'}
                        onValueChange={(value) => setFormData({...formData, [col]: value === 'Sí'})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sí">Sí</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={col}
                        type={col.includes('fecha') ? 'date' : col.includes('monto') ? 'number' : 'text'}
                        value={formData[col] || ''}
                        onChange={(e) => setFormData({...formData, [col]: e.target.value})}
                      />
                    )}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={editingItem ? handleUpdate : handleCreate}>
                  {editingItem ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columnLabels.map(label => <TableHead key={label}>{label}</TableHead>)}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnLabels.length + 1} className="text-center text-muted-foreground">
                  No hay registros
                </TableCell>
              </TableRow>
            ) : (
              data.map((item: any) => (
                <TableRow key={item.id}>
                  {columns.map((col, idx) => (
                    <TableCell key={col}>
                      {formatValue(item[col], columnLabels[idx], col)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    {userRole === 'admin' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente este registro.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDelete(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
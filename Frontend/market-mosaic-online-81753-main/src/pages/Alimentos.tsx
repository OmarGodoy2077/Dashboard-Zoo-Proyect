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
import { Card } from "@/components/ui/card";
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
import { getToken } from '../utils/auth';
import { Loader2, Plus, Pencil, Trash2, Package } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface Alimento {
  id: number;
  nombre: string;
  tipo: string;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  proveedor?: string;
  precio_unitario?: number;
}

export default function Alimentos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAlimento, setEditingAlimento] = useState<Alimento | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'vegetal',
    stock_actual: 0,
    stock_minimo: 0,
    unidad_medida: 'kg',
    proveedor: '',
    precio_unitario: 0,
  });

  useEffect(() => {
    fetchAlimentos();
  }, []);

  const fetchAlimentos = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/alimentos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlimentos(data.data || data || []);
      } else {
        if (response.status === 401) {
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
            description: "No se pudieron cargar los alimentos",
          });
          setAlimentos([]);
        }
      }
    } catch (error) {
      console.error('Error fetching alimentos:', error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
      });
      setAlimentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      const url = editingAlimento
        ? `${API_BASE_URL}/api/alimentos/${editingAlimento.id}`
        : `${API_BASE_URL}/api/alimentos`;
      
      const method = editingAlimento ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: editingAlimento ? "Alimento actualizado" : "Alimento creado",
          description: `El alimento ${formData.nombre} ha sido ${editingAlimento ? 'actualizado' : 'creado'} exitosamente`,
        });
        setDialogOpen(false);
        resetForm();
        fetchAlimentos();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "No se pudo guardar el alimento",
        });
      }
    } catch (error) {
      console.error('Error saving alimento:', error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/alimentos/${deletingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: "Alimento eliminado",
          description: "El alimento ha sido eliminado exitosamente",
        });
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchAlimentos();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el alimento",
        });
      }
    } catch (error) {
      console.error('Error deleting alimento:', error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'vegetal',
      stock_actual: 0,
      stock_minimo: 0,
      unidad_medida: 'kg',
      proveedor: '',
      precio_unitario: 0,
    });
    setEditingAlimento(null);
  };

  const openEditDialog = (alimento: Alimento) => {
    setEditingAlimento(alimento);
    setFormData({
      nombre: alimento.nombre,
      tipo: alimento.tipo,
      stock_actual: alimento.stock_actual,
      stock_minimo: alimento.stock_minimo,
      unidad_medida: alimento.unidad_medida,
      proveedor: alimento.proveedor || '',
      precio_unitario: alimento.precio_unitario || 0,
    });
    setDialogOpen(true);
  };

  const getStockBadgeVariant = (stock: number, minimo: number): "default" | "destructive" | "outline" | "secondary" => {
    if (stock === 0) return 'destructive';
    if (stock <= minimo) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Alimentos</h1>
          <p className="text-muted-foreground">Control de inventario de alimentos para animales</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Alimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAlimento ? 'Editar Alimento' : 'Agregar Nuevo Alimento'}
              </DialogTitle>
              <DialogDescription>
                {editingAlimento
                  ? 'Actualiza la información del alimento'
                  : 'Completa el formulario para agregar un nuevo alimento'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetal">Vegetal</SelectItem>
                      <SelectItem value="carne">Carne</SelectItem>
                      <SelectItem value="fruta">Fruta</SelectItem>
                      <SelectItem value="grano">Grano</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stock_actual">Stock Actual</Label>
                    <Input
                      id="stock_actual"
                      type="number"
                      min="0"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({ ...formData, stock_actual: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                    <Input
                      id="stock_minimo"
                      type="number"
                      min="0"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData({ ...formData, stock_minimo: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unidad_medida">Unidad de Medida</Label>
                  <Select value={formData.unidad_medida} onValueChange={(value) => setFormData({ ...formData, unidad_medida: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                      <SelectItem value="lb">Libras (lb)</SelectItem>
                      <SelectItem value="unidad">Unidades</SelectItem>
                      <SelectItem value="litro">Litros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="proveedor">Proveedor (opcional)</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="precio_unitario">Precio Unitario (opcional)</Label>
                  <Input
                    id="precio_unitario"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_unitario}
                    onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAlimento ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {alimentos.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay alimentos registrados</h3>
            <p className="text-muted-foreground">Comienza agregando el primer alimento al inventario</p>
          </div>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Stock Mínimo</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alimentos.map((alimento) => (
                <TableRow key={alimento.id}>
                  <TableCell className="font-medium">{alimento.nombre}</TableCell>
                  <TableCell className="capitalize">{alimento.tipo}</TableCell>
                  <TableCell>{alimento.stock_actual} {alimento.unidad_medida}</TableCell>
                  <TableCell>{alimento.stock_minimo} {alimento.unidad_medida}</TableCell>
                  <TableCell>{alimento.unidad_medida}</TableCell>
                  <TableCell>
                    <Badge variant={getStockBadgeVariant(alimento.stock_actual, alimento.stock_minimo)}>
                      {alimento.stock_actual === 0 ? 'Sin Stock' : 
                       alimento.stock_actual <= alimento.stock_minimo ? 'Stock Bajo' : 'Stock OK'}
                    </Badge>
                  </TableCell>
                  <TableCell>{alimento.proveedor || '-'}</TableCell>
                  <TableCell>${alimento.precio_unitario?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(alimento)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={deleteDialogOpen && deletingId === alimento.id} onOpenChange={(open) => {
                        setDeleteDialogOpen(open);
                        if (!open) setDeletingId(null);
                      }}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(alimento.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente el alimento "{alimento.nombre}" del inventario.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

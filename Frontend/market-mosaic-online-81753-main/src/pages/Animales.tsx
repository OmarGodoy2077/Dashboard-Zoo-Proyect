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
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface Animal {
  id: number;
  nombre: string;
  especie: string;
  estado_salud: string;
  fecha_nacimiento: string;
  habitat?: string;
}

export default function Animales() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    estado_salud: 'sano',
    fecha_nacimiento: '',
    habitat: '',
  });

  useEffect(() => {
    setUserRole(getUserRole());
    fetchAnimales();
  }, []);

  const fetchAnimales = async () => {
    setLoading(true);
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
            description: "No se pudieron cargar los animales",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
      });
      console.error('Error fetching animales:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      especie: '',
      estado_salud: 'sano',
      fecha_nacimiento: '',
      habitat: '',
    });
  };

  const handleCreate = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/animales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Animal creado",
          description: "El animal ha sido registrado exitosamente",
        });
        setDialogOpen(false);
        resetForm();
        fetchAnimales();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "No se pudo crear el animal",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al crear el animal",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingAnimal) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/animales/${editingAnimal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Animal actualizado",
          description: "Los datos del animal han sido actualizados",
        });
        setDialogOpen(false);
        setEditingAnimal(null);
        resetForm();
        fetchAnimales();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "No se pudo actualizar el animal",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al actualizar el animal",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/animales/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Animal eliminado",
          description: "El animal ha sido eliminado del sistema",
        });
        fetchAnimales();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "No se pudo eliminar el animal",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar el animal",
      });
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingAnimal(null);
    setDialogOpen(true);
  };

  const openEditDialog = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData({
      nombre: animal.nombre,
      especie: animal.especie,
      estado_salud: animal.estado_salud,
      fecha_nacimiento: animal.fecha_nacimiento.split('T')[0],
      habitat: animal.habitat || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnimal) {
      handleUpdate();
    } else {
      handleCreate();
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
        <h1 className="text-3xl font-bold">Gestión de Animales</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Animal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAnimal ? 'Editar Animal' : 'Nuevo Animal'}
              </DialogTitle>
              <DialogDescription>
                {editingAnimal 
                  ? 'Actualiza la información del animal' 
                  : 'Registra un nuevo animal en el sistema'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="especie">Especie</Label>
                  <Input
                    id="especie"
                    value={formData.especie}
                    onChange={(e) => setFormData({...formData, especie: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estado_salud">Estado de Salud</Label>
                  <Select 
                    value={formData.estado_salud} 
                    onValueChange={(value) => setFormData({...formData, estado_salud: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sano">Sano</SelectItem>
                      <SelectItem value="en observacion">En Observación</SelectItem>
                      <SelectItem value="enfermo">Enfermo</SelectItem>
                      <SelectItem value="critico">Crítico</SelectItem>
                      <SelectItem value="en tratamiento">En Tratamiento</SelectItem>
                      <SelectItem value="recuperacion">En Recuperación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="habitat">Hábitat</Label>
                  <Input
                    id="habitat"
                    value={formData.habitat}
                    onChange={(e) => setFormData({...formData, habitat: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingAnimal ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Estado de Salud</TableHead>
              <TableHead>Fecha de Nacimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay animales registrados
                </TableCell>
              </TableRow>
            ) : (
              animales.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.nombre}</TableCell>
                  <TableCell>{animal.especie}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      animal.estado_salud === 'sano' || animal.estado_salud === 'saludable'
                        ? 'bg-green-100 text-green-700' 
                        : animal.estado_salud === 'enfermo' || animal.estado_salud === 'critico'
                        ? 'bg-red-100 text-red-700'
                        : animal.estado_salud === 'en tratamiento'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {animal.estado_salud}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(animal.fecha_nacimiento).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => openEditDialog(animal)}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {userRole === 'admin' || userRole === 'veterinario' ? (
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
                              Esta acción no se puede deshacer. Se eliminará permanentemente el animal "{animal.nombre}" del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(animal.id)} className="bg-red-600 hover:bg-red-700">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
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

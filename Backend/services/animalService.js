// Servicio de animales para Jungle Planet Zoo Management System

const { supabase } = require('../config/database');

const getAllAnimales = async () => {
  const { data, error } = await supabase
    .from('animales')
    .select('*')
    .order('nombre');
  
  if (error) throw error;
  return data || [];
};

const getAnimalById = async (id) => {
  const { data, error } = await supabase
    .from('animales')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const createAnimal = async (animalData) => {
  const { nombre, especie, habitat, dieta, veterinario_id, fecha_nacimiento, sexo, peso, altura, observaciones } = animalData;
  
  const { data, error } = await supabase
    .from('animales')
    .insert([{
      nombre,
      especie,
      habitat,
      dieta,
      veterinario_id,
      fecha_nacimiento,
      sexo,
      peso,
      altura,
      observaciones
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

const updateAnimal = async (id, animalData) => {
  const { nombre, especie, habitat, dieta, veterinario_id, estado_salud, fecha_nacimiento, sexo, peso, altura, observaciones } = animalData;
  
  const updateData = {
    fecha_actualizacion: new Date().toISOString()
  };
  
  if (nombre !== undefined) updateData.nombre = nombre;
  if (especie !== undefined) updateData.especie = especie;
  if (habitat !== undefined) updateData.habitat = habitat;
  if (dieta !== undefined) updateData.dieta = dieta;
  if (veterinario_id !== undefined) updateData.veterinario_id = veterinario_id;
  if (estado_salud !== undefined) updateData.estado_salud = estado_salud;
  if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento;
  if (sexo !== undefined) updateData.sexo = sexo;
  if (peso !== undefined) updateData.peso = peso;
  if (altura !== undefined) updateData.altura = altura;
  if (observaciones !== undefined) updateData.observaciones = observaciones;
  
  const { data, error } = await supabase
    .from('animales')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

const deleteAnimal = async (id) => {
  const { data, error } = await supabase
    .from('animales')
    .delete()
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Funciones específicas para reportes
const getAnimalesEnfermosRecientes = async () => {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - 7);
  
  const { data: animales, error } = await supabase
    .from('animales')
    .select('*, veterinario:empleados(nombre)')
    .eq('estado_salud', 'enfermo')
    .gte('fecha_actualizacion', fechaLimite.toISOString())
    .order('fecha_actualizacion', { ascending: false });
  
  if (error) throw error;
  
  return animales?.map(a => ({
    ...a,
    nombre_veterinario: a.veterinario?.nombre || null
  })) || [];
};

const getAnimalesPorEspecie = async () => {
  const { data: animales, error } = await supabase
    .from('animales')
    .select('especie');
  
  if (error) throw error;
  
  // Agrupar por especie
  const especiesCount = {};
  animales?.forEach(animal => {
    const especie = animal.especie || 'sin_especificar';
    especiesCount[especie] = (especiesCount[especie] || 0) + 1;
  });
  
  return Object.keys(especiesCount)
    .map(especie => ({
      especie,
      cantidad: especiesCount[especie]
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
};

module.exports = {
  getAllAnimales,
  getAnimalById,
  createAnimal,
  updateAnimal,
 deleteAnimal,
  getAnimalesEnfermosRecientes,
  getAnimalesPorEspecie
};
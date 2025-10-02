const animalService = require('../services/animalService');

const getAllAnimales = async (req, res) => {
  try {
    const animales = await animalService.getAllAnimales();
    res.json(animales);
  } catch (error) {
    console.error('Error obteniendo animales:', error);
    res.status(500).json({ message: 'Error obteniendo la lista de animales' });
  }
};

const getAnimalById = async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await animalService.getAnimalById(id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    
    res.json(animal);
  } catch (error) {
    console.error('Error obteniendo animal:', error);
    res.status(500).json({ message: 'Error obteniendo el animal' });
  }
};

const createAnimal = async (req, res) => {
  try {
    const animal = await animalService.createAnimal(req.body);
    res.status(201).json(animal);
  } catch (error) {
    console.error('Error creando animal:', error);
    res.status(500).json({ message: 'Error creando el animal' });
  }
};

const updateAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await animalService.updateAnimal(id, req.body);
    
    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    
    res.json(animal);
  } catch (error) {
    console.error('Error actualizando animal:', error);
    res.status(500).json({ message: 'Error actualizando el animal' });
  }
};

const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await animalService.deleteAnimal(id);
    
    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    
    res.json({ message: 'Animal eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando animal:', error);
    res.status(500).json({ message: 'Error eliminando el animal' });
  }
};

// Funciones para reportes
const getAnimalesEnfermosRecientes = async (req, res) => {
  try {
    const animales = await animalService.getAnimalesEnfermosRecientes();
    res.json(animales);
  } catch (error) {
    console.error('Error obteniendo animales enfermos recientes:', error);
    res.status(500).json({ message: 'Error obteniendo reporte de animales enfermos' });
  }
};

const getAnimalesPorEspecie = async (req, res) => {
  try {
    const animales = await animalService.getAnimalesPorEspecie();
    res.json(animales);
  } catch (error) {
    console.error('Error obteniendo animales por especie:', error);
    res.status(500).json({ message: 'Error obteniendo reporte de animales por especie' });
  }
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
// src/views/ProyectosView.jsx (COMPLETO Y FINAL)

import React, { useContext, useState, useMemo } from 'react';
import AppContext from '../context/AppContext';
import ProyectoCard from '../components/ProyectoCard';
import { FiArrowLeft, FiPlus, FiSearch, FiFilter, FiStar } from 'react-icons/fi';

const ProyectosView = () => {
  const { projects, addProject } = useContext(AppContext);
  const [newProjectName, setNewProjectName] = useState('');

  // --- ESTADOS PARA LOS FILTROS ---
  const [searchQuery, setSearchQuery] = useState('');
  // Opciones: 'activos', 'archivados', 'todos'
  const [statusFilter, setStatusFilter] = useState('activos'); 

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddProject();
    }
  };

  const handleGoBack = () => {
    // Cierra la ventana de Electron
    window.close();
  };

  // --- LÓGICA DE FILTRADO Y ORDENACIÓN ---
  const filteredAndSortedProjects = useMemo(() => {
    let tempProjects = projects.map(p => ({ ...p, createdAt: p.createdAt || p.id }));

    // 1. Filtrar por estado
    if (statusFilter === 'activos') {
      tempProjects = tempProjects.filter(p => p.status !== 'archivado');
    } else if (statusFilter === 'archivados') {
      tempProjects = tempProjects.filter(p => p.status === 'archivado');
    }
    // Si es 'todos', no se aplica filtro de estado.

    // 2. Filtrar por búsqueda de texto
    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      tempProjects = tempProjects.filter(p => 
        (p.name || '').toLowerCase().includes(lowercasedQuery) ||
        (p.description || '').toLowerCase().includes(lowercasedQuery) ||
        (p.tasks || []).some(t => (t.title || '').toLowerCase().includes(lowercasedQuery))
      );
    }
    
    // 3. Ordenar: los predeterminados primero, luego por fecha de creación descendente
    return tempProjects.sort((a, b) => (b.isDefault - a.isDefault) || (b.createdAt - a.createdAt));
  }, [projects, searchQuery, statusFilter]);

  const defaultProject = useMemo(() => filteredAndSortedProjects.find(p => p.isDefault), [filteredAndSortedProjects]);
  const otherProjects = useMemo(() => filteredAndSortedProjects.filter(p => !p.isDefault), [filteredAndSortedProjects]);

  return (
    <div className="min-h-screen animated-gradient-background text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado y Navegación */}
        <div className="flex items-center justify-between mb-6">
            <button onClick={handleGoBack} className="flex items-center gap-2 text-blue-400 hover:text-blue-500 transition-colors text-sm">
                <FiArrowLeft />
                Volver al widget
            </button>
        </div>
        <h1 className="text-3xl font-bold text-white">Administrar Proyectos</h1>
        <p className="text-zinc-400 mt-1 mb-6">Agrega nuevos proyectos, gestiona tareas y elige tu proyecto por defecto.</p>

        {/* Formulario para Añadir Nuevo Proyecto */}
        <div className="flex flex-col sm:flex-row gap-2 mb-8 p-4 bg-black/20 rounded-xl border border-white/10">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del nuevo proyecto..."
            className="flex-grow bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddProject}
            className="flex items-center justify-center gap-2 bg-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-zinc-600 disabled:opacity-70 transition-colors"
            disabled={!newProjectName.trim()}
          >
            <FiPlus />
            <span>Agregar</span>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 p-3 bg-black/20 rounded-xl border border-white/10">
          <div className="relative w-full sm:flex-grow">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por proyecto, tarea o descripción..."
              className="bg-zinc-800 text-sm w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg">
            <button onClick={() => setStatusFilter('activos')} className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === 'activos' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Activos</button>
            <button onClick={() => setStatusFilter('archivados')} className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === 'archivados' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Archivados</button>
            <button onClick={() => setStatusFilter('todos')} className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === 'todos' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Todos</button>
          </div>
        </div>
        
        {/* Contenido Principal: Lista de Proyectos */}
        <div className="space-y-6">
          {/* Renderizado condicional basado en la lista filtrada */}
          {filteredAndSortedProjects.length > 0 ? (
            <>
              {/* Sección para el proyecto predeterminado (si existe y no está filtrado) */}
              {defaultProject && (
                <div>
                  <h2 className='flex items-center gap-2 text-sm font-semibold text-yellow-400 mb-2 px-1'>
                      <FiStar size={14}/> En Foco
                  </h2>
                  <ProyectoCard project={defaultProject} isFeatured={true} />
                </div>
              )}
              
              {/* Sección para otros proyectos */}
              {otherProjects.length > 0 && (
                <div>
                  {defaultProject && ( // Solo muestra este título si ya hay un proyecto destacado
                    <h2 className='text-sm font-semibold text-zinc-400 mb-2 px-1'>
                      Otros Proyectos
                    </h2>
                  )}
                  <div className="space-y-4">
                    {otherProjects.map(p => (
                      <ProyectoCard key={p.id} project={p} isFeatured={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Mensaje cuando los filtros no devuelven resultados
            <div className="text-center py-16 text-zinc-500 border-2 border-dashed border-zinc-700 rounded-xl">
              <FiFilter size={48} className="mx-auto mb-4"/>
              <h3 className="text-xl font-semibold">No se encontraron proyectos</h3>
              <p className="mt-1">Intenta ajustar los filtros o la búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProyectosView;
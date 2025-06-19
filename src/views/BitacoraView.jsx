import React, { useState, useMemo, useContext } from 'react';
import AppContext from '../context/AppContext';
import AddEventForm from '../components/AddEventForm';
import ModalConfirmacion from '../components/ModalConfirmacion';
import { 
  FiFileText, FiFlag, FiAlertTriangle, FiCheckCircle, FiMoreVertical, 
  FiFilter, FiSearch, FiArrowDown, FiArrowUp, FiX, FiEdit, FiTrash2, FiPlus
} from 'react-icons/fi';

// --- OBJETOS DE CONFIGURACIÓN DE ESTILO (sin cambios) ---
const entryTypeConfig = {
  Nota: { icon: FiFileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  Hito: { icon: FiFlag, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  Vencimiento: { icon: FiAlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  Decisión: { icon: FiCheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  aviso: { icon: FiAlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

const statusConfig = {
  Pendiente: 'bg-yellow-500/20 text-yellow-400',
  Revisado: 'bg-blue-500/20 text-blue-400',
  Completado: 'bg-green-500/20 text-green-400',
};


const BitacoraView = () => {
  // ----- CAMBIO 1: Obtener `editEvent` del contexto -----
  const { projects, events, deleteEvent, toggleEventCompleted, editEvent } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ project: 'Todos', type: 'Todos', status: 'Todos' });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  
  // ----- CAMBIO 2: Añadir estado para el evento en edición -----
  const [eventToEdit, setEventToEdit] = useState(null);

  const allProjectsForFilter = useMemo(() => projects.map(p => ({ id: p.id, name: p.name })), [projects]);
  
  const eventsWithProjectNames = useMemo(() => {
    return events.map(event => ({
      ...event,
      projectName: projects.find(p => p.id === event.projectId)?.name || 'General',
      status: event.isCompleted ? 'Completado' : 'Pendiente'
    }));
  }, [events, projects]);

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...eventsWithProjectNames];
    if (filters.project !== 'Todos') filtered = filtered.filter(e => String(e.projectId) === filters.project);
    if (filters.type !== 'Todos') filtered = filtered.filter(e => e.type === filters.type);
    if (filters.status !== 'Todos') filtered = filtered.filter(e => e.status === filters.status);
    if (searchTerm.trim() !== '') {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(lowercasedSearch) ||
        e.projectName.toLowerCase().includes(lowercasedSearch)
      );
    }
    filtered.sort((a, b) => {
      let valA = a[sortConfig.key], valB = b[sortConfig.key];
      if (sortConfig.key === 'createdAt') { valA = a.createdAt || 0; valB = b.createdAt || 0; }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [eventsWithProjectNames, filters, searchTerm, sortConfig]);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ project: 'Todos', type: 'Todos', status: 'Todos' });
    setSortConfig({ key: 'createdAt', direction: 'desc' });
  };
  const handleDeleteClick = (event) => { setEventToDelete(event); setIsModalOpen(true); };
  const confirmDelete = () => { if(eventToDelete) deleteEvent(eventToDelete.id); setIsModalOpen(false); setEventToDelete(null); };
  const cancelDelete = () => { setIsModalOpen(false); setEventToDelete(null); };

  // ----- CAMBIO 3: Crear función para manejar el clic en "Editar" -----
  const handleEditClick = (event) => {
    setEventToEdit(event);
    setShowAddEventForm(true);
  };

  // ----- CAMBIO 4: Función para manejar el cierre/envío del formulario -----
  const handleFormSubmit = () => {
    setShowAddEventForm(false);
    setEventToEdit(null); // Limpiar el estado de edición
  };

  const handleToggleForm = () => {
    // Si el formulario ya está abierto (en modo edición), simplemente lo cerramos.
    if (showAddEventForm) {
      handleFormSubmit();
    } else {
      // Si está cerrado, lo abrimos en modo "Añadir" (sin evento para editar)
      setEventToEdit(null);
      setShowAddEventForm(true);
    }
  };

  const SortableHeader = ({ label, sortKey }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
      <button onClick={() => handleSort(sortKey)} className="flex items-center gap-1 group">
        {label}
        <span className={`transition-opacity ${sortConfig.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {sortConfig.key === sortKey && sortConfig.direction === 'asc' ? <FiArrowUp size={14}/> : <FiArrowDown size={14}/>}
        </span>
      </button>
    </th>
  );
  
  return (
    <>
      <div className="min-h-screen w-full bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">Bitácora General</h1>
              <p className="text-zinc-400 mt-2">Un registro central de todas las notas, decisiones y eventos importantes.</p>
            </div>
            <button onClick={handleToggleForm} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${showAddEventForm ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {showAddEventForm ? <FiX/> : <FiPlus />}
              <span>{showAddEventForm ? 'Cerrar' : 'Nueva Entrada'}</span>
            </button>
          </div>

          {showAddEventForm && (
            <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl mb-8 animate-fade-in">
                {/* ----- CAMBIO 5: Pasar el evento a editar y la función de submit al formulario ----- */}
                <AddEventForm 
                  onEventAdded={handleFormSubmit} 
                  eventToEdit={eventToEdit} 
                />
            </div>
          )}

          <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <select name="project" value={filters.project} onChange={handleFilterChange} className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Todos">Todos los Proyectos</option>{allProjectsForFilter.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}<option value="General">General</option></select>
              <select name="type" value={filters.type} onChange={handleFilterChange} className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Todos">Todos los Tipos</option>{Object.keys(entryTypeConfig).map(type => <option key={type} value={type} className="capitalize">{type}</option>)}</select>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Todos">Todos los Estados</option>{Object.keys(statusConfig).map(status => <option key={status} value={status}>{status}</option>)}</select>
            </div>
          </div>

          <div className="overflow-x-auto bg-zinc-800/50 border border-zinc-700 rounded-xl">
            <table className="min-w-full divide-y divide-zinc-700">
              <thead className="bg-zinc-800/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Entrada</th>
                  <SortableHeader label="Proyecto" sortKey="projectName" />
                  <SortableHeader label="Fecha" sortKey="createdAt" />
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/50">
                {filteredAndSortedEntries.length > 0 ? (
                  filteredAndSortedEntries.map(entry => {
                    const Icon = entryTypeConfig[entry.type]?.icon || FiFileText;
                    const iconColor = entryTypeConfig[entry.type]?.color || 'text-zinc-400';
                    return (
                      <tr key={entry.id} className="hover:bg-zinc-800 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-3"><div className={`p-2 rounded-full ${entryTypeConfig[entry.type]?.bg}`}><Icon className={iconColor} size={16} /></div><span className="font-medium text-white">{entry.title}</span></div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{entry.projectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{new Date(entry.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><button onClick={() => toggleEventCompleted(entry.id)} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${statusConfig[entry.status]}`}>{entry.status}</button></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {/* ----- CAMBIO 6: Añadir el onClick al botón de editar ----- */}
                            <button onClick={() => handleEditClick(entry)} className="p-1.5 text-zinc-400 hover:text-blue-400" title="Editar"><FiEdit size={16}/></button>
                            <button onClick={() => handleDeleteClick(entry)} className="p-1.5 text-zinc-400 hover:text-red-500" title="Eliminar"><FiTrash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="5" className="text-center py-16 text-zinc-500"><div className="flex flex-col items-center gap-4"><FiFilter size={40} /><span className="font-semibold">No hay entradas que coincidan.</span><button onClick={clearFilters} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"><FiX /> Limpiar filtros</button></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {eventToDelete && <ModalConfirmacion isOpen={isModalOpen} titulo="Eliminar Entrada de Bitácora" mensaje={`¿Estás seguro de que quieres eliminar la entrada "${eventToDelete.title}"?`} onConfirm={confirmDelete} onCancel={cancelDelete} textoConfirmar="Sí, eliminar"/>}
    </>
  );
};

export default BitacoraView;
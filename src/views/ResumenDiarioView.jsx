// src/views/ResumenDiarioView.jsx (COMPLETO Y FINAL)

import React, { useContext, useMemo, useState, forwardRef } from 'react';
import AppContext from '../context/AppContext';
import { FiClipboard, FiCopy, FiFileText, FiCheckCircle, FiLock, FiXCircle, FiPlay, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('es', es);

const formatDuration = (ms) => {
    if (!ms || ms < 0) return '0m';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <button onClick={onClick} ref={ref} className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors">
      <FiCalendar />
      <span>{value}</span>
    </button>
));

const ResumenDiarioView = () => {
    const { projects } = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notes, setNotes] = useState('');

    const todaySummary = useMemo(() => {
        const date = new Date(selectedDate);
        date.setHours(0, 0, 0, 0);
        const startOfDay = date.getTime();
        date.setHours(23, 59, 59, 999);
        const endOfDay = date.getTime();

        let totalTime = 0;
        const projectsSummary = {};

        projects.forEach(project => {
            let projectTime = 0;
            const tasksWithActivityToday = [];
            (project.tasks || []).forEach(task => {
                const activitiesToday = (task.activities || []).filter(
                    act => act.fechaFin >= startOfDay && act.fechaFin <= endOfDay
                );
                if (activitiesToday.length > 0) {
                    const timeOnTaskToday = activitiesToday.filter(act => act.type === 'sesion').reduce((sum, act) => sum + (act.fechaFin - act.fechaInicio), 0);
                    projectTime += timeOnTaskToday;
                    tasksWithActivityToday.push({
                        id: task.id,
                        title: task.title,
                        timeToday: timeOnTaskToday,
                        activities: activitiesToday.sort((a, b) => a.fechaFin - b.fechaFin),
                    });
                }
            });
            if (tasksWithActivityToday.length > 0) {
                totalTime += projectTime;
                projectsSummary[project.id] = { name: project.name, time: projectTime, tasks: tasksWithActivityToday };
            }
        });

        return { totalTime, projects: Object.values(projectsSummary).sort((a,b) => b.time - a.time) };
    }, [projects, selectedDate]);

    const generateReport = (format) => {
        let report = `**Resumen de Jornada - ${selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**\n`;
        report += `**Tiempo Total Registrado:** ${formatDuration(todaySummary.totalTime)}\n\n`;

        todaySummary.projects.forEach(proj => {
            report += `--- \n`;
            report += `### ${proj.name} (${formatDuration(proj.time)})\n`;
            proj.tasks.forEach(task => {
                report += `**${task.title}**\n`;
                task.activities.forEach(act => {
                    if (act.type === 'sesion' && (act.fechaFin - act.fechaInicio > 0)) {
                        report += `- ⏱️ Sesión de trabajo: ${formatDuration(act.fechaFin - act.fechaInicio)}\n`;
                        if (act.observation) report += `  - *Comentario: ${act.observation}*\n`;
                    } else if (act.type === 'estado') {
                        if(act.description.includes('completada')) report += `- ✅ ${act.description}\n`;
                        else if(act.description.includes('en desarrollo')) report += `- ▶️ ${act.description}\n`;
                        else report += `- ℹ️ ${act.description}\n`;
                    }
                });
            });
            report += `\n`;
        });
        
        if(notes.trim()) {
            report += `--- \n`;
            report += `### Notas Adicionales\n`;
            report += `${notes.trim()}\n`;
        }
        
        if (format === 'text') {
            report = report.replace(/###\s/g, '')
                           .replace(/\*\*/g, '')
                           .replace(/-\s(⏱️|✅|▶️|ℹ️)\s/g, '  - ');
        }

        return report;
    };

    const handleCopy = (format) => {
        const reportText = generateReport(format);
        navigator.clipboard.writeText(reportText).then(() => {
            toast.success(`Resumen copiado al portapapeles.`);
        }).catch(err => {
            toast.error('No se pudo copiar el resumen.');
        });
    };

    const renderActivityIcon = (activity) => {
        if (activity.type === 'estado') {
            if (activity.description.includes('completada')) return <FiCheckCircle className="text-green-500" />;
            if (activity.description.includes('bloqueada')) return <FiLock className="text-orange-500" />;
            if (activity.description.includes('cancelada')) return <FiXCircle className="text-red-500" />;
            if (activity.description.includes('en desarrollo')) return <FiPlay className="text-blue-500" />;
        }
        return <FiFileText className="text-zinc-500"/>;
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Resumen de tu Jornada</h1>
                        <div className="mt-1">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                customInput={<CustomDateInput />}
                                dateFormat="eeee, d 'de' MMMM"
                                locale="es"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleCopy('text')} className="flex items-center gap-2 bg-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-600"><FiFileText/> Copiar Texto</button>
                        <button onClick={() => handleCopy('md')} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"><FiClipboard/> Copiar Markdown</button>
                    </div>
                </div>

                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 space-y-6">
                    <div className="text-center border-b border-zinc-700 pb-4">
                        <p className="text-sm text-zinc-400">Tiempo Total Registrado Hoy</p>
                        <p className="text-5xl font-bold tracking-tighter">{formatDuration(todaySummary.totalTime)}</p>
                    </div>

                    {todaySummary.projects.length > 0 ? (
                        todaySummary.projects.map(proj => (
                            <div key={proj.name}>
                                <h2 className="text-xl font-semibold mb-3">{proj.name} <span className="text-base font-normal text-zinc-400">({formatDuration(proj.time)})</span></h2>
                                <div className="space-y-4 pl-4 border-l-2 border-zinc-700">
                                    {proj.tasks.map(task => (
                                        <div key={task.id} className="bg-zinc-900/50 p-3 rounded-lg">
                                            <p className="font-medium text-white mb-2">{task.title}</p>
                                            <ul className="space-y-2">
                                                {task.activities.map(act => (
                                                    <li key={act.id} className="flex items-start gap-3 text-sm">
                                                        <div className="pt-1">{renderActivityIcon(act)}</div>
                                                        <div className="flex-1">
                                                            <span className="text-zinc-300">{act.type === 'sesion' ? `Sesión de ${formatDuration(act.fechaFin - act.fechaInicio)}` : act.description}</span>
                                                            {act.observation && <p className="text-xs text-zinc-500 italic mt-1">“{act.observation}”</p>}
                                                        </div>
                                                        <span className="text-xs text-zinc-500">{new Date(act.fechaFin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-zinc-500">
                            <p>No se ha registrado actividad en la fecha seleccionada.</p>
                        </div>
                    )}
                    
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Notas Adicionales</h2>
                        <textarea
                            rows="4"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Añade un resumen general o comentarios sobre tu día..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumenDiarioView;
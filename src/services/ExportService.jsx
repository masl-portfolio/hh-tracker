import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Función para formatear la duración de milisegundos a un string "HH:MM:SS"
const formatDuration = (ms) => {
  if (!ms || ms < 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// La función principal que genera y descarga el archivo Excel
export const exportProjectToExcel = (project) => {
  // --- CÁLCULOS GLOBALES ---
  const totalHorasEstimadas = project.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  
  const totalTiempoConsumidoMs = project.tasks.reduce((sum, task) => {
    const taskMs = (task.activities || []).reduce((taskSum, act) => {
      return act.fechaFin && act.fechaInicio ? taskSum + (act.fechaFin - act.fechaInicio) : taskSum;
    }, 0);
    return sum + taskMs;
  }, 0);
  const totalHorasConsumidas = totalTiempoConsumidoMs / 3600000;
  
  // CAMBIO 1: Calcular el total de Horas Finales
  const totalHorasFinales = project.tasks.reduce((sum, task) => {
    // Si finalHours es nulo o indefinido, no se suma (o se suma 0)
    return sum + (task.finalHours || 0);
  }, 0);
  
  // CAMBIO 2: La desviación principal ahora se basa en las Horas Finales
  const desviacion = totalHorasFinales - totalHorasEstimadas;

  // --- 1. HOJA DE RESUMEN DEL PROYECTO ---
  const resumenData = [
    ["Reporte de Horas del Proyecto"],
    [],
    ["Nombre del Proyecto:", project.name],
    ["Contacto:", project.contact || 'N/A'],
    ["Email:", project.email || 'N/A'],
    [],
    ["Total Horas Estimadas:", totalHorasEstimadas],
    ["Total Tiempo Lineal:", totalHorasConsumidas], // Renombrado para mayor claridad
    ["Total HH Finales (Facturables):", totalHorasFinales], // CAMBIO 3: Nueva fila en el resumen
    ["Desviación (Presupuesto vs. HH Finales):", desviacion],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  wsResumen["A1"].s = { font: { sz: 16, bold: true } };
  ["A3", "A4", "A5", "A7", "A8", "A9", "A10"].forEach(cell => { wsResumen[cell].s = { font: { bold: true } }; });
  ["B7", "B8", "B9", "B10"].forEach(cell => { if(wsResumen[cell]) wsResumen[cell].z = '0.00'; });
  wsResumen['!cols'] = [{ wch: 35 }, { wch: 40 }];

  // --- 2. HOJA DE HORAS OFICIALES POR TAREA ---
  // CAMBIO 4: Nueva cabecera
  const horasHeader = ["Tarea", "Estado", "Horas Estimadas", "Tiempo Lineal", "HH Finales (Facturables)", "Desviación (vs HH Finales)"];
  
  const horasData = project.tasks.map(task => {
    const taskConsumedMs = (task.activities || []).reduce((sum, act) => {
        return act.fechaFin && act.fechaInicio ? sum + (act.fechaFin - act.fechaInicio) : sum;
    }, 0);
    const taskConsumedHours = taskConsumedMs / 3600000;
    const estimatedHours = task.estimatedHours || 0;
    
    // Si finalHours no está definido, se considera 0 para el cálculo de desviación
    const finalHours = task.finalHours !== null && task.finalHours !== undefined ? task.finalHours : 0;
    const deviation = finalHours - estimatedHours;

    // CAMBIO 5: Nuevos datos en la fila
    return [
        task.title,
        task.status,
        estimatedHours,
        taskConsumedHours, // Tiempo real invertido
        finalHours,        // Horas facturables
        deviation
    ];
  });

  const totalesRow = [
    "TOTAL",
    "",
    totalHorasEstimadas,
    totalHorasConsumidas,
    totalHorasFinales, // CAMBIO 6: Total de HH Finales
    desviacion
  ];

  const wsHoras = XLSX.utils.aoa_to_sheet([horasHeader, ...horasData, [], totalesRow]);
  wsHoras['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 25 }];
  const totalesRowNum = horasData.length + 3;
  ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', `A${totalesRowNum}`, `C${totalesRowNum}`, `D${totalesRowNum}`, `E${totalesRowNum}`, `F${totalesRowNum}`].forEach(cell => {
    if(wsHoras[cell]) wsHoras[cell].s = { font: { bold: true } };
  });
  for (let i = 2; i <= horasData.length + 3; i++) {
    ['C', 'D', 'E', 'F'].forEach(col => {
      const cell = `${col}${i}`;
      if (wsHoras[cell] && typeof wsHoras[cell].v === 'number') {
        wsHoras[cell].z = '0.00';
      }
    });
  }

  // --- 3. HOJA DE DETALLE DE ACTIVIDADES ---
  // (Sin cambios en esta hoja)
  const detalleHeader = ["Tarea", "Descripción Actividad", "Fecha Inicio", "Fecha Fin", "Duración (HH:MM:SS)", "Comentario"];
  const detalleData = project.tasks.flatMap(task => 
    (task.activities || []).map(act => [
      task.title,
      act.description,
      new Date(act.fechaInicio),
      new Date(act.fechaFin),
      formatDuration(act.fechaFin - act.fechaInicio),
      act.observation || ''
    ])
  );
  
  const wsDetalle = XLSX.utils.aoa_to_sheet([detalleHeader, ...detalleData]);
  wsDetalle['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 50 }];
  for (let i = 2; i <= detalleData.length + 1; i++) {
    if (wsDetalle[`C${i}`]) wsDetalle[`C${i}`].z = 'dd/mm/yyyy hh:mm:ss';
    if (wsDetalle[`D${i}`]) wsDetalle[`D${i}`].z = 'dd/mm/yyyy hh:mm:ss';
  }

  // --- 4. CREAR EL LIBRO DE TRABAJO Y AÑADIR LAS HOJAS ---
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen del Proyecto");
  XLSX.utils.book_append_sheet(wb, wsHoras, "Horas por Tarea"); 
  XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle de Actividades");

  // --- 5. GENERAR EL ARCHIVO Y DESCARGAR ---
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
  const fileName = `Reporte_${project.name.replace(/ /g, "_")}_${new Date().toLocaleDateString('sv-SE')}.xlsx`;
  saveAs(dataBlob, fileName);
};
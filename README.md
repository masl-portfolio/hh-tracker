# hh-tracker

Aplicación de escritorio para registrar horas trabajadas por proyecto. Usa React + Electron y guarda los datos en `localStorage`.

## Scripts

- `npm install` instala las dependencias.
- `npm run dev` inicia Vite para desarrollo web.
- `npm run electron` abre la aplicación en modo escritorio.
- `npm run build` genera la versión de producción en `dist/`.

## Estructura

- `src/components/` componentes reutilizables.
- `src/context/` contexto global con el estado de proyectos.
- `src/views/` vistas principales de la aplicación.
- `electron/` código principal de Electron.

La aplicación permite crear proyectos y gestionar tareas. Cada tarea requiere declarar las horas previstas y puede registrar sesiones de trabajo. Se muestra el total de horas registradas frente a las declaradas para detectar desvíos. También puedes marcar un proyecto como predeterminado y cambiar el estado de cada tarea. La interfaz usa Tailwind CSS para un aspecto limpio y profesional.

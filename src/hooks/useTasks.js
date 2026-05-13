// Re-export from the JSX provider so bare imports resolve here
// (Vite picks .js before .jsx; this forwards everything to useTasks.jsx)
export { TasksProvider, useTasks } from './useTasks.jsx'

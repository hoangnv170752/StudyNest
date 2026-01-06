import { useState } from 'react';
import { Task } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (title: string, dueDate?: string) => {
    if (title.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title,
        completed: false,
        dueDate: dueDate || undefined
      };
      setTasks([...tasks, newTask]);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask
  };
};

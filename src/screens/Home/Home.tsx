import React, { useState } from 'react';
import { Header, TaskInput, TaskList } from '../../components';
import { useTasks } from '../../hooks';
import './Home.css';

const Home: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  const handleAddTask = () => {
    addTask(newTaskTitle, newTaskDate);
    setNewTaskTitle('');
    setNewTaskDate('');
  };

  return (
    <div className="home">
      <Header />
      <main className="home-main">
        <TaskInput
          taskTitle={newTaskTitle}
          taskDate={newTaskDate}
          onTitleChange={setNewTaskTitle}
          onDateChange={setNewTaskDate}
          onAddTask={handleAddTask}
        />
        <TaskList
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />
      </main>
    </div>
  );
};

export default Home;

import React from 'react';
import { Task } from '../../types';
import TaskItem from '../TaskItem/TaskItem';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask, onDeleteTask }) => {
  return (
    <div className="tasks-section">
      <h2>Your Tasks ({tasks.length})</h2>
      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Add one to get started!</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;

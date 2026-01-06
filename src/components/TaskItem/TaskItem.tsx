import React from 'react';
import { Task } from '../../types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="task-checkbox"
        />
        <div className="task-details">
          <span className="task-title">{task.title}</span>
          {task.dueDate && (
            <span className="task-date">Due: {task.dueDate}</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="delete-button"
      >
        Delete
      </button>
    </li>
  );
};

export default TaskItem;

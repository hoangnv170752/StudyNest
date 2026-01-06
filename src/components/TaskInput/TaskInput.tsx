import React from 'react';
import './TaskInput.css';

interface TaskInputProps {
  taskTitle: string;
  taskDate: string;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onAddTask: () => void;
}

const TaskInput: React.FC<TaskInputProps> = ({
  taskTitle,
  taskDate,
  onTitleChange,
  onDateChange,
  onAddTask
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAddTask();
    }
  };

  return (
    <div className="task-input-section">
      <h2>Add New Task</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter task title..."
          value={taskTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="task-input"
        />
        <input
          type="date"
          value={taskDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="date-input"
        />
        <button onClick={onAddTask} className="add-button">
          Add Task
        </button>
      </div>
    </div>
  );
};

export default TaskInput;

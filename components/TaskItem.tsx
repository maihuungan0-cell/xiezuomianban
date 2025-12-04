import React from 'react';
import { Check, Trash2, Clock, Calendar } from 'lucide-react';
import { Task, User } from '../types';
import { Avatar } from './Avatar';

interface TaskItemProps {
  task: Task;
  user?: User;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, user, onToggle, onDelete }) => {
  return (
    <div className={`
      group flex items-start gap-4 p-4 mb-3 rounded-xl border transition-all duration-200
      ${task.isCompleted 
        ? 'bg-slate-50 border-slate-200 opacity-75' 
        : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30'}
    `}>
      <button
        onClick={() => onToggle(task.id)}
        className={`
          flex-shrink-0 mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
          ${task.isCompleted 
            ? 'bg-success border-success text-white' 
            : 'border-slate-300 text-transparent hover:border-primary'}
        `}
      >
        <Check size={14} strokeWidth={3} />
      </button>

      <div className="flex-grow min-w-0">
        <p className={`text-base font-medium leading-relaxed break-words ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
          {task.content}
        </p>
        
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          {user && (
            <div className="flex items-center gap-1.5">
              <Avatar name={user.name} color={user.avatarColor} size="sm" className="!w-5 !h-5 !text-[10px]" />
              <span className="font-medium text-slate-600">{user.name}</span>
            </div>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(task.createdAt).toLocaleDateString('zh-CN')}
          </span>
          {task.isCompleted && (
             <span className="flex items-center gap-1 text-success">
             <Check size={12} />
             已完成
           </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        aria-label="删除任务"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
import React, { useState } from 'react';
import { Users, Plus, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';
import { Avatar } from './Avatar';

interface SidebarProps {
  currentUser: User | null;
  users: User[];
  onSelectUser: (user: User) => void;
  onAddUser: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, users, onSelectUser, onAddUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      onAddUser(newUserName.trim());
      setNewUserName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full md:w-72 bg-white border-r border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-primary" />
          团队成员
        </h2>
        <p className="text-sm text-slate-500 mt-1">选择您的账号开始记录。</p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              currentUser?.id === user.id
                ? 'bg-primary/10 border border-primary/20 shadow-sm'
                : 'hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Avatar name={user.name} color={user.avatarColor} />
            <div className="text-left">
              <p className={`font-medium ${currentUser?.id === user.id ? 'text-primary' : 'text-slate-700'}`}>
                {user.name}
              </p>
              <p className="text-xs text-slate-400">
                {currentUser?.id === user.id ? '当前在线' : '点击切换'}
              </p>
            </div>
            {currentUser?.id === user.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            )}
          </button>
        ))}

        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-slideDown">
            <label className="block text-xs font-semibold text-slate-500 mb-1">新成员姓名</label>
            <input
              type="text"
              autoFocus
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm mb-2"
              placeholder="例如：小明"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                添加
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-slate-200 text-slate-600 py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-slate-300"
              >
                取消
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Plus size={18} />
            <span>添加成员</span>
          </button>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {currentUser ? (
             <div className="flex items-center gap-2 text-sm text-slate-600">
                 <UserIcon size={14}/>
                 当前登录： <span className="font-semibold">{currentUser.name}</span>
             </div>
        ) : (
            <div className="text-sm text-amber-600 flex items-center gap-2">
                <LogOut size={14}/>
                请选择一个用户
            </div>
        )}
      </div>
    </div>
  );
};
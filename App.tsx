import React, { useState, useEffect } from 'react';
import { Plus, Layout, ListTodo, CheckCircle2, Sparkles, Filter, AlertCircle, User as UserIcon } from 'lucide-react';
import type { User, Task } from './types';
import { FilterType } from './types';
import { Sidebar } from './components/Sidebar';
import { TaskItem } from './components/TaskItem';
import { generateTeamSummary } from './services/geminiService';

// Initial mock data if empty
const DEFAULT_USERS: User[] = [
  { id: 'u1', name: '小明', avatarColor: '#3b82f6' },
  { id: 'u2', name: '小红', avatarColor: '#ec4899' },
  { id: 'u3', name: '老张', avatarColor: '#f59e0b' },
];

const App: React.FC = () => {
  // State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('teamSync_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('teamSync_currentUser');
    return saved ? JSON.parse(saved) : (users[0] || null);
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('teamSync_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTaskContent, setNewTaskContent] = useState('');
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  
  // AI Summary State
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('teamSync_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('teamSync_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('teamSync_currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Handlers
  const handleAddUser = (name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      avatarColor: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random hex color
    };
    setUsers([...users, newUser]);
    if (!currentUser) setCurrentUser(newUser);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim() || !currentUser) return;

    const newTask: Task = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content: newTaskContent,
      isCompleted: false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskContent('');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? Date.now() : undefined } 
        : t
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleGenerateSummary = async () => {
    setIsSummaryModalOpen(true);
    setIsGeneratingSummary(true);
    setSummary(null);
    
    const result = await generateTeamSummary(tasks, users);
    
    setSummary(result);
    setIsGeneratingSummary(false);
  };

  // Derived State
  const filteredTasks = tasks.filter(task => {
    if (filter === FilterType.MY_TASKS && currentUser) return task.userId === currentUser.id;
    if (filter === FilterType.COMPLETED) return task.isCompleted;
    if (filter === FilterType.PENDING) return !task.isCompleted;
    return true; // FilterType.ALL
  });

  const getStats = () => {
    const today = new Date().setHours(0,0,0,0);
    const todaysTasks = tasks.filter(t => t.createdAt >= today);
    const completedToday = todaysTasks.filter(t => t.isCompleted).length;
    return { total: todaysTasks.length, completed: completedToday };
  };

  const stats = getStats();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar - Desktop & Tablet */}
      <div className="hidden md:block h-full shadow-xl z-10">
        <Sidebar 
          currentUser={currentUser} 
          users={users} 
          onSelectUser={setCurrentUser} 
          onAddUser={handleAddUser}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="md:hidden">
               {/* Mobile placeholder for sidebar toggle if implemented */}
               <Layout className="text-slate-400" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">TeamSync</h1>
                <p className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">今日进度</span>
                <div className="flex items-center gap-2">
                   <span className="text-lg font-bold text-primary">{stats.completed}</span>
                   <span className="text-slate-400">/</span>
                   <span className="text-lg font-bold text-slate-600">{stats.total}</span>
                </div>
             </div>
             
             <button
               onClick={handleGenerateSummary}
               className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95"
             >
               <Sparkles size={18} />
               <span className="hidden sm:inline">AI 日报总结</span>
             </button>
          </div>
        </header>

        {/* Task Input Area */}
        <div className="p-6 pb-2 max-w-4xl mx-auto w-full">
           <form onSubmit={handleAddTask} className="relative group">
              <input 
                type="text" 
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                placeholder={currentUser ? `${currentUser.name}，今天打算做什么？` : "请选择成员开始添加任务..."}
                disabled={!currentUser}
                className="w-full pl-6 pr-14 py-4 rounded-2xl border border-slate-200 shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <button 
                type="submit"
                disabled={!newTaskContent.trim() || !currentUser}
                className="absolute right-3 top-3 p-2 bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
              >
                <Plus size={20} />
              </button>
           </form>
           {!currentUser && (
               <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm px-2">
                   <AlertCircle size={14} />
                   <span>请从左侧栏选择您的个人资料以开始记录。</span>
               </div>
           )}
        </div>

        {/* Filters */}
        <div className="px-6 py-2 max-w-4xl mx-auto w-full flex gap-2 overflow-x-auto no-scrollbar">
            {[
                { type: FilterType.ALL, icon: Layout, label: '所有任务' },
                { type: FilterType.MY_TASKS, icon: UserIcon, label: '我的任务' },
                { type: FilterType.PENDING, icon: ListTodo, label: '待办' },
                { type: FilterType.COMPLETED, icon: CheckCircle2, label: '已完成' }
            ].map(f => (
                <button
                    key={f.type}
                    onClick={() => setFilter(f.type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                        filter === f.type 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {/* @ts-ignore */}
                    <f.icon size={14} />
                    {f.label}
                </button>
            ))}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
           <div className="max-w-4xl mx-auto space-y-2 pb-20">
              {filteredTasks.length === 0 ? (
                  <div className="text-center py-20 opacity-50">
                      <ListTodo size={48} className="mx-auto mb-4 text-slate-300" />
                      <h3 className="text-lg font-medium text-slate-600">暂无任务</h3>
                      <p className="text-slate-400">尝试更改筛选条件或添加新任务。</p>
                  </div>
              ) : (
                  filteredTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        user={users.find(u => u.id === task.userId)}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                      />
                  ))
              )}
           </div>
        </div>
      </div>

      {/* AI Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Sparkles className="text-purple-600" />
                团队每日总结
              </h2>
              <button onClick={() => setIsSummaryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                关闭
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto min-h-[300px]">
              {isGeneratingSummary ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                   <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                   <p className="text-slate-500 animate-pulse">正在分析团队进度...</p>
                </div>
              ) : (
                <div className="prose prose-slate prose-sm max-w-none">
                   {/* Simple line break rendering for safety without complex dependencies */}
                   {summary?.split('\n').map((line, i) => (
                       <p key={i} className="mb-2 leading-relaxed">
                           {line.startsWith('- ') || line.startsWith('* ') ? (
                               <span className="flex items-start gap-2">
                                   <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                   <span>{line.replace(/^[-*] /, '')}</span>
                               </span>
                           ) : (
                               line.startsWith('#') ? <span className="block font-bold text-lg text-slate-800 mt-4 mb-2">{line.replace(/^#+ /, '')}</span> : line
                           )}
                       </p>
                   ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button 
                 onClick={() => setIsSummaryModalOpen(false)}
                 className="px-5 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
               >
                 完成
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
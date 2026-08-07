import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsPlus, BsTrash, BsPencil, BsSearch, BsCheck2 } from 'react-icons/bs';
import useLocalStorage from '../hooks/useLocalStorage';
import sfx from '../audio/sfx';

const PRIORITIES = [
  { key: 'high', label: 'High', dot: 'text-red-500' },
  { key: 'medium', label: 'Medium', dot: 'text-amber-500' },
  { key: 'low', label: 'Low', dot: 'text-green-500' },
];

export default function TodoList({ onTaskCompleted }) {
  const [todos, setTodos] = useLocalStorage('fd-todos', []);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [dragId, setDragId] = useState(null);

  const addTodo = () => {
    const title = input.trim();
    if (!title) return;
    sfx.click();
    setTodos([...todos, { id: Date.now(), title, priority, done: false }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    const t = todos.find((x) => x.id === id);
    setTodos(todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
    if (t && !t.done) {
      sfx.check();
      onTaskCompleted();
    }
  };

  const deleteTodo = (id) => {
    sfx.click();
    setTodos(todos.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const saveEdit = (id) => {
    sfx.check();
    const title = editingTitle.trim();
    if (title) setTodos(todos.map((x) => (x.id === id ? { ...x, title } : x)));
    setEditingId(null);
    setEditingTitle('');
  };

  const onDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const from = todos.findIndex((x) => x.id === dragId);
    const to = todos.findIndex((x) => x.id === targetId);
    const arr = [...todos];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setTodos(arr);
    setDragId(null);
  };

  const filtered = useMemo(() => {
    let list = todos;
    if (filter === 'active') list = list.filter((x) => !x.done);
    if (filter === 'completed') list = list.filter((x) => x.done);
    if (search) list = list.filter((x) => x.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [todos, filter, search]);

  const priorityColor = (key) => PRIORITIES.find((p) => p.key === key)?.dot || 'text-[rgb(var(--text-secondary))]';

  return (
    <div className="glass-card p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">To-Do List</h2>
        <span className="text-xs text-[rgb(var(--text-secondary))]">{todos.filter((t) => t.done).length}/{todos.length} done</span>
      </div>

      {/* Search */}
      <div className="relative">
        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-[rgb(var(--glass)/0.6)] border border-[rgb(var(--card-border)/0.6)] rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
          aria-label="Search tasks"
        />
      </div>

      {/* Add form */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="New task..."
          className="flex-1 min-w-[140px] bg-[rgb(var(--glass)/0.6)] border border-[rgb(var(--card-border)/0.6)] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
          aria-label="New task"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="Select priority"
          className="bg-[rgb(var(--glass)/0.6)] border border-[rgb(var(--card-border)/0.6)] rounded-xl px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
        >
          {PRIORITIES.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
        <button onClick={addTodo} className="btn btn-primary" aria-label="Add task">
          <BsPlus />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {[['all', 'All'], ['active', 'Active'], ['completed', 'Completed']].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`btn px-3 py-1.5 text-xs ${filter === k ? 'btn-primary' : 'btn-ghost'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-72">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <div className="text-center text-sm text-[rgb(var(--text-secondary))] py-8">
              <div className="text-4xl mb-2">📝</div>
              {search || filter !== 'all' ? 'No tasks match your filters.' : 'No tasks yet. Add your first one!'}
            </div>
          )}
          {filtered.map((t) => (
            <motion.div
              key={t.id}
              layout
              draggable
              onDragStart={(e) => onDragStart(e, t.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, t.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className={`flex items-center gap-3 bg-[rgb(var(--glass)/0.5)] border border-[rgb(var(--card-border)/0.4)] rounded-xl px-3 py-2.5 cursor-grab active:cursor-grabbing ${dragId === t.id ? 'opacity-40' : ''} ${t.done ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => toggleTodo(t.id)}
                aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] ${t.done ? 'border-[rgb(var(--accent))]' : 'border-[rgb(var(--card-border))]'}`}
                style={t.done ? { background: 'rgb(var(--accent))' } : {}}
              >
                {t.done && <BsCheck2 className="w-full h-full text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                {editingId === t.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveEdit(t.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(t.id)}
                    autoFocus
                    className="w-full bg-transparent outline-none border-b border-[rgb(var(--accent))] text-sm"
                    aria-label="Edit task title"
                  />
                ) : (
                  <span className={`text-sm block truncate ${t.done ? 'line-through' : ''}`}>{t.title}</span>
                )}
              </div>

              <span className={`${priorityColor(t.priority)} text-xs hidden sm:inline`}>{PRIORITIES.find((p) => p.key === t.priority)?.label}</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingId(t.id); setEditingTitle(t.title); }}
                  className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] p-1"
                  aria-label="Edit task"
                >
                  <BsPencil />
                </button>
                <button onClick={() => deleteTodo(t.id)} className="text-[rgb(var(--text-secondary))] hover:text-red-500 p-1" aria-label="Delete task">
                  <BsTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
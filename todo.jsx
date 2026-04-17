import { useState, useEffect, useRef } from "react";

const FILTERS = ["All", "Active", "Completed"];

const PRIORITIES = {
  high: { label: "High", color: "#ff4d4d" },
  medium: { label: "Medium", color: "#ffaa00" },
  low: { label: "Low", color: "#00c48c" },
};

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export default function TodoApp() {
  const [todos, setTodos] = useLocalStorage("todos_v1", []);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const filtered = todos.filter((t) => {
    if (filter === "Active") return !t.done;
    if (filter === "Completed") return t.done;
    return true;
  });

  const remaining = todos.filter((t) => !t.done).length;

  function addTodo() {
    const text = input.trim();
    if (!text) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setTodos([
      { id: Date.now(), text, done: false, priority, createdAt: Date.now() },
      ...todos,
    ]);
    setInput("");
    inputRef.current?.focus();
  }

  function toggleTodo(id) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  function startEdit(todo) {
    setEditId(todo.id);
    setEditText(todo.text);
  }

  function saveEdit(id) {
    const text = editText.trim();
    if (!text) return;
    setTodos(todos.map((t) => (t.id === id ? { ...t, text } : t)));
    setEditId(null);
  }

  function clearCompleted() {
    setTodos(todos.filter((t) => !t.done));
  }

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logo}>✦</span>
          <h1 style={styles.title}>My Tasks</h1>
          <span style={styles.badge}>{remaining} left</span>
        </div>

        {/* Input Row */}
        <div className={shake ? "shake" : ""} style={styles.inputRow}>
          <input
            ref={inputRef}
            style={styles.input}
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <div style={styles.priorityRow}>
            {Object.entries(PRIORITIES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setPriority(key)}
                style={{
                  ...styles.priorityBtn,
                  background: priority === key ? val.color : "transparent",
                  color: priority === key ? "#fff" : val.color,
                  border: `1.5px solid ${val.color}`,
                }}
              >
                {val.label}
              </button>
            ))}
          </div>
          <button style={styles.addBtn} onClick={addTodo}>
            <span style={styles.plusIcon}>+</span> Add Task
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterRow}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterBtnActive : {}),
              }}
            >
              {f}
            </button>
          ))}
          {todos.some((t) => t.done) && (
            <button onClick={clearCompleted} style={styles.clearBtn}>
              Clear done
            </button>
          )}
        </div>

        {/* Todo List */}
        <ul style={styles.list}>
          {filtered.length === 0 && (
            <li style={styles.empty}>
              <span style={{ fontSize: 32 }}>🎉</span>
              <p style={{ margin: "8px 0 0", color: "#aaa", fontSize: 14 }}>
                {filter === "Completed"
                  ? "No completed tasks yet."
                  : "All clear! Add something above."}
              </p>
            </li>
          )}
          {filtered.map((todo) => (
            <li key={todo.id} style={styles.item} className="todo-item">
              <span
                style={{
                  ...styles.priorityDot,
                  background: PRIORITIES[todo.priority]?.color || "#aaa",
                }}
              />
              <button
                onClick={() => toggleTodo(todo.id)}
                style={{
                  ...styles.checkbox,
                  ...(todo.done ? styles.checkboxDone : {}),
                }}
                aria-label="Toggle"
              >
                {todo.done && <span style={styles.checkmark}>✓</span>}
              </button>

              {editId === todo.id ? (
                <input
                  autoFocus
                  style={styles.editInput}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(todo.id);
                    if (e.key === "Escape") setEditId(null);
                  }}
                  onBlur={() => saveEdit(todo.id)}
                />
              ) : (
                <span
                  style={{
                    ...styles.todoText,
                    ...(todo.done ? styles.todoTextDone : {}),
                  }}
                  onDoubleClick={() => startEdit(todo)}
                  title="Double-click to edit"
                >
                  {todo.text}
                </span>
              )}

              <div style={styles.actions} className="item-actions">
                {editId !== todo.id && (
                  <button
                    style={styles.iconBtn}
                    onClick={() => startEdit(todo)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                )}
                <button
                  style={styles.iconBtn}
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>

        {todos.length > 0 && (
          <p style={styles.footer}>
            {todos.length} task{todos.length !== 1 ? "s" : ""} total · Double-click to edit
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0d0d14",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "fixed", top: "-120px", left: "-120px",
    width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(120,80,255,0.25) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed", bottom: "-100px", right: "-80px",
    width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,196,140,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%", maxWidth: 560,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 24,
    padding: "32px 28px",
    backdropFilter: "blur(16px)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
    position: "relative",
  },
  header: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
  },
  logo: { fontSize: 20, color: "#7c5cfc" },
  title: {
    margin: 0, flex: 1,
    fontSize: 24, fontWeight: 700,
    color: "#f0eeff",
    letterSpacing: "-0.5px",
  },
  badge: {
    background: "rgba(124,92,252,0.2)",
    color: "#b39dfc",
    border: "1px solid rgba(124,92,252,0.3)",
    borderRadius: 20, padding: "2px 12px",
    fontSize: 13, fontWeight: 600,
  },
  inputRow: {
    display: "flex", flexDirection: "column", gap: 10, marginBottom: 20,
  },
  input: {
    background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12, padding: "12px 16px",
    color: "#f0eeff", fontSize: 15,
    outline: "none", transition: "border 0.2s",
    fontFamily: "inherit",
  },
  priorityRow: {
    display: "flex", gap: 8,
  },
  priorityBtn: {
    flex: 1, padding: "6px 0", borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    transition: "all 0.15s", fontFamily: "inherit",
  },
  addBtn: {
    background: "linear-gradient(135deg, #7c5cfc, #5c8dfc)",
    color: "#fff", border: "none", borderRadius: 12,
    padding: "12px 20px", fontSize: 15, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 6,
    transition: "opacity 0.15s, transform 0.1s",
    fontFamily: "inherit",
  },
  plusIcon: { fontSize: 18, lineHeight: 1 },
  filterRow: {
    display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap",
  },
  filterBtn: {
    background: "transparent",
    border: "1.5px solid rgba(255,255,255,0.1)",
    color: "#aaa", borderRadius: 20,
    padding: "5px 16px", fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  },
  filterBtnActive: {
    background: "rgba(124,92,252,0.2)",
    border: "1.5px solid #7c5cfc",
    color: "#c4b5fd",
  },
  clearBtn: {
    background: "transparent",
    border: "1.5px solid rgba(255,80,80,0.3)",
    color: "#ff6b6b", borderRadius: 20,
    padding: "5px 16px", fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
    marginLeft: "auto",
  },
  list: {
    listStyle: "none", margin: 0, padding: 0,
    display: "flex", flexDirection: "column", gap: 8,
    maxHeight: 380, overflowY: "auto",
  },
  empty: {
    textAlign: "center", padding: "40px 0",
    color: "#666", listStyle: "none",
  },
  item: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12, padding: "12px 14px",
    transition: "background 0.15s",
  },
  priorityDot: {
    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    border: "2px solid rgba(255,255,255,0.2)",
    background: "transparent",
    cursor: "pointer", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  },
  checkboxDone: {
    background: "linear-gradient(135deg, #7c5cfc, #5c8dfc)",
    border: "2px solid transparent",
  },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: 700 },
  todoText: {
    flex: 1, color: "#e0dcff", fontSize: 14,
    cursor: "default", wordBreak: "break-word",
    transition: "color 0.2s",
  },
  todoTextDone: {
    color: "#555", textDecoration: "line-through",
  },
  editInput: {
    flex: 1, background: "rgba(255,255,255,0.08)",
    border: "1.5px solid #7c5cfc",
    borderRadius: 8, padding: "4px 10px",
    color: "#f0eeff", fontSize: 14,
    outline: "none", fontFamily: "inherit",
  },
  actions: {
    display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s",
  },
  iconBtn: {
    background: "transparent", border: "none",
    cursor: "pointer", fontSize: 14, padding: "2px 4px",
    borderRadius: 6, lineHeight: 1,
  },
  footer: {
    marginTop: 16, textAlign: "center",
    color: "#555", fontSize: 12,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  .todo-item:hover { background: rgba(255,255,255,0.07) !important; }
  .todo-item:hover .item-actions { opacity: 1 !important; }
  button:hover { opacity: 0.85; }
  input:focus {
    border-color: rgba(124,92,252,0.6) !important;
    background: rgba(255,255,255,0.09) !important;
  }
  ul::-webkit-scrollbar { width: 4px; }
  ul::-webkit-scrollbar-track { background: transparent; }
  ul::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.3); border-radius: 4px; }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  .shake { animation: shake 0.35s ease; }
`;
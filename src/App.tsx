import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Clock3,
  Focus,
  LayoutList,
  Leaf,
  Menu,
  Moon,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trash2,
  X,
} from "lucide-react";

type Priority = "High" | "Medium" | "Low";
type Filter = "All tasks" | "In progress" | "Completed";
type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
};

const TASKS_KEY = "taskflow-tasks-v1";
const THEME_KEY = "taskflow-theme-v1";

const exampleTasks: Task[] = [
  {
    id: "sample-1",
    title: "Review project requirements",
    description: "Go through the brief and outline the main goals",
    priority: "High",
    completed: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: "sample-2",
    title: "Build the task dashboard",
    description: "Design a clean and responsive layout",
    priority: "High",
    completed: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: "sample-3",
    title: "Practice Git feature branches",
    description: "Create a branch, commit changes, and merge",
    priority: "Medium",
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: "sample-4",
    title: "Write project documentation",
    description: "Add setup instructions to README.md",
    priority: "Low",
    completed: false,
    createdAt: Date.now() - 1800000,
  },
];

function getInitialTasks(): Task[] {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (task): task is Task =>
            typeof task === "object" &&
            task !== null &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.description === "string" &&
            typeof task.completed === "boolean" &&
            ["High", "Medium", "Low"].includes(task.priority),
        );
      }
    }
  } catch {
    /* Local storage can be unavailable or invalid. */
  }
  return exampleTasks;
}

function getInitialTheme(): boolean {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === "dark";
  } catch {
    /* Ignore unavailable storage. */
  }
  return false;
}

const filters: Filter[] = ["All tasks", "In progress", "Completed"];
const priorities: Priority[] = ["High", "Medium", "Low"];

function priorityColor(priority: Priority): string {
  switch (priority) {
    case "High":
      return "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20";
    case "Medium":
      return "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20";
    case "Low":
      return "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20";
  }
}

const dateLabel = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [dark, setDark] = useState(getInitialTheme);
  const [filter, setFilter] = useState<Filter>("All tasks");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [formError, setFormError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
      /* Storage may be unavailable. */
    }
  }, [tasks]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#151a17" : "#f7f8f5");
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      /* Ignore. */
    }
  }, [dark]);

  useEffect(() => {
    if (showForm) titleRef.current?.focus();
  }, [showForm]);

  const completed = tasks.filter((task) => task.completed).length;
  const remaining = tasks.length - completed;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const visibleTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          const matchesFilter =
            filter === "All tasks" ||
            (filter === "Completed" ? task.completed : !task.completed);
          const matchesQuery = `${task.title} ${task.description}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
          return matchesFilter && matchesQuery;
        })
        .sort(
          (a, b) =>
            Number(a.completed) - Number(b.completed) ||
            b.createdAt - a.createdAt,
        ),
    [tasks, filter, query],
  );

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setFormError("Please enter a task title.");
      titleRef.current?.focus();
      return;
    }
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((current) => [task, ...current]);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setFormError("");
    setShowForm(false);
    setFilter("All tasks");
    setQuery("");
  }

  function chooseFilter(value: Filter) {
    setFilter(value);
    setMobileMenuOpen(false);
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function clearCompleted() {
    setTasks((current) => current.filter((task) => !task.completed));
  }

  function openForm() {
    setShowForm(true);
    setMobileMenuOpen(false);
    setFormError("");
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-[#202722] transition-colors duration-200 dark:bg-[#151a17] dark:text-[#f1f5ef]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar */}
        <aside
          className={`${mobileMenuOpen ? "fixed inset-y-0 left-0 z-40 flex w-70 shadow-2xl" : "hidden"} lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-67.5 lg:shrink-0 flex-col border-r border-[#e8ede7] bg-white px-5 py-8 dark:border-[#303b33] dark:bg-[#1d2620]`}
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#347b52] text-white shadow-[0_5px_14px_rgba(52,123,82,.2)]">
                <Leaf size={23} strokeWidth={2.2} />
              </div>
              <span className="heading text-xl font-extrabold tracking-[-.9px]">
                taskflow<span className="text-[#4a9669]">.</span>
              </span>
            </div>
            <button
              aria-label="Close navigation"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-14 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a4ada4]">
            Workspace
          </div>
          <nav aria-label="Task filters" className="mt-4 space-y-1.5">
            {filters.map((item, index) => {
              const Icon =
                index === 0 ? LayoutList : index === 1 ? Clock3 : CheckCheck;
              return (
                <button
                  key={item}
                  onClick={() => chooseFilter(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition ${filter === item ? "bg-[#e9f4eb] text-[#287449] dark:bg-[#2a4434] dark:text-[#b5eac3]" : "text-[#7c887d] hover:bg-[#f6f8f5] hover:text-[#293c2d] dark:hover:bg-[#29372d] dark:hover:text-white"}`}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  <span className="flex-1">{item}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] ${filter === item ? "bg-white/80 dark:bg-white/10" : "bg-[#f2f4f0] dark:bg-[#26332a]"}`}
                  >
                    {index === 0
                      ? tasks.length
                      : index === 1
                        ? remaining
                        : completed}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-12 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a4ada4]">
            Preferences
          </div>
          <button
            onClick={() => setDark((current) => !current)}
            className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold text-[#7c887d] hover:bg-[#f6f8f5] dark:hover:bg-[#29372d] dark:hover:text-white"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}{" "}
            <span className="flex-1">
              {dark ? "Light appearance" : "Dark appearance"}
            </span>
          </button>

          <div className="mt-auto px-2 pt-10">
            <div className="rounded-2xl bg-[#edf6ef] p-4 dark:bg-[#2a3d2f]">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#40825b] dark:bg-[#375640] dark:text-[#a5d8b5]">
                <Sparkles size={19} />
              </div>
              <p className="heading text-[13px] font-bold">
                A little progress every day.
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[#718375] dark:text-[#b6c8b8]">
                Small steps turn big plans into reality.
              </p>
            </div>
            <div className="mt-7 flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e9df] text-xs font-bold text-[#3c7550] dark:bg-[#36463a] dark:text-[#c3dfc9]">
                H
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold">My workspace</p>
                <p className="text-[11px] text-[#9ca99f]">Personal account</p>
              </div>
              <ChevronDown size={15} className="text-[#9ca99f]" />
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <button
            aria-label="Close sidebar"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
        )}

        {/* Main */}
        <main className="min-w-0 flex-1 px-5 pb-16 pt-7 sm:px-9 lg:px-12 xl:px-18.5">
          <div className="mx-auto max-w-240">
            <header className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Open menu"
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-xl border border-[#e6ece5] bg-white p-2.5 text-[#618069] lg:hidden dark:border-[#344439] dark:bg-[#223027]"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#819183] dark:text-[#9bad9d]">
                  <CalendarDays size={15} />
                  {dateLabel}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
                  title="Toggle theme"
                  onClick={() => setDark((current) => !current)}
                  className="rounded-xl border border-[#e6ece5] bg-white p-2.5 text-[#6b816e] transition hover:border-[#bad1c0] dark:border-[#344439] dark:bg-[#223027] dark:text-[#b0cdb7]"
                >
                  <span className="block">
                    {dark ? <Sun size={17} /> : <Moon size={17} />}
                  </span>
                </button>
                <div className="hidden items-center gap-2 rounded-full border border-[#e4ebe2] bg-white py-1.5 pl-1.5 pr-3 text-xs font-bold text-[#476b51] sm:flex dark:border-[#344439] dark:bg-[#223027] dark:text-[#cce6cf]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8eddf] dark:bg-[#3b5b43]">
                    H
                  </span>{" "}
                  Hello, Haroon!
                </div>
              </div>
            </header>

            <section className="mt-14 sm:mt-17.5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e9f3ea] px-3 py-1.5 text-[11px] font-bold text-[#4b9064] dark:bg-[#294533] dark:text-[#a4d8b4]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#57a875]" /> YOUR
                PRODUCTIVITY SPACE
              </div>
              <h1 className="heading text-[35px] font-extrabold leading-[1.2] tracking-[-1.9px] sm:text-[46px]">
                Make today <span className="text-[#4d9369]">count.</span>
                <span className="ml-1 inline-block align-middle">✳</span>
              </h1>
              <p className="mt-3 text-sm leading-7 text-[#89988b] sm:text-[15px] dark:text-[#a6b7aa]">
                Stay focused, make progress, and celebrate every little win.
              </p>
            </section>

            <section
              aria-label="Progress overview"
              className="mt-9 grid gap-4 sm:grid-cols-3"
            >
              <div className="rounded-2xl border border-[#e6ece4] bg-white px-5 py-5 shadow-[0_4px_20px_rgba(43,68,48,.025)] dark:border-[#354238] dark:bg-[#222c25]">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#95a095]">
                    Total tasks
                  </span>
                  <div className="rounded-xl bg-[#eff3ef] p-2 text-[#6e9476] dark:bg-[#324338] dark:text-[#acd2b5]">
                    <LayoutList size={16} />
                  </div>
                </div>
                <p className="heading text-[34px] font-extrabold tracking-[-1px]">
                  {tasks.length.toString().padStart(2, "0")}
                </p>
                <p className="mt-1 text-[11px] text-[#9ba99c]">
                  Tasks on your list
                </p>
              </div>
              <div className="rounded-2xl border border-[#e6ece4] bg-white px-5 py-5 shadow-[0_4px_20px_rgba(43,68,48,.025)] dark:border-[#354238] dark:bg-[#222c25]">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#95a095]">
                    In progress
                  </span>
                  <div className="rounded-xl bg-[#fff5e5] p-2 text-[#daa353] dark:bg-[#4a4031] dark:text-[#efd29b]">
                    <Clock3 size={16} />
                  </div>
                </div>
                <p className="heading text-[34px] font-extrabold tracking-[-1px]">
                  {remaining.toString().padStart(2, "0")}
                </p>
                <p className="mt-1 text-[11px] text-[#9ba99c]">
                  Keep the momentum
                </p>
              </div>
              <div className="rounded-2xl border border-[#e6ece4] bg-white px-5 py-5 shadow-[0_4px_20px_rgba(43,68,48,.025)] dark:border-[#354238] dark:bg-[#222c25]">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#95a095]">
                    Completed
                  </span>
                  <div className="rounded-xl bg-[#e9f7ed] p-2 text-[#5ba76d] dark:bg-[#2d4937] dark:text-[#b4e0b9]">
                    <CheckCheck size={16} />
                  </div>
                </div>
                <p className="heading text-[34px] font-extrabold tracking-[-1px]">
                  {completed.toString().padStart(2, "0")}
                </p>
                <p className="mt-1 text-[11px] text-[#9ba99c]">
                  Little wins add up
                </p>
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-2xl bg-[#276e48] p-6 text-white sm:p-7 dark:bg-[#315f41]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#b9d9c4]">
                    <Focus size={16} /> DAILY PROGRESS
                  </div>
                  <p className="heading text-[19px] font-bold tracking-[-.5px]">
                    You're making moves!
                  </p>
                  <p className="mt-1 text-[12px] text-[#c1deca]">
                    {completed} of {tasks.length} tasks completed. Keep it
                    going.
                  </p>
                </div>
                <div
                  className="heading flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[5px] border-[#67a983] bg-[#296a48] text-lg font-bold"
                  aria-label={`${progress}% complete`}
                >
                  {progress}%
                </div>
              </div>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#b8ebc9] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </section>

            <section className="mt-12">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="heading text-[22px] font-bold tracking-[-.8px]">
                    My tasks{" "}
                    <span className="ml-1 text-sm font-semibold text-[#a0afa2]">
                      ({tasks.length})
                    </span>
                  </h2>
                  <p className="mt-1.5 text-xs text-[#97a698]">
                    A clear mind starts with a clear list.
                  </p>
                </div>
                <button
                  onClick={openForm}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#368459] px-5 py-3 text-xs font-bold text-white shadow-[0_6px_14px_rgba(52,132,89,.17)] transition hover:bg-[#287449] active:scale-[.98]"
                >
                  <Plus size={17} strokeWidth={2.5} /> Add new task
                </button>
              </div>

              <div className="mt-7 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#e6ece5] bg-white p-1 dark:border-[#354238] dark:bg-[#222c25]">
                  {filters.map((item) => (
                    <button
                      key={item}
                      onClick={() => chooseFilter(item)}
                      className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold transition sm:px-4 ${filter === item ? "bg-[#e8f3ea] text-[#347d50] dark:bg-[#32503a] dark:text-[#b5e5bf]" : "text-[#99a59a] hover:text-[#507b5c]"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aea2]"
                    size={16}
                  />
                  <input
                    aria-label="Search tasks"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search tasks..."
                    className="w-full rounded-xl border border-[#e6ece5] bg-white py-2.5 pl-10 pr-4 text-xs outline-none transition placeholder:text-[#a5afa5] focus:border-[#8fc4a0] sm:w-55 dark:border-[#354238] dark:bg-[#222c25] dark:focus:border-[#619f76]"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {visibleTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d7e3d8] bg-white/60 px-5 py-14 text-center dark:border-[#405343] dark:bg-[#222c25]/60">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f4eb] text-[#568b64] dark:bg-[#334a39]">
                      <CheckCheck size={23} />
                    </div>
                    <h3 className="heading mt-4 font-bold">All clear here</h3>
                    <p className="mt-1.5 text-xs text-[#99a69b]">
                      {query
                        ? "Try a different search term."
                        : "No tasks in this view. Add one to get started!"}
                    </p>
                  </div>
                ) : (
                  visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className="task-enter group flex items-start gap-4 rounded-2xl border border-[#e6ece4] bg-white px-4 py-4 shadow-[0_4px_20px_rgba(43,68,48,.022)] transition hover:border-[#cadbce] sm:items-center sm:px-5 dark:border-[#354238] dark:bg-[#222c25] dark:hover:border-[#4b6551]"
                    >
                      <button
                        type="button"
                        aria-label={
                          task.completed
                            ? `Mark ${task.title} incomplete`
                            : `Complete ${task.title}`
                        }
                        aria-pressed={task.completed}
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-[7px] border-2 transition sm:mt-0 ${task.completed ? "border-[#55a276] bg-[#55a276] text-white" : "border-[#cedacf] bg-white hover:border-[#58a879] dark:border-[#708575] dark:bg-[#222c25]"}`}
                      >
                        {task.completed && <Check size={14} strokeWidth={3} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-[13px] font-bold leading-5 ${task.completed ? "text-[#a2b0a3] line-through" : "text-[#3b493c] dark:text-[#e5eee5]"}`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-[11px] leading-5 text-[#9aa89b] dark:text-[#a4b2a6]">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${priorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                        <button
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                          onClick={() => deleteTask(task.id)}
                          className="rounded-lg p-1.5 text-[#b6c1b6] transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-[#99a89b]">
                  Showing {visibleTasks.length} of {tasks.length} tasks
                </p>
                {completed > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-[11px] font-semibold text-[#7e9984] transition hover:text-rose-500 dark:text-[#b0c6b3]"
                  >
                    Clear completed tasks{" "}
                    <ArrowRight className="inline" size={13} />
                  </button>
                )}
              </div>
            </section>
            <footer className="mt-16 flex items-center justify-between border-t border-[#e5ece5] pt-5 text-[10px] text-[#a8b4a9] dark:border-[#334238]">
              <span>
                © {new Date().getFullYear()} TaskFlow. Made for focused minds.
              </span>
              <span className="flex items-center gap-1.5">
                <CircleHelp size={12} /> Your tasks are saved in this browser.
              </span>
            </footer>
          </div>
        </main>
      </div>

      {/* New task dialog */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#142419]/60 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
            className="w-full max-w-115 rounded-3xl border border-[#e9eee7] bg-white p-6 shadow-2xl sm:p-8 dark:border-[#3f5443] dark:bg-[#222e26]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7f4e9] text-[#368459] dark:bg-[#35523c] dark:text-[#b7ebc1]">
                <SlidersHorizontal size={21} />
              </div>
              <button
                aria-label="Close new task dialog"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-[#93a595] hover:bg-[#f3f6f2] dark:hover:bg-[#304034]"
              >
                <X size={19} />
              </button>
            </div>
            <h2
              id="add-task-title"
              className="heading mt-5 text-2xl font-extrabold tracking-[-.6px]"
            >
              Create a new task
            </h2>
            <p className="mt-2 text-sm text-[#90a194] dark:text-[#bacabd]">
              One small task, one step closer.
            </p>
            <form onSubmit={addTask} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-xs font-bold"
                >
                  Task title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="task-title"
                  ref={titleRef}
                  value={title}
                  maxLength={120}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Finish the landing page"
                  className="w-full rounded-xl border border-[#dfe9df] bg-[#fbfcfa] px-4 py-3 text-sm outline-none focus:border-[#6eb288] dark:border-[#455748] dark:bg-[#1b2620]"
                />
                {formError && (
                  <p role="alert" className="mt-1 text-xs text-rose-500">
                    {formError}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="task-desc"
                  className="mb-2 block text-xs font-bold"
                >
                  Description{" "}
                  <span className="font-normal text-[#9eb0a1]">(optional)</span>
                </label>
                <input
                  id="task-desc"
                  value={description}
                  maxLength={240}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="A little more detail..."
                  className="w-full rounded-xl border border-[#dfe9df] bg-[#fbfcfa] px-4 py-3 text-sm outline-none focus:border-[#6eb288] dark:border-[#455748] dark:bg-[#1b2620]"
                />
              </div>
              <fieldset>
                <legend className="mb-2 text-xs font-bold">Priority</legend>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setPriority(item)}
                      aria-pressed={priority === item}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${priority === item ? "border-[#66a57a] bg-[#eaf5ec] text-[#318150] dark:border-[#81b991] dark:bg-[#34543b] dark:text-[#c3efcc]" : "border-[#e1e9e1] text-[#8b9b8e] hover:border-[#98b99e] dark:border-[#455748]"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-[#e1e9e1] px-4 py-3 text-sm font-bold text-[#758779] hover:bg-[#f5f8f4] dark:border-[#455748] dark:text-[#bcd0bf] dark:hover:bg-[#2e4133]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#368459] px-4 py-3 text-sm font-bold text-white hover:bg-[#287449]"
                >
                  <Plus size={17} /> Add task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

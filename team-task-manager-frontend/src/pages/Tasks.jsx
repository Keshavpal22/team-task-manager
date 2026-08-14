import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  ClipboardList,
  X,
  Loader2,
  User,
  Flag,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

import { getProjects, getProjectMembers } from "../api/projects";

export default function Tasks() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Project members
  const [projectMembers, setProjectMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Task modal
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    project_id: "",
    assigned_to: "",
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
  });

  // =========================================================
  // LOAD TASKS
  // =========================================================

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTasks();

      setTasks(response.data.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  const loadProjects = async () => {
    try {
      const response = await getProjects();

      setProjects(response.data.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load projects.");
    }
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  // =========================================================
  // LOAD PROJECT MEMBERS
  // =========================================================

  const loadProjectMembers = async (projectId) => {
    if (!projectId) {
      setProjectMembers([]);
      return;
    }

    try {
      setMembersLoading(true);

      const response = await getProjectMembers(projectId);

      setProjectMembers(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load project members.",
      );

      setProjectMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = `${task.title || ""} ${
        task.description || ""
      } ${task.project?.name || ""} ${task.assignee?.name || ""}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  // =========================================================
  // CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingTask(null);

    setForm({
      project_id: "",
      assigned_to: "",
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
    });

    setProjectMembers([]);
    setError("");
    setShowModal(true);
  };

  // =========================================================
  // EDIT MODAL
  // =========================================================

  const openEditModal = async (task) => {
    setEditingTask(task);

    setForm({
      project_id: task.project_id || "",
      assigned_to: task.assigned_to || "",
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      due_date: task.due_date ? task.due_date.substring(0, 10) : "",
    });

    setError("");
    setShowModal(true);

    if (task.project_id) {
      await loadProjectMembers(task.project_id);
    }
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "project_id") {
      setForm((previous) => ({
        ...previous,
        project_id: value,
        assigned_to: "",
      }));

      await loadProjectMembers(value);
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        project_id: Number(form.project_id),
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
      };

      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }

      setShowModal(false);

      await loadTasks();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;

      if (validationErrors) {
        setError(Object.values(validationErrors).flat().join(" "));
      } else {
        setError(err.response?.data?.message || "Unable to save task.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (task) => {
    if (!isAdmin) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteTask(task.id);

      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete task.");
    }
  };

  // =========================================================
  // MEMBER STATUS UPDATE
  // =========================================================

  const handleStatusChange = async (task, newStatus) => {
    try {
      setError("");

      await updateTask(task.id, {
        status: newStatus,
      });

      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update task status.");
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClasses = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700";

      case "in_progress":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // =========================================================
  // PRIORITY STYLE
  // =========================================================

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700";

      case "medium":
        return "bg-amber-50 text-amber-700";

      default:
        return "bg-emerald-50 text-emerald-700";
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>

          <p className="text-slate-500 mt-1">Manage and track project tasks.</p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FILTERS */}

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>

            <option value="todo">To Do</option>

            <option value="in_progress">In Progress</option>

            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>

            <option value="high">High</option>

            <option value="medium">Medium</option>

            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* TASK LIST */}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 flex justify-center">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />

          <h3 className="font-semibold text-slate-900 mt-4">No tasks found</h3>

          <p className="text-sm text-slate-500 mt-1">
            {search || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try changing your filters."
              : "No tasks have been created yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                {/* LEFT */}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg text-slate-900">
                      {task.title}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        task.status,
                      )}`}
                    >
                      {task.status === "in_progress"
                        ? "In Progress"
                        : task.status === "completed"
                          ? "Completed"
                          : "To Do"}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getPriorityClasses(
                        task.priority,
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mt-2">
                    {task.description || "No description provided."}
                  </p>

                  {/* META */}

                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4" />

                      <span>{task.project?.name || "No project"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />

                      <span>{task.assignee?.name || "Unassigned"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />

                      <span>
                        Due:{" "}
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "No date"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex items-center gap-2 shrink-0">
                  {/* Member status */}

                  {!isAdmin && task.assigned_to === user?.id && (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="todo">To Do</option>

                      <option value="in_progress">In Progress</option>

                      <option value="completed">Completed</option>
                    </select>
                  )}

                  {/* Admin edit */}

                  {isAdmin && (
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                      title="Edit task"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  {/* Admin delete */}

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(task)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
                CREATE / EDIT TASK MODAL
            ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingTask ? "Edit Task" : "Create Task"}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {editingTask
                    ? "Update task details."
                    : "Create a new task and assign it to a project member."}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* TITLE */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  placeholder="e.g. Build Login Page"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the task..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* PROJECT / MEMBER */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project
                  </label>

                  <select
                    name="project_id"
                    value={form.project_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select project</option>

                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assign To
                  </label>

                  <select
                    name="assigned_to"
                    value={form.assigned_to}
                    onChange={handleChange}
                    disabled={!form.project_id || membersLoading}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                  >
                    <option value="">
                      {membersLoading ? "Loading members..." : "Unassigned"}
                    </option>

                    {projectMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STATUS / PRIORITY / DATE */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="todo">To Do</option>

                    <option value="in_progress">In Progress</option>

                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>

                    <option value="medium">Medium</option>

                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}

                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

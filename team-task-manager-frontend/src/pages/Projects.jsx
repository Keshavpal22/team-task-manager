import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  FolderKanban,
  X,
  Loader2,
  Users,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  getAvailableMembers,
  addProjectMember,
  removeProjectMember,
} from "../api/projects";

export default function Projects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Project modal
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Team modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [memberId, setMemberId] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    start_date: "",
    due_date: "",
  });

  const isAdmin = user?.role === "admin";

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProjects();

      setProjects(response.data.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // =========================================================
  // FILTER PROJECTS
  // =========================================================

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name?.toLowerCase().includes(search.toLowerCase()) ||
        project.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  // =========================================================
  // CREATE PROJECT MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingProject(null);

    setForm({
      name: "",
      description: "",
      status: "planning",
      start_date: "",
      due_date: "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // EDIT PROJECT MODAL
  // =========================================================

  const openEditModal = (project) => {
    setEditingProject(project);

    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "planning",
      start_date: project.start_date ? project.start_date.substring(0, 10) : "",
      due_date: project.due_date ? project.due_date.substring(0, 10) : "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // TEAM MODAL
  // =========================================================

  const openTeamModal = async (project) => {
    setSelectedProject(project);
    setShowTeamModal(true);
    setTeamLoading(true);
    setMemberId("");
    setError("");

    try {
      const [membersResponse, availableResponse] = await Promise.all([
        getProjectMembers(project.id),
        getAvailableMembers(),
      ]);

      setProjectMembers(membersResponse.data.data || []);

      setAvailableMembers(availableResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load team members.");
    } finally {
      setTeamLoading(false);
    }
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================================
  // CREATE / UPDATE PROJECT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingProject) {
        await updateProject(editingProject.id, form);
      } else {
        await createProject(form);
      }

      setShowModal(false);

      await loadProjects();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;

      if (validationErrors) {
        setError(Object.values(validationErrors).flat().join(" "));
      } else {
        setError(err.response?.data?.message || "Unable to save project.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PROJECT
  // =========================================================

  const handleDelete = async (project) => {
    if (!isAdmin) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProject(project.id);

      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete project.");
    }
  };

  // =========================================================
  // ADD MEMBER
  // =========================================================

  const handleAddMember = async () => {
    if (!memberId || !selectedProject || !isAdmin) {
      return;
    }

    try {
      setTeamLoading(true);
      setError("");

      await addProjectMember(selectedProject.id, Number(memberId));

      const response = await getProjectMembers(selectedProject.id);

      setProjectMembers(response.data.data || []);

      setMemberId("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add member.");
    } finally {
      setTeamLoading(false);
    }
  };

  // =========================================================
  // REMOVE MEMBER
  // =========================================================

  const handleRemoveMember = async (userId) => {
    if (!selectedProject || !isAdmin) {
      return;
    }

    const confirmed = window.confirm("Remove this member from the project?");

    if (!confirmed) {
      return;
    }

    try {
      setTeamLoading(true);
      setError("");

      await removeProjectMember(selectedProject.id, userId);

      const response = await getProjectMembers(selectedProject.id);

      setProjectMembers(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove member.");
    } finally {
      setTeamLoading(false);
    }
  };

  // =========================================================
  // STATUS CLASSES
  // =========================================================

  const getStatusClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700";

      case "completed":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>

          <p className="text-slate-500 mt-1">
            Manage and track your team projects.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search projects..."
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

            <option value="planning">Planning</option>

            <option value="active">Active</option>

            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* =====================================================
          PROJECT LIST
      ====================================================== */}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 flex justify-center">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />

          <h3 className="font-semibold text-slate-900 mt-4">
            No projects found
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {search || statusFilter !== "all"
              ? "Try changing your filters."
              : "Create your first project to get started."}
          </p>

          {isAdmin && !search && statusFilter === "all" && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition"
            >
              {/* Project header */}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg text-slate-900 truncate">
                    {project.name}
                  </h3>

                  <span
                    className={`inline-flex mt-2 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                      project.status,
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Team */}

                  <button
                    onClick={() => openTeamModal(project)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    title="Manage team"
                  >
                    <Users className="w-4 h-4" />
                  </button>

                  {/* Edit */}

                  {isAdmin && (
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                      title="Edit project"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete */}

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(project)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}

              <p className="text-sm text-slate-500 mt-4 line-clamp-2">
                {project.description || "No description provided."}
              </p>

              {/* Dates */}

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />

                  <span>
                    Start:{" "}
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />

                  <span>
                    Due:{" "}
                    {project.due_date
                      ? new Date(project.due_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Creator */}

              {project.creator && (
                <p className="text-xs text-slate-400 mt-4">
                  Created by{" "}
                  <span className="font-medium text-slate-600">
                    {project.creator.name}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          CREATE / EDIT PROJECT MODAL
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {editingProject
                    ? "Update project details."
                    : "Add a new project to your workspace."}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  placeholder="e.g. Website Redesign"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the project..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Status / Dates */}

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
                    <option value="planning">Planning</option>

                    <option value="active">Active</option>

                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
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

              {/* Buttons */}

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

                  {editingProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          TEAM MEMBERS MODAL
      ====================================================== */}

      {showTeamModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
            {/* Team Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Team Members
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedProject.name}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowTeamModal(false);
                  setSelectedProject(null);
                  setProjectMembers([]);
                  setMemberId("");
                }}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Add Member */}

              {isAdmin && (
                <div className="flex gap-2 mb-6">
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    disabled={teamLoading}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                  >
                    <option value="">Select member</option>

                    {availableMembers
                      .filter(
                        (member) =>
                          !projectMembers.some(
                            (assigned) => assigned.id === member.id,
                          ),
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} — {member.email}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={handleAddMember}
                    disabled={!memberId || teamLoading}
                    className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {teamLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
              )}

              {/* Members */}

              {teamLoading && projectMembers.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : projectMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />

                  <p className="text-sm text-slate-500 mt-3">
                    No members assigned to this project.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {member.name}
                          </p>

                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={teamLoading}
                          className="ml-4 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

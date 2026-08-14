import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  UserMinus,
  Loader2,
  Search,
  FolderKanban,
} from "lucide-react";

import { getProjects } from "../api/projects";

import {
  getTeamMembers,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "../api/team";

export default function Team() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD PROJECTS + MEMBERS
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsResponse, membersResponse] = await Promise.all([
        getProjects(),
        getTeamMembers(),
      ]);

      const projectList = projectsResponse.data.data.data || [];

      const memberList = membersResponse.data.data || [];

      setProjects(projectList);
      setMembers(memberList);

      if (projectList.length > 0) {
        setSelectedProject(String(projectList[0].id));

        await loadProjectMembers(projectList[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load team data.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PROJECT MEMBERS
  // =====================================================

  const loadProjectMembers = async (projectId) => {
    if (!projectId) {
      setProjectMembers([]);
      return;
    }

    try {
      setTeamLoading(true);
      setError("");

      const response = await getProjectMembers(projectId);

      setProjectMembers(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load project members.",
      );

      setProjectMembers([]);
    } finally {
      setTeamLoading(false);
    }
  };

  // =====================================================
  // PROJECT CHANGE
  // =====================================================

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);
    setSuccess("");
    setError("");

    await loadProjectMembers(projectId);
  };

  // =====================================================
  // CHECK MEMBER ASSIGNED
  // =====================================================

  const isMemberAssigned = (memberId) => {
    return projectMembers.some((member) => member.id === memberId);
  };

  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (member) => {
    if (!selectedProject) {
      return;
    }

    try {
      setActionLoading(`add-${member.id}`);

      setError("");
      setSuccess("");

      await addProjectMember(selectedProject, member.id);

      await loadProjectMembers(selectedProject);

      setSuccess(`${member.name} assigned successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign member.");
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // REMOVE MEMBER
  // =====================================================

  const handleRemoveMember = async (member) => {
    if (!selectedProject) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${member.name} from this project?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`remove-${member.id}`);

      setError("");
      setSuccess("");

      await removeProjectMember(selectedProject, member.id);

      await loadProjectMembers(selectedProject);

      setSuccess(`${member.name} removed successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove member.");
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // FILTER MEMBERS
  // =====================================================

  const filteredMembers = members.filter((member) => {
    const text = `${member.name} ${member.email}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      {/* HEADER */}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Team</h2>

        <p className="text-slate-500 mt-1">
          Manage members assigned to your projects.
        </p>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* PROJECT SELECTOR */}

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <FolderKanban className="w-5 h-5 text-blue-600" />

          <h3 className="font-semibold text-slate-900">Select Project</h3>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects available.</p>
        ) : (
          <select
            value={selectedProject}
            onChange={handleProjectChange}
            className="w-full max-w-xl rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* TEAM SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Members</p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {members.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Project Members</p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {projectMembers.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Available</p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {Math.max(members.length - projectMembers.length, 0)}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* MEMBERS */}

      <div className="bg-white rounded-xl border border-slate-200">
        {/* TABLE HEADER */}

        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">Team Members</h3>

            <p className="text-sm text-slate-500 mt-1">
              Assign or remove members from the selected project.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* CONTENT */}

        {teamLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />

            <p className="text-sm text-slate-500 mt-3">No members found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMembers.map((member) => {
              const assigned = isMemberAssigned(member.id);

              const addLoading = actionLoading === `add-${member.id}`;

              const removeLoading = actionLoading === `remove-${member.id}`;

              return (
                <div
                  key={member.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  {/* MEMBER */}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {member.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        {member.name}
                      </p>

                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                  </div>

                  {/* ACTION */}

                  <div className="flex items-center gap-3">
                    {assigned ? (
                      <>
                        <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                          Assigned
                        </span>

                        <button
                          onClick={() => handleRemoveMember(member)}
                          disabled={removeLoading}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {removeLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserMinus className="w-4 h-4" />
                          )}
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAddMember(member)}
                        disabled={addLoading || !selectedProject}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {addLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

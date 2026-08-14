import api from "./axios";

export const getProjects = (page = 1) => {
  return api.get(`/projects?page=${page}`);
};

export const getProject = (id) => {
  return api.get(`/projects/${id}`);
};

export const createProject = (data) => {
  return api.post("/projects", data);
};

export const updateProject = (id, data) => {
  return api.put(`/projects/${id}`, data);
};

export const deleteProject = (id) => {
  return api.delete(`/projects/${id}`);
};

export const getProjectMembers = (projectId) => {
  return api.get(`/projects/${projectId}/members`);
};

export const getAvailableMembers = () => {
  return api.get("/team/members");
};

export const addProjectMember = (projectId, userId) => {
  return api.post(`/projects/${projectId}/members`, {
    user_id: userId,
  });
};

export const removeProjectMember = (projectId, userId) => {
  return api.delete(`/projects/${projectId}/members/${userId}`);
};

import api from "./axios";

export const getTeamMembers = () => {
  return api.get("/team/members");
};

export const getProjectMembers = (projectId) => {
  return api.get(`/projects/${projectId}/members`);
};

export const addProjectMember = (projectId, userId) => {
  return api.post(`/projects/${projectId}/members`, {
    user_id: userId,
  });
};

export const removeProjectMember = (projectId, userId) => {
  return api.delete(`/projects/${projectId}/members/${userId}`);
};

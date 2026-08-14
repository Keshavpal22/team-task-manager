import api from "./axios";

export const getTasks = () => {
  return api.get("/tasks");
};

export const getTask = (taskId) => {
  return api.get(`/tasks/${taskId}`);
};

export const createTask = (data) => {
  return api.post("/tasks", data);
};

export const updateTask = (taskId, data) => {
  return api.patch(`/tasks/${taskId}`, data);
};

export const deleteTask = (taskId) => {
  return api.delete(`/tasks/${taskId}`);
};

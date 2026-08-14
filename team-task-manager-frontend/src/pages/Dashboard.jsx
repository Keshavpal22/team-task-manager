import { FolderKanban, CheckCircle2, Clock3, AlertCircle } from "lucide-react";

import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getProjects } from "../api/projects";
import { getTasks } from "../api/tasks";
import { PageSkeleton } from "../components/LoadingSkeleton";

export default function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [projectsResponse, tasksResponse] = await Promise.all([
        getProjects(),
        getTasks(),
      ]);

      const projectData = projectsResponse.data?.data?.data || [];

      const taskData = tasksResponse.data?.data?.data || [];

      setProjects(projectData);
      setTasks(taskData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // TASK COUNTS
  // -----------------------------------------

  const activeTasks = tasks.filter(
    (task) => task.status === "in_progress",
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) {
      return false;
    }

    if (task.status === "completed") {
      return false;
    }

    return new Date(task.due_date) < new Date();
  }).length;

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      description:
        user?.role === "admin" ? "All projects" : "Projects assigned to you",
    },
    {
      title: "Active Tasks",
      value: activeTasks,
      icon: Clock3,
      description: "Tasks currently in progress",
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: CheckCircle2,
      description: "Tasks completed",
    },
    {
      title: "Overdue Tasks",
      value: overdueTasks,
      icon: AlertCircle,
      description: "Tasks past their deadline",
    },
  ];

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return <PageSkeleton />;
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name} 👋
        </h2>

        <p className="text-slate-500 mt-1">
          Here's what's happening with your projects and tasks.
        </p>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Tasks */}

      <div className="mt-8 bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Recent Tasks</h3>

          <p className="text-sm text-slate-500 mt-1">
            Your latest assigned tasks.
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />

            <p className="text-slate-500 mt-3">No tasks yet</p>

            <p className="text-sm text-slate-400 mt-1">
              Create a project and start adding tasks.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>

                  <p className="text-sm text-slate-500 mt-1">
                    {task.project?.name || "No project"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Priority */}

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      task.priority === "high"
                        ? "bg-red-50 text-red-700"
                        : task.priority === "medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.priority}
                  </span>

                  {/* Status */}

                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {task.status === "in_progress"
                      ? "In Progress"
                      : task.status === "completed"
                        ? "Completed"
                        : "To Do"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

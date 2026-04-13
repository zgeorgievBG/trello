export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: number;
    projectId: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority | null;
    assignee: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDTO {
    projectId: number;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
}

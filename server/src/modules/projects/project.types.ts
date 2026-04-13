export interface Project {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectDTO {
    name: string;
    description?: string;
}

export interface UpdateProjectDTO {
    name?: string;
    description?: string;
}

import * as projectRepository from './project.repository';
import { Project, CreateProjectDTO, UpdateProjectDTO } from './project.types';

export const getAllProjects = async (): Promise<Project[]> => {
    return projectRepository.findAll();
};

export const getProjectById = async (id: number): Promise<Project> => {
    const project = await projectRepository.findById(id);
    if (!project) throw new Error('Project not found');
    return project;
};

export const createProject = async (data: CreateProjectDTO): Promise<Project> => {
    return projectRepository.create(data);
};

export const updateProject = async (id: number, data: UpdateProjectDTO): Promise<Project> => {
    const project = await projectRepository.update(id, data);
    if (!project) throw new Error('Project not found');
    return project;
};

export const deleteProject = async (id: number): Promise<void> => {
    const deleted = await projectRepository.remove(id);
    if (!deleted) throw new Error('Project not found');
};

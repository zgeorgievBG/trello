import * as taskRepository from './task.repository';
import { Task, CreateTaskDTO, UpdateTaskDTO } from './task.types';
import { PaginatedTasks, TaskQuery } from './task.repository';

export const getAllTasks = async (query: TaskQuery): Promise<PaginatedTasks> => {
    return taskRepository.findAll(query);
};

export const getTaskById = async (id: number): Promise<Task> => {
    const task = await taskRepository.findById(id);
    if (!task) {
        throw new Error('Task not found');
    }
    return task;
};

export const createTask = async (data: CreateTaskDTO): Promise<Task> => {
    return taskRepository.create(data);
};

export const updateTask = async (id: number, data: UpdateTaskDTO): Promise<Task> => {
    const task = await taskRepository.update(id, data);
    if (!task) {
        throw new Error('Task not found');
    }
    return task;
};

export const deleteTask = async (id: number): Promise<void> => {
    const deleted = await taskRepository.remove(id);
    if (!deleted) {
        throw new Error('Task not found');
    }
};

export const getTaskCounts = async (projectId: number): Promise<Record<string, number>> => {
    return taskRepository.getCounts(projectId);
};

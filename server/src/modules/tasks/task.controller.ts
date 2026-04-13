import type { Request, Response, NextFunction } from 'express';
import * as taskService from './task.service';

export const getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = parseInt(req.query.projectId as string);
        if (!projectId || isNaN(projectId)) {
            res.status(400).json({ data: null, error: 'projectId query param is required' });
            return;
        }

        const status = Array.isArray(req.query.status)
            ? (req.query.status[0] as string)
            : (req.query.status as string | undefined);

        const search = Array.isArray(req.query.search)
            ? (req.query.search[0] as string)
            : (req.query.search as string | undefined);

        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        const tasks = await taskService.getAllTasks({ projectId, status, search, page, limit });
        res.status(200).json({ data: tasks, error: null });
    } catch (err) {
        next(err);
    }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const task = await taskService.getTaskById(id);
        res.status(200).json({ data: task, error: null });
    } catch (err) {
        next(err);
    }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const task = await taskService.createTask(req.body);
        res.status(201).json({ data: task, error: null });
    } catch (err) {
        next(err);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const task = await taskService.updateTask(id, req.body);
        res.status(200).json({ data: task, error: null });
    } catch (err) {
        next(err);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        await taskService.deleteTask(id);
        res.status(200).json({ data: { message: 'Task deleted successfully' }, error: null });
    } catch (err) {
        next(err);
    }
};

export const getTaskCounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = parseInt(req.query.projectId as string);
        if (!projectId || isNaN(projectId)) {
            res.status(400).json({ data: null, error: 'projectId query param is required' });
            return;
        }
        const counts = await taskService.getTaskCounts(projectId);
        res.status(200).json({ data: counts, error: null });
    } catch (err) {
        next(err);
    }
};

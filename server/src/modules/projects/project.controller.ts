import type { Request, Response, NextFunction } from 'express';
import * as projectService from './project.service';

export const getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projects = await projectService.getAllProjects();
        res.status(200).json({ data: projects, error: null });
    } catch (err) {
        next(err);
    }
};

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const project = await projectService.createProject(req.body);
        res.status(201).json({ data: project, error: null });
    } catch (err) {
        next(err);
    }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const project = await projectService.updateProject(id, req.body);
        res.status(200).json({ data: project, error: null });
    } catch (err) {
        next(err);
    }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        await projectService.deleteProject(id);
        res.status(200).json({ data: { message: 'Project deleted successfully' }, error: null });
    } catch (err) {
        next(err);
    }
};

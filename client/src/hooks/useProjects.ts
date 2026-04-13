import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as projectsApi from '../api/projects'
import type { CreateProjectDTO, UpdateProjectDTO } from '../types/project.types'

export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: projectsApi.fetchProjects,
    })
}

export const useCreateProject = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateProjectDTO) => projectsApi.createProject(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    })
}

export const useUpdateProject = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProjectDTO }) =>
            projectsApi.updateProject(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    })
}

export const useDeleteProject = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => projectsApi.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

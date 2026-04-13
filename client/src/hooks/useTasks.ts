import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';
import type { CreateTaskDTO, UpdateTaskDTO, TaskStatus, Task } from '../types/task.types';

export const useTasks = (projectId: number) => {
    const [status, setStatus] = useState<TaskStatus | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const limit = 10

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['tasks', { projectId, status, search, page, limit }],
        queryFn: () => tasksApi.fetchTasks({ projectId, status, search, page, limit }),
    })

    const tasks = useMemo(() => data?.data ?? [], [data])
    const totalPages = useMemo(() => data?.totalPages ?? 1, [data])
    const total = useMemo(() => data?.total ?? 0, [data])

    const handleStatusFilter = useCallback((s: TaskStatus | undefined) => {
        setStatus(s)
        setPage(1)
    }, [])

    const handleSearch = useCallback((s: string) => {
        setSearch(s)
        setPage(1)
    }, [])

    const handlePageChange = useCallback((p: number) => {
        setPage(p)
    }, [])

    return {
        tasks,
        total,
        totalPages,
        page,
        status,
        search,
        isLoading,
        isError,
        error,
        handleStatusFilter,
        handleSearch,
        handlePageChange,
    }
}

export const useTaskCounts = (projectId: number) => {
    const { data: counts, isLoading } = useQuery({
        queryKey: ['tasks', 'counts', projectId],
        queryFn: () => tasksApi.fetchTaskCount(projectId),
    })

    return { counts, isLoading }
}

export const useCreateTask = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTaskDTO) => tasksApi.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

export const useUpdateTask = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTaskDTO }) =>
            tasksApi.updateTask(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })

            const queries = queryClient.getQueriesData<tasksApi.PaginatedResponse>({ queryKey: ['tasks'] })

            queries.forEach(([queryKey, queryData]) => {
                if (!queryData || !Array.isArray(queryData.data)) return
                queryClient.setQueryData(queryKey, {
                    ...queryData,
                    data: queryData.data.map((task: Task) =>
                        task.id === id ? { ...task, ...data } : task
                    ),
                })
            })

            return { queries }
        },
        onError: (_err, _vars, context) => {
            context?.queries.forEach(([queryKey, queryData]) => {
                queryClient.setQueryData(queryKey, queryData)
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

export const useDeleteTask = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => tasksApi.deleteTask(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })

            const queries = queryClient.getQueriesData<tasksApi.PaginatedResponse>({ queryKey: ['tasks'] })

            queries.forEach(([queryKey, queryData]) => {
                if (!queryData || !Array.isArray(queryData.data)) return
                queryClient.setQueryData(queryKey, {
                    ...queryData,
                    data: queryData.data.filter((task: Task) => task.id !== id),
                })
            })

            return { queries }
        },
        onError: (_err, _vars, context) => {
            context?.queries.forEach(([queryKey, queryData]) => {
                queryClient.setQueryData(queryKey, queryData)
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

export interface Comment {
    id: number;
    taskId: number;
    content: string;
    authorName: string | null;
    createdAt: string;
}

export interface CreateCommentDTO {
    content: string;
    authorName?: string;
}

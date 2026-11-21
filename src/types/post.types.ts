export interface CreatePostRequest {
    readonly title: string;
    readonly body: string;
    readonly userId: number;
}

// Response interface for a created post
export interface PostResponse extends CreatePostRequest {
    readonly id: number;
}
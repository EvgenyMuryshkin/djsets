export interface IYouTubeId {
    kind: string;
    videoId: string;
}

export interface IYouTubeSnippet {
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    liveBroadcastContent: "none" | "live"
    title: string;
}

export interface IYouTubeSearchItem {
    id: IYouTubeId;
    snippet: IYouTubeSnippet;
}

export interface IYouTubeSearchResponse {
    items: IYouTubeSearchItem[];
}

export interface IYouTubeError {
    code: number;
    message: number;
}

export interface IYouTubeErrorContainer {
    error: IYouTubeError
}

export interface IYouTubeQueryResult {
    setId: string;
    message?: string;
    result?: IYouTubeSearchResponse;
}
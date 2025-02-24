export interface IDJSet {
    id: string;
    channel: string;
    artist: string;
    title: string;
    episode: number;
    listenDate: string;
}

export interface IDJSets {
    version: number;
    sets: IDJSet[];
}
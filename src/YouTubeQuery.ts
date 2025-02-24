import { IDJSet } from "./Model";
import { IYouTubeErrorContainer, IYouTubeQueryResult, IYouTubeSearchResponse } from "./YouTubeModel";

export function youtubeCachedQuery(set: IDJSet) {
    const localVersionJson = localStorage.getItem(set.id);
    if (localVersionJson) {
        const localResult = JSON.parse(localVersionJson) as IYouTubeQueryResult
        if (!localResult.setId)
            localResult.setId = set.id;

        return localResult;
    }
    return null;
}

export async function youtubeQuery(
    apiKey: string | null,
    set: IDJSet, 
    remoteQuery: boolean = true
): Promise<IYouTubeQueryResult>  {
    if (!set) return { setId: "", message: "Set was not provided" };
    if (!apiKey) return { setId: set.id, message: "Not authenticated" };

    if (!remoteQuery) {
        const cachedResult = youtubeCachedQuery(set);
        if (cachedResult) return cachedResult;
    }

    try {
        const query = encodeURIComponent(`${set.artist} ${set.title}`);
        const fromDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString();
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&publishedAfter=${fromDate}&q=${query}&type=video&key=${apiKey}`

        console.log(url);

        const resp = await fetch(url);
        if (resp.status != 200) {
            const error: IYouTubeErrorContainer = await resp.json();
            return { setId: set.id, message: `${set.artist} ${set.title}: ${error?.error?.code} ${error?.error?.message}` };
        }

        const searchResponse: IYouTubeSearchResponse = await resp.json();
        const queryResult: IYouTubeQueryResult = { setId: set.id, result: searchResponse };
        const resultJSON = JSON.stringify(queryResult, null, 2);
        localStorage.setItem(set.id, resultJSON);

        return queryResult;
    }
    catch (ex) {
        return { setId: set.id, message:  `${set.artist} ${set.title}: ${ex}`}
    }
}
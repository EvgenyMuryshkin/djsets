import { use, useState } from 'react';
import { IDJSet, IDJSets } from './Model'
import { StorageService } from './Storage';
import { ListDJSets } from './ListDJSets';
import { DiagDJSets } from './DiagDJSets';
import { youtubeCachedQuery, youtubeQuery } from './YouTubeQuery';
import { IYouTubeQueryResult } from './YouTubeModel';
import "./DJSets.scss"
import { YouTubeAPIKeyInstructions } from './YouTubeAPIKeyInstructions';

interface IDJSetsProps {
    dataSourcePromise: Promise<IDJSets>
}
 
const youTubeKey = "YOUTUBE_API_KEY";

export function DJSets(props: IDJSetsProps) {
    const { dataSourcePromise } = props;
    const initialDataSource = use(dataSourcePromise);
    const cachedResults = initialDataSource.sets.map(s => youtubeCachedQuery(s)).filter(s => !!s);
    const [dataSource, setDataSource] = useState(initialDataSource);
    const [messages, setMessages] = useState<string[]>([]);
    const [queryResults, setQueryResults] = useState<IYouTubeQueryResult[]>(cachedResults);
    const [apiKey, setAPIKey] = useState(localStorage.getItem(youTubeKey) ?? "")
    const [isRunning, setIsRunning] = useState(false);

    const onUpdate = async (djSets: IDJSets) => {
        await StorageService.Save(djSets);
        setDataSource(djSets);
        return true;
    }

    const runSetQuery = async (set: IDJSet, remoteQuery: boolean) => {
        const newMessages: string[] = [];
        const newQueryResults: IYouTubeQueryResult[] = [];

        const queryResult = await youtubeQuery(apiKey, set, remoteQuery);
        newQueryResults.push(queryResult);

        const { result, message } = queryResult;

        if (message) {
            newMessages.push(message);
        }

        if (result) {
            const results = result
                .items
                .filter(i => i.snippet.channelTitle == [set.channel, set.artist].filter(a => a && a != "")[0])
                .filter(i => i.snippet.liveBroadcastContent == 'none')
                .sort((l,r) => l.snippet.publishedAt.localeCompare(r.snippet.publishedAt))
                .map(i => ({ id: i.id.videoId, title: i.snippet.title }));

            console.log(`${set.artist} ${set.title}`);
            console.log(results); 

            if (!results.length && result.items.length) {
                const channels = [...new Set(result.items.map(i => i.snippet.channelTitle))];

                newMessages.push(`No results for channel ${set.artist}. Available channels: ${channels.map(c => `[${c}]`).join(", ")}`)
            } 
        }
        
        return { newMessages, newQueryResults };
    }

    const runYoutubeQuery = async (remoteQuery: boolean) => {
        if (isRunning) return false;
        setIsRunning(true);
        
        try {
            const newMessages: string[] = [];
            const newQueryResults: IYouTubeQueryResult[] = [];
    
            for (const set of dataSource.sets) {
                setMessages([`Fetching ${set.artist} ${set.title}`]);

                const result = await runSetQuery(set, remoteQuery);
                newMessages.push(...result.newMessages);
                newQueryResults.push(...result.newQueryResults);
            }
    
            setMessages(newMessages);
            setQueryResults(newQueryResults);
        }
        catch (e: any) {
            setMessages([e.message ?? "Failed to run query"])
        }
        setIsRunning(false);
    }

    const updateSingleSet = async (set: IDJSet) => {
        if (isRunning) return false;

        setIsRunning(true);
        try {
            const result = await runSetQuery(set, true);
            const { newMessages, newQueryResults } = result;
    
            setMessages(newMessages);
    
            const updatedResults = queryResults.map(r => {
                const updated = newQueryResults.find(s => s.setId == r.setId);
                return updated ?? r;
            });
    
            setQueryResults(updatedResults);
        }
        catch (e: any) {
            setMessages([e.message ?? "Failed to update single set"])
        }
        setIsRunning(false);

        return true;
    }

    const hasAPIKey: boolean = apiKey !== null && apiKey !== undefined && apiKey !== "";

    const remoteQueryButton = hasAPIKey && <button disabled={isRunning} onClick={
        async () => {
            runYoutubeQuery(true)
        }}
    >Query YouTube</button>

    return (
        <>
            <div className='header'>
                <img className='logo' src="logo.svg"/>
                <strong className='header-title'>DJ Sets</strong>
            </div>
            <div className='youtube-panel'>
                <div className='youtube-panel-key'>
                    <div>
                        <span>YouTube API Key:&nbsp;</span>
                        <input className='youtube-panel-api-key' type='password' value={apiKey} onChange={(s) => {
                            setAPIKey(s.target.value);
                            localStorage.setItem(youTubeKey, s.target.value);
                        }}/>
                    </div>
                    <div>
                        <YouTubeAPIKeyInstructions/>
                    </div>
                </div>
                <div className='youtube-panel-controls'>
                    {remoteQueryButton}
                </div>
            </div>

            <ListDJSets 
                djSets={dataSource} 
                queryResults={queryResults}
                onUpdate={onUpdate}
                updateSingleSet={hasAPIKey && updateSingleSet}
            />

            <div>
                {messages.map((m, idx) => <div key={idx}>{m}</div> )}
            </div>

            <DiagDJSets
                djSets={dataSource} 
            />
        </>
    ) 
}
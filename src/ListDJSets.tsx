import { IDJSet, IDJSets } from "./Model";
import "./ListDJSets.scss"
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { BsPencilSquare, BsSave, BsXSquare, BsXCircle, BsArrowClockwise } from "react-icons/bs";
import relativeDate from "relative-date";
import dateFormat from "dateformat";
import { IYouTubeQueryResult } from "./YouTubeModel";

interface IListDJSetsProps {
    djSets: IDJSets;
    queryResults: IYouTubeQueryResult[];
    onUpdate: (djSets: IDJSets) => Promise<boolean>;
    updateSingleSet: ((set: IDJSet) => Promise<boolean>) | false;
}

export function ListDJSets(props: IListDJSetsProps) {
    const { djSets, queryResults, onUpdate, updateSingleSet } = props;
    const [editSet, setEditSet] = useState<IDJSet | null>(null);

    const updateEpisode = async (set: IDJSet, episode: number) => {
        const newSet: IDJSet = { ...set, episode, listenDate: new Date().toISOString() };
        const newSets = djSets.sets.map(s => s.id == set.id ? newSet : s);
        return await onUpdate({ ...djSets, sets: newSets })
    }

    const updateSet = async (set: IDJSet) => {
        const newSets = djSets.sets.map(s => s.id == set.id ? set : s);
        return await onUpdate({ ...djSets, sets: newSets })
    }

    return (
        <div className="ListDJSets">
            <table>
                <thead>
                    <tr>
                        <th className="control-icon"></th>
                        <th className="artist">Channel</th>
                        <th className="artist">Artist</th>
                        <th className="title">Title</th>
                        <th className="episode">Episode</th>
                        <th className="episode">Listened</th>
                        <th className="next">Next</th>
                        <th className="control-icon"></th>
                        <th className="next">Latest</th>
                        <th className="control-icon"></th>
                    </tr>
                </thead>
                <tbody>
                    {djSets.sets.map((s) => {
                        const queryResultItems = queryResults.find(r => r.setId == s.id)?.result?.items ?? [];
                        const channelItems = queryResultItems
                            .filter(i => i.snippet.channelTitle == [s.channel, s.artist].filter(a => a && a != "")[0])
                            .sort((l,r) => l.snippet.publishedAt.localeCompare(r.snippet.publishedAt))
                            .reverse()
                            ;

                        const episodes = channelItems
                            .map(searchItem => {
                                const title = searchItem.snippet.title;
                                const numbersPattern = /\d+/;
                                const parts = title
                                    .split(" ")
                                    .map(t => t.trim())
                                    .map(s => s.match(numbersPattern))
                                    .filter(s => !!s)
                                    .map(s => parseInt(s[0]));
                                return { searchItem, parts };
                            })
                            .filter(p => p.parts.length == 1)
                            ;

                            const latestEpisode = episodes[0];
                            const nextEpisode = episodes.find(e => e.parts[0] == s.episode + 1);

                        //channelItems.forEach(i => console.log(`${i.snippet.channelTitle} ${i.snippet.title}`));
                        /*
                        const ids = channelItems.map(i => {
                            const parts = i.snippet.title.split(" ").map(p => {
                                return p.trim().
                            })
                        })
                        */

                        if (editSet?.id == s.id) {
                            const listenDate = dateFormat(editSet.listenDate, "yyyy-mm-dd");

                            return (
                                <tr key={s.id}>
                                    <td className="control-icon">
                                        <BsSave onClick={async () => {
                                            await updateSet(editSet);
                                            await setEditSet(null)
                                        }}/>
                                    </td>
                                    <td className="channel">
                                        <input 
                                            type="text" 
                                            value={editSet.channel} 
                                            onChange={(i) => setEditSet({...editSet, channel: i.target.value})}
                                        />
                                    </td>
                                    <td className="artist">
                                        <input 
                                            type="text" 
                                            value={editSet.artist} 
                                            onChange={(i) => setEditSet({...editSet, artist: i.target.value})}
                                        />
                                    </td>
                                    <td className="title">
                                        <input 
                                            type="text" 
                                            value={editSet.title} 
                                            onChange={(i) => setEditSet({...editSet, title: i.target.value})}
                                        />
                                    </td>
                                    <td className="episode">
                                        <input 
                                            type="number" 
                                            value={editSet.episode} 
                                            onChange={(i) => setEditSet({...editSet, episode: parseInt(i.target.value)})}
                                        />                                        
                                    </td>
                                    <td className="listenDate">
                                    <input 
                                            type="date" 
                                            value={listenDate} 
                                            onChange={(i) => {
                                                setEditSet({...editSet, listenDate: new Date(i.target.value).toISOString()})
                                            }}
                                        />   
                                    </td>
                                    <td className="next"></td>
                                    <td className="control-icon"></td>
                                    <td className="next"></td>
                                    <td className="control-icon">
                                        <BsXSquare onClick={async () => {
                                            await setEditSet(null)
                                        }}/>
                                    </td>                                    
                                </tr>
                            )
                        }
                        else {
                            const dateText = relativeDate(new Date(s.listenDate));

                            return (
                                <tr key={s.id}>
                                    <td className="control-icon">
                                        <BsPencilSquare onClick={async () => {
                                            await setEditSet(s);
                                        }}/>
                                    </td>                                     
                                    <td className="channel">
                                        {s.channel}
                                    </td>
                                    <td className="artist">
                                        <a onClick={() => {
                                                const url = `https://www.youtube.com/results?search_query=${s.artist}`;
                                                window.open(url, "_new");
                                            }}>
                                            {s.artist}
                                        </a>
                                    </td>
                                    <td className="title">
                                        <a onClick={() => {
                                            const url = `https://www.youtube.com/results?search_query=${s.title}`;
                                            window.open(url, "_new");
                                        }}>
                                        {s.title}
                                        </a>
                                    </td>
                                    <td className="episode">
                                        <a onClick={() => updateEpisode(s, s.episode - 1)}>&lt;&nbsp;</a>
                                        <a onClick={() => {
                                            const url = `https://www.youtube.com/results?search_query=${s.title} ${s.episode}`;
                                            window.open(url, "_new");
                                        }}>{s.episode}</a>
                                        <a onClick={() => updateEpisode(s, s.episode + 1)}>&nbsp;&gt;</a>
                                    </td>
                                    <td className="listenDate">
                                        {dateText}
                                    </td>
                                    <td className="next">
                                        {nextEpisode && <a onClick={async () => {
                                            if (await updateEpisode(s, s.episode + 1)) {
                                                const url = `https://www.youtube.com/watch?v=${nextEpisode.searchItem.id.videoId}`;
                                                window.open(url, "_new");
                                            }
                                        }}>{nextEpisode?.parts[0]}</a>}

                                    </td>
                                    <td className="control-icon">
                                        {updateSingleSet && <BsArrowClockwise onClick={async () => {
                                            await updateSingleSet(s);
                                        }}/>}
                                    </td>
                                    <td className="next">
                                        {latestEpisode && <a onClick={async () => {
                                            if (await updateEpisode(s, latestEpisode.parts[0])) {
                                                const url = `https://www.youtube.com/watch?v=${latestEpisode.searchItem.id.videoId}`;
                                                window.open(url, "_new");
                                            }
                                        }}>{latestEpisode?.parts[0]}</a>}
                                    </td>                                    
                                    <td className="control-icon">
                                        <BsXCircle onClick={async () => {
                                            if (!confirm(`Delete ${s.artist} - ${s.title}`)) return
                                            const updatedSets: IDJSets = {
                                                ...djSets, 
                                                sets: djSets.sets.filter(t => t.id != s.id)
                                            };
    
                                            await onUpdate(updatedSets);
                                        }}/>
                                    </td>
                                </tr>
                            )
                        }                        
                    })}
                </tbody>
            </table>
            <div className="ListDJSetsControls">
                <div className="lhs-controls">
                <button 
                    onClick={async () => {
                        const newSet: IDJSet = {
                            id: uuidv4(),
                            channel: "",
                            artist: "",
                            title: "",
                            episode: 0,
                            listenDate: new Date().toISOString()
                        }

                        const newSets = [...djSets.sets, newSet];
                        await onUpdate({ ...djSets, sets: newSets })
                        await setEditSet(newSet);
                    }}>Add</button>

                    <button onClick={() => {
                        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(djSets, null, 2));
                        var downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href",     dataStr);
                        downloadAnchorNode.setAttribute("download", "djsets.json");
                        document.body.appendChild(downloadAnchorNode); // required for firefox
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                    }}>Export</button>

                    <input 
                        id="json-import" 
                        type="file" 
                        accept=".json" style={{ display: "none" }}
                        onChange={async (f) => {
                            const selectedFile = f.target.files?.[0];
                            if (!selectedFile) return;


                            async function parseJsonFile(selectedFile: File) {
                                return new Promise<IDJSets>((resolve, reject) => {
                                  const fileReader = new FileReader()
                                  fileReader.onload = event => resolve(JSON.parse(event?.target?.result as unknown as string))
                                  fileReader.onerror = error => reject(error)
                                  fileReader.readAsText(selectedFile)
                                })
                              }
                              
                            const json = await parseJsonFile(selectedFile);
                            if (!json?.sets) return;

                            const newSets = [...djSets.sets];

                            json.sets.forEach(n => {
                                if (newSets.find(s => s.id == n.id)) return;

                                newSets.push(n);
                            })

                            await onUpdate({ ...djSets, sets: newSets });
                        }}
                    />

                    <button onClick={() => {
                        document.getElementById("json-import")?.click();
                    }}>Import</button>
                </div>
                <div className="rhs-controls">
                <button onClick={async () => {
                        if (!confirm("Reset DJ Sets?")) return;
                        await onUpdate({ ...djSets, sets: [] });
                    }}>Reset</button>
                </div>
            </div>
        </div>
    )
}
import { useState } from "react";
import "./DiagDJSets.scss"
import { IDJSets } from "./Model";

interface IProps {
    djSets: IDJSets;
}

export function DiagDJSets(props: IProps) {
    const { djSets } = props;
    const [showDiag, setShowDiag] = useState(false);

    if (!showDiag) {
        return null;// <div><a onClick={() => setShowDiag(true)} >Show data set</a></div>
    }

    return (
        <>
            <div><a onClick={() => setShowDiag(false)} >Hide data set</a></div>
            <div className="DiagDJSets">
                <div></div>
                <div className="DiagDJSetsJSON">
                    <pre>{JSON.stringify(djSets, null, 2)}</pre>
                </div>
            </div>
        </>
    )
}
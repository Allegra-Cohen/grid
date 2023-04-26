import Backend from "./Backend.js";
import noMetadata from './Metadata.js';
import {useDrag} from "react-dnd";
import {useEffect, useState} from "react";

import "./Corpus.css"

function Sentence({text, onChange, activateSentence, isActive, apiurl}) {
    const backend = new Backend(apiurl);

    const [{ isDragging }, dragRef] = useDrag({
        type: 'sentence',
        item: {text},
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    return (
        <li ref={dragRef} className={isActive ? 'selected' : 'unselected'}
            onDrag={(evt) => {activateSentence()}}
            onClick={(evt) => {
                const request = backend.toRequest("sentenceClick", ["text", text]);
                backend.fetchThen(request, response => {
                    if (isActive) {
                        activateSentence();
                        onChange(noMetadata);
                    }
                    else {
                        activateSentence(text);
                        onChange(response);
                    }
                });
            }}
        >
            {text} {isDragging}
        </li>
    );
}

export default function Corpus({sentences, onChange, apiurl}) {
    const [activeSentence, setActiveSentence] = useState();
    const activateSentence = (item) => setActiveSentence(item);
    const items = sentences.map((s, ix) =>
        <Sentence key={ix} text={s}
            onChange={onChange}
            activateSentence={activateSentence}
            isActive={activeSentence === s}
            apiurl={apiurl}
        />
    )

    useEffect(()=>{
        setActiveSentence();
    },[sentences])

    return (
        <div className="corpus">
            <div className="header"><u>Sentences</u></div>
            <ul>
                {items}
            </ul>
        </div>
    );
}

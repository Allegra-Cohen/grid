import Backend from "./Backend";
import Callback from "./Callback";
import noMetadata from './Metadata';

import {useDrag} from "react-dnd";
import {useEffect, useState} from "react";

import "./Corpus.css";

function Sentence({text, onChange, activateSentence, isActive, apiurl}) {
    const backend = new Backend(apiurl);

    const handleCollect = new Callback("Sentence.handleCollect").get(monitor => {
        const result = {isDragging: monitor.isDragging()};
        return result;
    });

    const [{isDragging}, dragRef] = useDrag({
        type: 'sentence',
        item: {text},
        collect: handleCollect
    });

    const className = isActive ? "selected" : "unselected";

    const handleClick = new Callback("Sentence.handleClick").get(evt => {
        const request = backend.toRequest("sentenceClick", ["text", text]);
        backend.fetchThen(request, response => {
            if (isActive) {
                activateSentence("");
                onChange(noMetadata);
            }
            else {
                activateSentence(text);
                onChange(response);
            }
        });
    });

    return (
        <li ref={dragRef} className={className} onDrag={activateSentence} onClick={handleClick}>
            {text} {isDragging}
        </li>
    );
}

export default function Corpus({sentences, onChange, apiurl}) {
    const [activeSentence, setActiveSentence] = useState();

    const activateSentence = item => setActiveSentence(item);
    
    const items = sentences.map((s, ix) =>
        <Sentence key={ix} text={s}
            onChange={onChange}
            activateSentence={activateSentence}
            isActive={activeSentence === s}
            apiurl={apiurl}
        />
    );

    useEffect(()=> {
        setActiveSentence();
    }, [sentences]);

    return (
        <div className="corpus">
            <div className="header"><u>Sentences</u></div>
            <ul>
                {items}
            </ul>
        </div>
    );
}

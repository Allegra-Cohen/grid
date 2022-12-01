import {useDrag} from "react-dnd";
import {useId, useEffect, useState} from "react";
import "./Corpus.css"

function Sentence({text, onChange, activateSentence, isActive, apiUrl, userID}) {
    const [{ isDragging }, dragRef] = useDrag({
        type: 'sentence',
        item: { text },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })
    return <li ref={dragRef} 
                style={{border: isActive ? '2px solid #BE1C06' : null}}

                onClick={(evt) => {
                        fetch(`${apiUrl}/sentenceClick/${text}/${userID}`)
                        .then( response => response.json())
                        .then( response => {onChange(response)} );
                        activateSentence(text);
                    }
        }

    >{text} {isDragging}</li>
}

export default function Corpus({sentences, onChange, edit, training, apiUrl, userID}) {

    const [activeSentence, setActiveSentence] = useState();
    const activateSentence = (item) => setActiveSentence(item);

    let items = sentences.map((s, ix) => <Sentence key={ix} text={s} onChange={onChange} activateSentence={activateSentence} isActive={activeSentence === s} apiUrl={apiUrl} userID={userID}/>)
    return (

            <ul className = 'corpus' id='style-3'style={{
                marginLeft:".2em",
                height: edit & !training ? "75em" : "35em",
                overflowY: "scroll"
            }}><div class="force-overflow">
                {items}
                </div>
            </ul>

    )
}
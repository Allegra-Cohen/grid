import {useDrag} from "react-dnd";
import {useId, useEffect, useState} from "react";
import "./Corpus.css"
import noMetadata from './Metadata.js'

function Sentence({text, onChange, activateSentence, isActive, apiUrl, userID}) {
    const [{ isDragging }, dragRef] = useDrag({
        type: 'sentence',
        item: { text },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })
    return <li ref={dragRef} onDrag={(evt) => {activateSentence()}}
                style={{border: isActive ? '2px solid #BE1C06' : null}}

                onClick={(evt) => {
                        fetch(`${apiUrl}/sentenceClick/${text}/${userID}`)
                        .then( response => response.json())
                        .then( response => {
                        if (isActive){
                            activateSentence();
                            onChange(noMetadata);
                        } else {
                            activateSentence(text);
                            onChange(response);
                        }
                    }
                        );
                    }
        }

    >{text} {isDragging}</li>
}

export default function Corpus({sentences, onChange, edit, training, apiUrl, userID}) {

    const [activeSentence, setActiveSentence] = useState();
    const activateSentence = (item) => setActiveSentence(item);

    useEffect(()=>{
        setActiveSentence();
    },[sentences])

    let items = sentences.map((s, ix) => <Sentence key={ix} text={s} onChange={onChange} activateSentence={activateSentence} isActive={activeSentence === s} apiUrl={apiUrl} userID={userID}/>)
    return (

            <ul className = 'corpus style-3' style={{
                marginLeft:".2em",
                marginRight:"2em",
                height: edit & !training ? "75em" : "35em",
                overflowY: "scroll"
            }}>
                {items}
                
            </ul>

    )
}
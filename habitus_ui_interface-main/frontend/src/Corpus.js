import {useDrag} from "react-dnd";
import {useId, useEffect, useState} from "react";
import noMetadata from './Metadata.js';

function Sentence({text, onChange, activateSentence, isActive, apiurl}) {
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
                        fetch(`${apiurl}/sentenceClick/${text}`)
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

export default function Corpus({sentences, onChange, apiurl}) {

    const [activeSentence, setActiveSentence] = useState();
    const activateSentence = (item) => setActiveSentence(item);

    let items = sentences.map((s, ix) => <Sentence key={ix} text={s} onChange={onChange} activateSentence={activateSentence} isActive={activeSentence === s} apiurl={apiurl} />)

    useEffect(()=>{
        setActiveSentence();
    },[sentences])

    return (

            <ul style={{
                marginLeft:".2em",
                height: "1200px",
                overflow: "auto",
            }}>
                {items}
            </ul>

    )
}
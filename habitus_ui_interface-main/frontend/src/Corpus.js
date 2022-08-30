import {useDrag} from "react-dnd";
import {useId, useEffect, useState} from "react";

function Sentence({text, onChange, activateSentence, isActive, apiUrl}) {
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
                        fetch(`${apiUrl}/sentenceClick/${text}`)
                        .then( response => response.json())
                        .then( response => {onChange(response)} );
                        activateSentence(text);
                    }
        }

    >{text} {isDragging}</li>
}

export default function Corpus({sentences, onChange, apiUrl}) {

    const [activeSentence, setActiveSentence] = useState();
    const activateSentence = (item) => activeSentence === item ? setActiveSentence() : setActiveSentence(item);

    let items = sentences.map((s, ix) => <Sentence key={ix} text={s} onChange={onChange} activateSentence={activateSentence} isActive={activeSentence === s} apiUrl={apiUrl} />)
    return (

            <ul style={{
                // width:"30em",
                marginLeft:".5em" //3
                // height: "50%",
                // overflow: "scroll"
            }}>
                {items}
            </ul>

    )
}
import { useDrag } from "react-dnd";
import { useEffect, useState } from "react";
import { fetchDataFromApi, toQuery } from "services";

function Sentence({ text, onChange, activateSentence, isActive }) {
    const [{ isDragging }, dragRef] = useDrag({
        type: 'sentence',
        item: { text },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })
    return <li className="li-corpus" ref={dragRef} onDrag={(evt) => { activateSentence() }}
        style={{ border: isActive ? '2px solid #BE1C06' : '2px solid #eee' }}
        onClick={(evt) => {
            let query = toQuery([["text", text]]);
            fetchDataFromApi(`/sentenceClick/${query}`)
                .then(response => {
                    if (isActive) {
                        activateSentence();
                        onChange([]);
                    } else {
                        activateSentence(text);
                        onChange(response);
                    }
                });
        }}
    >
        {text} {isDragging}
    </li>
}

export default function Corpus({ sentences, onChange }) {

    const [activeSentence, setActiveSentence] = useState();
    const activateSentence = (item) => setActiveSentence(item);

    let items = sentences && sentences.length > 0 && sentences.map((s, ix) => <Sentence key={ix} text={s} onChange={onChange} activateSentence={activateSentence} isActive={activeSentence === s} />)

    useEffect(() => {
        setActiveSentence();
    }, [sentences])

    return (

        <ul style={{
            padding: 0
        }}>
            {items}
        </ul>

    )
}
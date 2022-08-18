import {useDrag} from "react-dnd";

function Sentence({text}) {
    const [{ isDragging }, dragRef] = useDrag({
        type: 'sentence',
        item: { text },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })
    return <li ref={dragRef}>{text} {isDragging}</li>
}

export default function Corpus({sentences}) {

    let items = sentences.map((s, ix) => <Sentence key={ix} text={s} />)
    return (

            <ol style={{
                // width:"30em",
                marginLeft:".5em" //3
                // height: "50%",
                // overflow: "scroll"
            }}>
                {items}
            </ol>

    )
}
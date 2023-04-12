import "./Beliefs.css"


function Belief({belief_record}) {
    const {id, belief, title, author, year} = belief_record;
    const cooked_id = id >= 0 ? id.toString() : "<id unknown>";
    const cooked_belief = belief != "" ? belief : "<belief unknown>";
    const cooked_title = title != "" ? title : "<title unknown>";
    const cooked_author = author != "" ? author : "<author unknown>";
    const cooked_year = year >= 0 ? year.toString() : "<year unknown>";
    return(
        <li>{cooked_id}. &quot;{cooked_belief}&quot; in <i>{cooked_title}</i> by {cooked_author}, {cooked_year}.</li>
    );
}

export default function Beliefs({beliefs, edit, training}) {
    const items = beliefs.map((belief, index) => <Belief key={index} belief_record={belief}/>);

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div style={{fontFamily:'InaiMathi', fontSize:'18pt', textAlign:'center', marginBottom:'16px'}}><u>Beliefs</u></div>
            <div style={{display:'inline', width:'300px'}}>
                <ul className = 'beliefs style-3' style={{
                    marginTop: "0",
                    paddingLeft: "0",
                    height: edit & !training ? "75em" : "35em",
                    overflowY: "scroll"
                }}>
                    {items}
                </ul>
            </div>
        </div>
    );
}

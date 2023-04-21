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

export default function Beliefs({beliefsAvailable, beliefs}) {
    const items = beliefs.map((belief, index) => <Belief key={index} belief_record={belief}/>);

    return (
        <div className={"beliefs " + (beliefsAvailable ? "beliefsAvailable" : "beliefsUnavailable")}>
            <div className="header"><u>Beliefs</u></div>
            <div className="content">
                <ul className="beliefs style-3">
                    {items}
                </ul>
            </div>
        </div>
    );
}

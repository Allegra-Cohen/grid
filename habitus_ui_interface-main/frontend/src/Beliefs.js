import "./Beliefs.css"


function Belief({belief}) {
    const {id, text, title, author, year} = belief;
    return(
        <li>{id}. &quot;{text}&quot; in <i>{title}</i> by {author}, {year}.</li>
    );
}

export default function Beliefs({beliefs}) {
    const items = beliefs.map((belief) => <Belief belief={belief}/>);

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div style={{fontFamily:'InaiMathi', fontSize:'18pt', textAlign:'center', marginBottom:'16px'}}><u>Beliefs</u></div>
            <div style={{display:'inline', width:'300px', paddingTop:'.3em'}}>
                Keith was here above list.
                <ul>
                    {items}
                </ul>
                Keith was here below list.
            </div>
        </div>
    );
}

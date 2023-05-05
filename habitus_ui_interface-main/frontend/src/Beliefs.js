import "./Beliefs.css"

class ColorSwatch {
    // Each range should have two values.
    // There should be three colorRanges.
    constructor(valueRange, colorRanges) {
        this.valueRange = valueRange;
        this.colorRanges = colorRanges;
    }

    toColor(rgb) {
        const result = "rgb(" +
                Math.round(rgb[0]) + "," +
                Math.round(rgb[1]) + "," +
                Math.round(rgb[2]) + ")";
        console.log(result);
        return result;
    }

    sample(value) {
        const ratio = (value - this.valueRange[0]) / (this.valueRange[1] - this.valueRange[0]);
        const result = this.colorRanges.map(range =>
            range[0] + ratio * (range[1] - range[0])
        );
        return this.toColor(result);
    }
}

var posColorSwatch = new ColorSwatch([0, 1.0], [[255, 99], [255, 190], [255, 123]]);
var negColorSwatch = new ColorSwatch([0, 1.0], [[255, 248], [255, 105], [255, 107]]);

function Belief({belief_record}) {
    const {id, belief, title, author, year, sentiment} = belief_record;
    const cooked_id = id >= 0 ? id.toString() : "<id unknown>";
    const cooked_belief = belief != "" ? belief : "<belief unknown>";
    const cooked_title = title != "" ? title : "<title unknown>";
    const cooked_author = author != "" ? author : "<author unknown>";
    const cooked_year = year >= 0 ? year.toString() : "<year unknown>";
    const color = sentiment >= 0 ? posColorSwatch.sample(sentiment) : negColorSwatch.sample(-sentiment);
    return(
        <li style={{backgroundColor: color}}>{cooked_id}. &quot;{cooked_belief}&quot; in <i>{cooked_title}</i> by {cooked_author}, {cooked_year}.
            sentiment = {sentiment}
        </li>
    );
}


export default function Beliefs({beliefsAvailable, beliefs}) {
    const items = beliefs.map((belief, index) => <Belief key={index} belief_record={belief}/>);

    return (
        <div className={"beliefs " + (beliefsAvailable ? "beliefsAvailable" : "beliefsUnavailable")}>
            <div className="header"><u>Beliefs</u></div>
            <div className="content">
                <ul className="beliefs style-3" sty>
                    {items}
                </ul>
            </div>
        </div>
    );
}

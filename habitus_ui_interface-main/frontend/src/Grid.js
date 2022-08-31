import {useDrop} from "react-dnd";
import {useId, useEffect, useState} from "react";
import "./Corpus.css"

function GridCell({id, colorValue, rowName, rowContents, colName, onChange, onDrop, activateCell, isActive, apiUrl}){
    // const gradientArray = ["#fafa6e","#c4ec74","#92dc7e","#64c987","#39b48e","#089f8f","#00898a","#08737f","#215d6e","#2a4858"];
    // const gradientArray = ["#d4a1ff", "#cb99f8","#c292f2","#b88aeb","#af83e5","#a67bde","#9d74d8","#936dd1","#8a66cb","#815fc5","#7758be","#6d51b8","#644bb2","#5a44ac","#4f3ea5", "#44379f", "#393199", "#2c2b93", "#1c268d", "#002087"]; 
    // const gradientArray = ["#fafa6e","#c4ec74","#92dc7e","#64c987","#39b48e","#089f8f","#00898a","#08737f","#215d6e","#2a4858", '#2a4858','#28475b','#28455f','#2a4261','#2f4063','#363d63',
    // '#3e3963','#463561','#4f305d','#572a58', "#48257a","#521047", "#52102d", "#4a0725"]
    // const gradientArray = ["#dabbf8","#d4b4f5","#ceacf2","#c8a5f0","#c29eed","#bc97ea","#b690e7","#b089e5","#aa82e2","#a37bdf","#9c74dc","#966dda","#8f66d7","#8860d4","#8059d2","#7952cf","#714ccd","#6945ca","#603fc7","#5738c5","#4d32c2","#412cc0","#3425bd","#231fbb","#0218b8"]
    // const gradientArray = ["#bbe9f8","#94d2ed","#87caea","#6dbae3","#54aadd","#47a2da","#399ad6","#2b92d3","#1a8acf","#0081cc","#0079c8","#0071c3","#0068bf","#0060ba","#0057b5","#004faf","#0046a9","#003da3","#00349c","#022a95","#111f8d"]
    // const gradientArray = ["#bbe9f8","#98d5ee","#76c0e5","#54aadd","#3095d4","#007fca","#0068bf","#0052b1","#003aa0","#111f8d"]
    // const gradientArray = ["#e7f5f9","#90c5e1","#4091cd", "#6dbae3","#54aadd","#47a2da", "#399ad6","#2b92d3","#1a8acf","#0081cc","#0079c8","#0060ba","#0057b5","#004faf","#0046a9","#003da3","#00349c","#3425bd","#231fbb","#0218b8","#111f8d", "#09156e","#0e1e93", "#0d1b84", "#0a166f", "#071053"]
    const gradientArray = ['#f0f7fd','#cce6fe','#a9d3ff','#87c1ff','#65adff','#4099ff','#0084ff','#0084ff','#117bf3','#1972e6','#1e69da','#2160ce','#2258c2','#234fb6','#2247aa','#213f9f','#203793','#1e2f88','#1b277d','#182071','#151867','#11115c', '#0f1159','#0c1057','#0a0f54','#080f51','#060e4e','#040e4c','#030d49','#020c46','#010b43','#010941','#01083e','#01063b','#020439','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236']
    //['#ffe4d3', '#fec2ee', '#fe9be0', '#fd7ad4', '#f56bf7', '#d759f1', '#c038f7', '#9522fb', '#7b23fb', '#6823fb', '#6022fb', '#3e24fb', '#4019de', '#3f0fc2', '#3b05a7', '#350796', '#32058a', '#2f037f']
    //["#feac5e","#ffa066","#ff9571","#ff8b7d","#ff828b","#ff7b9a","#fb77a9","#ee76b7","#dc77c4","#c779d0","#aa7dd5","#8c80d5","#6d81d1","#4d81c9","#2a80be","#007eb0","#007aa1","#007691","#007180","#106b71"]

    const [validRow, setValidRow] = useState();

    let ix = Math.floor(colorValue * 100)

    const [{ isOver }, dropRef] = useDrop({
        accept: 'sentence',
        drop: (item) => {
            fetch(`${apiUrl}/drag/${rowName}/${colName}/${item.text}`)
            .then( response => response.json())
            .then( data => {
                console.log('data', data);
                onDrop(data)
            });
            console.log([rowName, colName, item]);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver() && rowContents[rowName].includes(monitor.getItem().text)
        })
    })

    return (<td ref={dropRef} 

        style={{ 
            width: "5em",
            height: "4em",
            background: gradientArray[ix],
            border: isActive ? '2px solid #BE1C06' : null}}

        onClick={
      (evt) => {
        fetch(`${apiUrl}/click/${rowName}/${colName}`)
            .then( response => response.json())
            .then( response => {console.log(response);
                console.log(colName);
                onChange(response);
            });
            activateCell(id);
            console.log("evt",id);
               }
           }>
           { isOver && "Drop"}
    </td>);
    }

function GridRow({rowName, rowContents, data, onChange, onDrop, activateCell, activeCell, apiUrl}){

    let cells = Object.entries(data).map(([colName, v], ix) => <GridCell key={ix} id={rowName+colName} colorValue={v} rowName={rowName} rowContents={rowContents} colName={colName} onChange={onChange} onDrop={onDrop} activateCell={activateCell} isActive={activeCell === rowName+colName} apiUrl={apiUrl} />)

    return( <tr>
        <td style={{textAlign:'right',padding:'1em'}}>{rowName}</td>
        {cells}
    </tr>)
}

function Footer({id, colName, frozenColumns, onFooter, apiUrl}){
    
    return (
    <td key={id}><div style={{
        color: frozenColumns.includes(id) ? 'black' : 'blue'
    }}
    contenteditable="true" onInput={
            (evt) => {
                console.log(evt.target.lastChild, evt.target.lastChild.toString());
                if (evt.target.lastChild.toString() === "[object HTMLDivElement]") {
                    let text = evt.target.textContent;
                    fetch(`${apiUrl}/editName/${id}/${text}`)
                    .then( response => response.json())
                    .then( response => onFooter(response));
                    console.log("!", text);
                    evt.target.value = ''; // This clearly isn't dealing with the input field or something.
                    evt.target.blur();
                    window.location.reload() // Wow I hate this! I just can't figure out how to get the <td> to update dynamically without reloading the whole page. Footer is called again by the App to re-render, it just doesn't change contenteditable.
                }
            }

        }>{id}. {colName}</div>
    </td>)

}

export default function Grid({data, col_num_to_name, frozen_columns, row_contents, onChange, onDrop, onFooter, apiUrl}){
    const [activeCell, setActiveCell] = useState();
    const activateCell = (item) => activeCell === item ? setActiveCell() : setActiveCell(item);

    let gridRows = Object.entries(data).map(([name, cells], ix) => <GridRow key={ix} rowName={name} rowContents={row_contents} data={cells} onChange={onChange} onDrop={onDrop} activateCell={activateCell} activeCell={activeCell} apiUrl={apiUrl} />)
    // Get the col names from the first row
    // let rowNames = Object.keys(data)
    let rows = Object.values(data);
    let footer = null;
    if(rows.length > 0){
        let row = rows[0];
        let colIDs = Object.keys(row);
        let colNames = colIDs.map((colID) => col_num_to_name[colID]);
        // console.log('grid here');
        // console.log(col_num_to_name)
        footer = colNames.map((name, ix) => <Footer key = {ix} id={ix} colName={name} frozenColumns={frozen_columns} onFooter={onFooter} apiUrl={apiUrl} />)
    }


    return (
        <div>
            <table style={
                {
                    tableLayout: "fixed",
                    width: "50em",
                    textAlign: "center",
                    fontFamily: "InaiMathi"
                }
            }>
                <tbody>
                {gridRows}
                {footer && <tr><td/>{footer}</tr>}
                </tbody>
            </table>
        </div>
    )
}



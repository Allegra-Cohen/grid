import {useDrop} from "react-dnd";
import {useId, useEffect, useState} from "react";
import "./Corpus.css"
import "./Grid.css"

function GridCell({id, colorValue, rowName, rowContents, colName, onChange, onDrop, activateCell, isActive, apiUrl}){
  
    const gradientArray = ['#f0f7fd','#cce6fe','#a9d3ff','#87c1ff','#65adff','#4099ff','#0084ff','#0084ff','#117bf3','#1972e6','#1e69da','#2160ce','#2258c2','#234fb6','#2247aa','#213f9f','#203793','#1e2f88','#1b277d','#182071','#151867','#11115c', '#0f1159','#0c1057','#0a0f54','#080f51','#060e4e','#040e4c','#030d49','#020c46','#010b43','#010941','#01083e','#01063b','#020439','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236','#020236']

    const [validRow, setValidRow] = useState();

    let ix = Math.ceil(colorValue * 100)

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
        <td style={{textAlign:'left', padding:'1em'}}>{rowName}</td>
        {cells}
    </tr>)
}

function Footer({id, colName, frozenColumns, onFooter, onDeleteFrozen, apiUrl}){
    
    return (
    <td key={id}><div style={{
        color: colName.includes('Unassigned') ? '#616160' : (frozenColumns.includes(id) ? 'black' : 'blue'),
        textAlign: "center",
        verticalAlign:"top",
        width: "5em",
        padding:".1em"
    }}>
    {id}.<br/> {colName}
    {colName.includes('Unassigned') ? <div/> : <input placeholder={"Rename"} className="footer" style={{'--placeholder-color': 'gray'}} 
    onKeyDown={
            (evt) => {
                if(evt.key=="Enter"){
                    let text = evt.target.value.replace("\/", " | ").replace(/[.,#!$%\^&\*;:{}=\-_`~()]/g," ");
                    fetch(`${apiUrl}/editName/${id}/${text}`)
                    .then( response => response.json())
                    .then( response => {onFooter(response);
                        console.log("!!!", response.frozen_columns)
                    });
                    evt.target.value = '';
                    evt.target.blur();
                }
                }}/>}
    {frozenColumns.includes(id) ? <div> <button onClick={(evt) => {
                    fetch(`${apiUrl}/deleteFrozenColumn/${id}`)
                    .then( response => response.json())
                    .then( response => {onDeleteFrozen(response);
                    });
                }} >🗑</button> </div> :<div/>}
    </div>
    </td>)

}

export default function Grid({data, col_num_to_name, frozen_columns, row_contents, onChange, onDrop, onFooter, onDeleteFrozen, apiUrl}){
    const [activeCell, setActiveCell] = useState();
    const activateCell = (item) => setActiveCell(item);
    console.log(activeCell)

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
        footer = colNames.map((name, ix) => <Footer key = {ix} id={ix} colName={name} frozenColumns={frozen_columns} onFooter={onFooter} onDeleteFrozen={onDeleteFrozen} apiUrl={apiUrl} />)
    }


    return (
        <div>
            <table style={
                {
                    tableLayout: "fixed",
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



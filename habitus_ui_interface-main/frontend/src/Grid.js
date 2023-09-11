import { useDrop } from "react-dnd";
import { useId, useEffect, useState } from "react";
import "./Corpus.css"
import "./Grid.css"
import { toQuery } from "./toEncoding";
import { Icon } from "@iconify/react";

function GridCell({ id, colorValue, rowName, rowContents, colName, onChange, onDrop, activateCell, isActive, apiurl }) {

    const gradientArray = ['#e7ebee', '#cce6fe', '#98bde5', '#6c9acc', '#508acc', '#337acc', '#0069cc', '#0069cc', '#0d62c2', '#145bb8', '#1854ae', '#1a4ca4', '#2258c2', '#234fb6', '#2247aa', '#213f9f', '#203793', '#1e2f88', '#1b277d', '#182071', '#151867', '#11115c', '#0f1159', '#0c1057', '#0a0f54', '#080f51', '#060e4e', '#040e4c', '#030d49', '#020c46', '#010b43', '#010941', '#01083e', '#01063b', '#020439', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236']

    const [validRow, setValidRow] = useState();

    let ix = Math.ceil(colorValue * 100)

    const [{ isOver }, dropRef] = useDrop({
        accept: 'sentence',
        drop: (item) => {
            var query = toQuery([["row", rowName], ["col", colName], ["sent", item.text]]);
            fetch(`${apiurl}/drag/${query}`)
                .then(response => response.json())
                .then(data => {
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
            width: "4em",
            height: "55px",
            borderRadius: 3,
            cursor: "pointer",
            background: gradientArray[ix],
            border: isActive ? '2px solid #BE1C06' : `2px solid ${gradientArray[ix]}`
        }}

        onClick={
            (evt) => {
                let query = toQuery([["row", rowName], ["col", colName]]);
                fetch(`${apiurl}/click/${query}`)
                    .then(response => response.json())
                    .then(response => {
                        console.log(response);
                        console.log(colName);
                        onChange(response);
                    });
                activateCell(id);
                console.log("evt", id);
            }
        }>
        {isOver && "Drop"}
    </td>);
}

function GridRow({ rowName, rowContents, data, onChange, onDrop, activateCell, activeCell, apiurl }) {

    let cells = Object.entries(data).map(([colName, v], ix) => <GridCell key={ix} id={rowName + colName} colorValue={v} rowName={rowName} rowContents={rowContents} colName={colName} onChange={onChange} onDrop={onDrop} activateCell={activateCell} isActive={activeCell === rowName + colName} apiurl={apiurl} />)

    return (<tr>
        <td style={{ paddingRight: 10, fontWeight: 500, textAlign: 'right', cursor: 'default' }}    >{rowName}</td>
        {cells}
    </tr>)
}

function onDelete(id) {
    console.log('id', id)
}

function Footer({ id, colName, frozenColumns, onFooter, onDeleteFrozen, apiurl, editColName, setEditColName }) {
    const [showButtons, setShowButtons] = useState(false);
    const [hoverEdit, setHoverEdit] = useState(false);
    const [hoverDelete, setHoverDelete] = useState(false);

    return (
        <td key={id}><div style={{
            color: colName.includes('Unassigned') ? '#616160' : (frozenColumns.includes(id) ? '#2c2c2c' : "#4767AC"),
            textAlign: "center",
            width: "5em",
            marginTop: 5,
            padding: 5,
            minHeight: 80,
            cursor: colName.includes('Unassigned') ? 'default' : 'pointer' 
        }} onMouseEnter={() => setShowButtons(true)} onMouseLeave={() => setShowButtons(false)}>
            <div>
                {editColName === id ? <input placeholder={colName} className="footer" style={{ '--placeholder-color': 'gray'}}
                onKeyDown={
                    (evt) => {
                        if (evt.key == "Enter") {
                            let query = toQuery([["id", id], ["name", evt.target.value]])
                            fetch(`${apiurl}/editName/${query}`)
                                .then(response => response.json())
                                .then(response => {
                                    onFooter(response);
                                    console.log("!!!", response.frozen_columns)
                                    setEditColName('')
                                });
                            evt.target.value = '';
                            evt.target.blur();
                        }
                    }} /> : colName}
            </div>
            {!colName.includes('Unassigned') && showButtons && (
                <div style={{ marginTop: 10, gap: 5, display: 'flex', justifyContent: 'center', }}>
                    <Icon 
                        icon="akar-icons:edit" 
                        width="20" height="20" 
                        color={hoverEdit ? "#2c2c2c" : "#616160"}
                        onClick={() => setEditColName(id)} 
                        onMouseEnter={() => setHoverEdit(true)}
                        onMouseLeave={() => setHoverEdit(false)}
                    />
                    {frozenColumns.includes(id) && <Icon 
                        icon="octicon:trash-16" 
                        width="19" height="20" 
                        color={hoverDelete ? "#DC3545" : "#616160"}
                        onClick={(evt) => {
                            let query = toQuery([["id", id]])
                            fetch(`${apiurl}/deleteFrozenColumn/${query}`)
                            .then( response => response.json())
                            .then( response => {onDeleteFrozen(response);
                            });
                        }}
                        onMouseEnter={() => setHoverDelete(true)}
                        onMouseLeave={() => setHoverDelete(false)}
                    />}
                </div>
            )}
        </div>
        </td>
    )

}

export default function Grid({ data, col_num_to_name, frozen_columns, row_contents, onChange, onDrop, onFooter, onDeleteFrozen, apiurl }) {
    const [activeCell, setActiveCell] = useState();
    const [editColName, setEditColName] = useState(false);

    const activateCell = (item) => setActiveCell(item);


    let gridRows = Object.entries(data).map(([name, cells], ix) => <GridRow key={ix} rowName={name} rowContents={row_contents} data={cells} onChange={onChange} onDrop={onDrop} activateCell={activateCell} activeCell={activeCell} apiurl={apiurl} />)
    // Get the col names from the first row
    // let rowNames = Object.keys(data)
    let rows = Object.values(data);
    let footer = null;
    if (rows.length > 0) {
        let row = rows[0];
        let colIDs = Object.keys(row);
        let colNames = colIDs.map((colID) => col_num_to_name[colID]);
        // console.log('grid here');
        // console.log(col_num_to_name)
        footer = colNames.map((name, ix) => <Footer key={ix} id={ix} colName={name} editColName={editColName} setEditColName={setEditColName} frozenColumns={frozen_columns} onFooter={onFooter} onDeleteFrozen={onDeleteFrozen} apiurl={apiurl} />)
    }


    return (
        <div>
            <table style={
                {
                    tableLayout: "fixed",
                    color: '#2c2c2c',
                    fontSize: 14
                }
            }>
                <tbody>
                    {gridRows}
                    {footer && <tr><td />{footer}</tr>}
                </tbody>
            </table>
        </div>
    )
}



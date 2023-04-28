import Backend from "./Backend";
import Callback from "./Callback";

import {useDrop} from "react-dnd";
import {useState} from "react";

import "./Grid.css";

function GridCell({id, colorValue, rowName, rowContents, colName, onChange, onDrop, activateCell, isActive, apiurl}) {
    const gradientArray = [
        '#f0f7fd', '#cce6fe', '#a9d3ff', '#87c1ff', '#65adff', '#4099ff', '#0084ff', '#0084ff', '#117bf3', '#1972e6',
        '#1e69da', '#2160ce', '#2258c2', '#234fb6', '#2247aa', '#213f9f', '#203793', '#1e2f88', '#1b277d', '#182071',
        '#151867', '#11115c', '#0f1159', '#0c1057', '#0a0f54', '#080f51', '#060e4e', '#040e4c', '#030d49', '#020c46',
        '#010b43', '#010941', '#01083e', '#01063b', '#020439', '#020236', '#020236', '#020236', '#020236', '#020236',
        '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236',
        '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236',
        '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236',
        '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236',
        '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236',
        '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236',
        '#020236', '#020236', '#020236', '#020236', '#020236', '#020236', '#020236'
    ];

    const backend = new Backend(apiurl);

    const handleDrop = new Callback("GridCell.handleDrop").get(item => {
        const request = backend.toRequest("drag", ["row", rowName], ["col", colName], ["sent", item.text]);
        backend.fetchThen(request, response => {
            onDrop(response);
        });
        console.log("rowName, colName, item:", [rowName, colName, item]);
    });

    const handleCollect = new Callback("GridCell.handleCollect").get(monitor => {
        const result = {isOver: monitor.isOver() && rowContents[rowName].includes(monitor.getItem().text)};
        return result;
    });

    const [{isOver}, dropRef] = useDrop({
        accept: 'sentence',
        drop: handleDrop,
        collect: handleCollect
    });

    const handleClick = new Callback("GridCell.handleClick").get(evt => {
        const request = backend.toRequest("click", ["row", rowName], ["col", colName]);
        backend.fetchThen(request, response => {
            onChange(response);
            activateCell(id);
        });
    })

    const index = Math.ceil(colorValue * 100);
    const colorIndex = Math.min(index, gradientArray.length - 1);
    const background = gradientArray[colorIndex];
    const border = isActive ? '2px solid #BE1C06' : '2px transparent';

    return (
        <td ref={dropRef} onClick={handleClick} style={{width: "5em", height: "4em", background: background, border: border}}>
            {isOver && "Drop"}
        </td>
    );
}

function GridRow({rowName, rowContents, data, onChange, onDrop, activateCell, activeCell, apiurl}) {
    const cells = Object.entries(data).map(([colName, v], ix) =>
        <GridCell
            key={ix}
            id={rowName+colName}
            colorValue={v}
            rowName={rowName}
            rowContents={rowContents}
            colName={colName}
            onChange={onChange}
            onDrop={onDrop}
            activateCell={activateCell}
            isActive={activeCell === rowName+colName}
            apiurl={apiurl}
        />
    );

    return (
        <tr>
            <td style={{textAlign:'left', padding:'1em'}}>{rowName}</td>
            {cells}
        </tr>
    );
}

function Footer({id, colName, frozenColumns, onFooter, onDeleteFrozen, apiurl}) {
    const backend = new Backend(apiurl);

    const handleEditName = new Callback("Footer.handleEditName").get(evt => {
        if (evt.key === "Enter") {
            const request = backend.toRequest("editName", ["id", id], ["name", evt.target.value]);
            backend.fetchThen(request, response => {
                onFooter(response);
                evt.target.value = '';
                evt.target.blur();
            });
        }
    });

    const handleDelete = new Callback("Footer.handleDelete").get(evt => {
        const request = backend.toRequest("deleteFrozenColumn", ["id", id]);
        backend.fetchThen(request, response => {
            onDeleteFrozen(response);
        });
    });

    const color = colName.includes('Unassigned') ? '#616160' : (frozenColumns.includes(id) ? 'black' : 'blue');

    return (
        <td key={id}>
            <div style={{
                color: {color},
                textAlign: "center",
                verticalAlign: "top",
                width: "5em",
                padding:".1em"
            }}>
                {id}.<br/>
                {colName}
                {colName.includes('Unassigned') ?
                    <div/>
                    :
                    <input className="footer" placeholder={"Rename"} style={{'--placeholder-color': 'gray'}} onKeyDown={handleEditName} />
                }
                {frozenColumns.includes(id) ?
                    <div>
                        <button onClick={handleDelete}>&#x1F5D1;</button>
                    </div>
                    :
                    <div/>
                }
            </div>
        </td>
    );
}

export default function Grid({data, col_num_to_name, frozen_columns, row_contents, onChange, onDrop, onFooter, onDeleteFrozen, apiurl}) {
    const [activeCell, setActiveCell] = useState();

    const activateCell = (item) => setActiveCell(item);

    const gridRows = Object.entries(data).map(([name, cells], ix) => 
        <GridRow key={ix}
            rowName={name}
            rowContents={row_contents}
            data={cells}
            onChange={onChange}
            onDrop={onDrop}
            activateCell={activateCell}
            activeCell={activeCell}
            apiurl={apiurl}
        />
    );
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
        footer = colNames.map((name, ix) =>
            <Footer
                key = {ix} id={ix}
                colName={name}
                frozenColumns={frozen_columns}
                onFooter={onFooter}
                onDeleteFrozen={onDeleteFrozen}
                apiurl={apiurl}
            />
        );
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
    );
}

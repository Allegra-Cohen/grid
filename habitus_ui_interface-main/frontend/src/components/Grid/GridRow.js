import GridCell from "./GridCell"

export default function GridRow({ rowName, rowContents, data, onChange, onDrop, activateCell, activeCell }) {

  let cells = Object.entries(data).map(([colName, v], ix) =>
    <GridCell
      key={ix}
      id={rowName + colName}
      colorValue={v}
      rowName={rowName}
      rowContents={rowContents}
      colName={colName}
      onChange={onChange}
      onDrop={onDrop}
      activateCell={activateCell}
      isActive={activeCell === rowName + colName}
    />
  )

  return (<tr>
    <td className="row-name">
      {rowName}
    </td>
    {cells}
  </tr>)
}
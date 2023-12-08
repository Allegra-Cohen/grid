import { useState, useEffect } from "react"
import { fetchDataFromApi, toQuery } from "services"
import "./styles.css"
import Sentences from "./Sentences"
import { Button, Input, Loading, } from 'components';
import GridRow from "./GridRow"
import Footer from "./Footer"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export default function Grid() {
  const [activeCell, setActiveCell] = useState()
  const [editColName, setEditColName] = useState(false)
  const [corpus, setCorpus] = useState([]);
  const [context, setContext] = useState([]);
  const [gridRows, setGridRows] = useState({})
  const [colNumToName, setColNumToName] = useState({})
  const [frozenColumns, setFrozenColumns] = useState([])
  const [rowContents, setRowContents] = useState({})
  const [clicked, setClicked] = useState([false]);
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    setWaiting(true)
    fetchDataFromApi('/data/')
      .then(data => {
        setCorpus(data.clicked_sentences);
        setGridRows(data.grid);
        setColNumToName(data.col_num_to_name);
        setFrozenColumns(data.frozen_columns);
        setRowContents(data.row_contents);
        setWaiting(false)
      });
  }, [])

  function onLaunchClicked(evt) {
    evt.preventDefault();
    setClicked(!clicked);

  }

  const activateCell = (item) => setActiveCell(item)

  let gridRowsAux = gridRows && Object.entries(gridRows).map(([name, cells], ix) =>
    <GridRow
      key={ix}
      rowName={name}
      rowContents={rowContents}
      data={cells}
      onChange={
        (evt) => {
          setCorpus(evt);
          setContext('')
        }
      }
      onDrop={
        (evt) => {
          setCorpus(evt.clicked_sentences);
          setGridRows(evt.grid);
          setColNumToName(evt.col_num_to_name);
          setContext('')
        }
      }
      activateCell={activateCell}
      activeCell={activeCell}
    />
  )

  // Get the col names from the first row
  // let rowNames = Object.keys(data)
  let rows = Object.values(gridRows)
  let footer = null
  if (rows.length > 0) {
    let row = rows[0]
    let colIDs = Object.keys(row)
    let colNames = colIDs.map((colID) => colNumToName[colID])
    footer = colNames.map((name, ix) =>
      <Footer
        key={ix} id={ix}
        colName={name}
        editColName={editColName}
        setEditColName={setEditColName}
        frozenColumns={frozenColumns}
        onFooter={
          (evt) => {
            setGridRows({ ...evt.grid });
            setColNumToName({ ...evt.col_num_to_name });
            setFrozenColumns([...evt.frozen_columns]);
          }
        }
        onDeleteFrozen={
          (evt) => {
            setCorpus(evt.clicked_sentences);
            setGridRows({ ...evt.grid });
            setColNumToName({ ...evt.col_num_to_name });
            setFrozenColumns([...evt.frozen_columns]);
          }
        }
      />
    )
  }

  return (
    waiting ? <Loading /> : (
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px', borderBottom: corpus && corpus.length > 0 ? '1px solid #DDDDDD' : 'none' }}>
          <table style={
            {
              tableLayout: "fixed",
              color: '#2c2c2c',
              fontSize: 14
            }
          }>
            <tbody>
              {gridRowsAux}
              {footer &&
                <tr>
                  <td />{footer}
                </tr>
              }
            </tbody>

          </table>

          <div style={{ gap: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', maxWidth: '220px' }}>

            <Input placeholder="Create new column" onKeyPress={
              (evt) => {
                if (evt.key === "Enter") {
                  if (evt.target.value.length > 0) {
                    let query = toQuery([["text", evt.target.value]]);
                    fetchDataFromApi(`/textInput/${query}`)
                      .then(response => {
                        setCorpus(response.clicked_sentences);
                        setGridRows(response.grid);
                        setColNumToName(response.col_num_to_name);
                        setFrozenColumns(response.frozen_columns)
                      })
                      .then(evt.target.value = '')
                      .then(evt.target.blur())
                  }
                }
              }
            } />

            <Input placeholder="Max. Columns" onInput={
              (evt) => {
                let query = toQuery([["k", evt.target.value === '' ? 0 : evt.target.value]]);
                fetchDataFromApi(`/setK/${query}`)
                  .then(response => console.log("response", response))
              }
            } />

            <Button label="Update Grid" color="green" icon="ci:arrow-reload-02" onClick={() => {
              setWaiting(true)
              fetchDataFromApi(`/regenerate/`)
                .then(response => {
                  setCorpus(response.clicked_sentences);
                  setGridRows(response.grid);
                  setColNumToName(response.col_num_to_name);
                  setFrozenColumns(response.frozen_columns);
                  setWaiting(false);
                });
            }} />

            <Button label={clicked ? 'Copy' : 'Copied'} color="blue" icon={clicked ? "icon-park-outline:copy" : 'icon-park-solid:copy'}
              onClick={(evt) => {
                fetchDataFromApi(`/copyToggle/`)
                  .then(response => {
                    console.log(response);
                    console.log('copy click!');
                  });
                onLaunchClicked(evt);
              }
              }
              clicked={clicked}
            />
          </div>
        </div>
        <Sentences corpus={corpus} context={context} onChangeContext={(evt) => {
          setContext(evt)
        }} />
      </DndProvider>
    )
  )
}



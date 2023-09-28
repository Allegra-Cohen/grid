import { useState } from "react"
import { Icon } from "@iconify/react"
import { fetchDataFromApi, toQuery } from "services"

export default function Footer({ id, colName, frozenColumns, onFooter, onDeleteFrozen, editColName, setEditColName }) {
  const [showButtons, setShowButtons] = useState(false)
  const [hoverEdit, setHoverEdit] = useState(false)
  const [hoverDelete, setHoverDelete] = useState(false)

  return (
    <td key={id}>
      <div style={{
        color: colName.includes('Unassigned') ? '#616160' : (frozenColumns.includes(id) ? '#2c2c2c' : "#4767AC"),
        textAlign: "center",
        width: "6em",
        marginTop: 5,
        padding: 5,
        minHeight: 80,
        cursor: colName.includes('Unassigned') ? 'default' : 'pointer'
      }}
        onMouseEnter={() => setShowButtons(true)}
        onMouseLeave={() => setShowButtons(false)}
      >
        <div>
          {editColName === id ?
            <input
              placeholder={colName}
              className="footer"
              style={{ '--placeholder-color': 'gray' }}
              onKeyDown={
                (evt) => {
                  if (evt.key == "Enter") {
                    let query = toQuery([["id", id], ["name", evt.target.value]])
                    fetchDataFromApi(`/editName/${query}`)
                      .then(response => {
                        onFooter(response)
                        setEditColName('')
                      })
                    evt.target.value = ''
                    evt.target.blur()
                  }
                }
              }
            /> : colName}
        </div>
        {!colName.includes('Unassigned') && showButtons && (
          <div style={{ marginTop: 10, gap: 5, display: 'flex', justifyContent: 'center', }}>
            <Icon
              icon="akar-icons:edit"
              width="20" height="20"
              color={hoverEdit ? "#2c2c2c" : "#616160"}
              onClick={() => {
                if (editColName === id) setEditColName('')
                else setEditColName(id)
              }}
              onMouseEnter={() => setHoverEdit(true)}
              onMouseLeave={() => setHoverEdit(false)}
            />
            {frozenColumns.includes(id) &&
              <Icon
                icon="octicon:trash-16"
                width="19" height="20"
                color={hoverDelete ? "#DC3545" : "#616160"}
                onClick={(evt) => {
                  let query = toQuery([["id", id]])
                  fetchDataFromApi(`/deleteFrozenColumn/${query}`)
                    .then(response => {
                      onDeleteFrozen(response)
                    })
                }}
                onMouseEnter={() => setHoverDelete(true)}
                onMouseLeave={() => setHoverDelete(false)}
              />
            }
          </div>
        )}
      </div>
    </td>
  )

}

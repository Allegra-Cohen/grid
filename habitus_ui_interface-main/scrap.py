

contenteditable="true" onInput={
            (evt) => {
                console.log(evt.target.lastChild, evt.target.lastChild.toString());
                if (evt.target.lastChild.toString() === "[object HTMLBRElement]") {
                    let text = evt.target.textContent;
                    fetch(`${apiUrl}/editName/${ix}/${text}`)
                    .then( response => response.json())
                    .then( response => onFooter(response))
                    console.log(evt.target.textContent);
                    evt.target.blur();
                }
            }

        




[object HTMLBRElement]


        // footer = colNames.map((f, ix) => <td key={ix} contenteditable="true" onInput={
        //     (evt) => {
        //         console.log(evt.target.lastChild, evt.target.lastChild.toString());
        //         if (evt.target.lastChild.toString() === "[object HTMLBRElement]") {
        //             let text = evt.target.textContent;
        //             fetch(`${apiUrl}/editName/${ix}/${text}`)
        //             .then( response => response.json())
        //             .then( response => onFooter(response))
        //             .then( response => console.log(response));
        //             console.log(evt.target.textContent);
        //             evt.target.blur();
        //         }
        //     }

        // }>{ix}. {f}</td>);







<td key={ix} contenteditable="true" onInput={
            (evt) => {
                if (evt.key === "Enter") {
                    console.log(evt.target.textContent)











   return (<td style={cellStyle} ref={dropRef} 
        onMouseDown={
            (evt) => {
                setBorder('#abb7d4');
            }
        }
        onMouseUp={
            (evt) => {
                setBorder(null);
            }
        }
        onClick={
      (evt) => {
        fetch(`${apiUrl}/click/${rowName}/${colName}`)
            .then( response => response.json())
            .then( response => {console.log(response);
                console.log(colName);
                onChange(response);
            })
               }
           }>
           { isOver && "Drop"}
    </td>);



    <div style={{
        display: "flex",
        flexDirection: "column"
    }}>


      // <RegenerateButton className="RegenerateButton" onClick={(evt) => {
      //     console.log(evt);
      //     setCorpus(evt.clicked_sentences);
      //     setGridRows(evt.grid);
      //     setColNumToName(evt.col_num_to_name)}
      // }
      // apiUrl={apiUrl}/>

# def read_csv():
#     """
#         This is a placeholder function where I am mocking the data
#         You will wire your real data source here

#         nested dict with first keys as rows, second keys as column and value as color val
#     """

#     data: DataFrame = pd.read_csv("manual_harvest_grid.csv")

#     # Take the sentences from the frame, and use it for the table
#     # You will populate this from the correct location
#     sentences = data['sentence'].drop_duplicates().tolist()

#     # Build the heatmap from the categorical columns. I mocked this based on the screenshot
#     row_names = "other proportions processes decisions conditions".split()
#     col_names = "equipment labor bird weather cost time seeding credit land otherr".split() # I guess otherr is not a typo but a way to distinguish it from the homonim row

#     # I will compute each cell's value as the ratio of row/col co-occurence by the number of rows in the table
#     heat_map = {r:{c:0. for c in col_names} for r in row_names}
#     for ix, item in data.iterrows():
#         for row_name in row_names:
#             for col_name in col_names:
#                 if item[row_name] == 1 and item[col_name] == 1:
#                     heat_map[row_name][col_name] += 1

#     for row in heat_map.values():
#         for c in row:
#             row[c] /= len(data)

#     return {
#         "sentences": sentences,
#         "grid": heat_map
#     }
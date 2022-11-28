import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {useId, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import App from './App';
import './info.css';
import Countdown from 'react-countdown';


function TrainingPage({step, apiUrl}) {

    const [flag, setFlag] = useState();

    useEffect(() => {
        fetch(`${apiUrl}/data/${true}/${false}`)
            .then( response => response.json())
            .then( data => {
                setFlag(data['flag']);
                console.log(flag)
            });
    }, [])


    const handleLinkClick = () => {
        fetch(`${apiUrl}/loadNewGrid/${'harvest'}`).then( response => response.json());
        fetch(`${apiUrl}/toggleTraining/`).then( response => response.json());
    }

     return (
      <DndProvider backend={HTML5Backend}>

      <div style={{'marginLeft':'5%','marginTop': '2%', 'fontSize':'20pt'}}>
      Welcome to the training page!
      </div>
    <div style={{'marginLeft':'5%','marginTop': '1%', 'fontSize':'14pt', width:'90%'}}>

      {step === 1 ? <div>
      The Grid is a semi-automated tool for visualizing and curating expert knowledge. There are four aspects of the Grid to learn. Please read the information below, and feel free to play around! <br/>
      <br/>
      <b>Content</b>
      <br/>
      Grids contain text from interviews with experts. Text is split into sentences and organized along two axes:<br/>
      <ul>
      <b>Rows</b> organize sentences by dynamics. There are five types of dynamics: 
      <ul>
      Proportions: X compared to Y<br/> Processes: X begins, Y ends <br/> Decisions: a choice between X or Y <br/> Conditions: no Y without X <br/> Causes: X causes Y<br/>
      </ul>
      <b>Columns</b> organize sentences by topic. You may not know which topics are important at first; the Grid is designed to help you discover them.
      </ul>
      You can access sentences in the Grid by clicking on cells. The color of a cell shows how many sentences are in it. Sentences will appear to the right of the Grid; if there are many sentences in a cell, you can scroll to see all of them. Sentences can be in more than one row and column at once.<br/><br/>
      You can also look at the sentences in the context of the interview by clicking on the sentences themselves. Because these sentences are from an un-processed corpus of raw interview notes, you may find sentence fragments or garbage text.<br/><br/>

      {flag === 'control' ?
      <div><b>Training task: </b>Currently there is only one column in this Grid. It contains all the sentences in the corpus. Please click around this column to get a feel for the rows. For example, the "processes" row contains sentences that talk about when events begin, end, and overlap.</div>
      :
      <div><b>Training task: </b>Please click around the Grid for a moment to get a feel for the rows and columns. For example, click on the cell in the "processes" row and "seed | season" column. Note that the sentences here talk about the beginning, end, and overlap of events, and these events are largely about season.</div>}
      <br/><br/>
      <div style={{'fontSize': '14pt'}}><Link to="/training2">Done! Next: Part 2</Link></div><br/><br/> </div> : <div/> }

      {step ===2 ? <div>
        {flag !== 'control' ? <div> The columns you see here are pre-generated for you. You may disagree with the organization of sentences; for example, sometimes columns contain too many topics.
        Your goal is to organize these columns such that their contents make sense to you.<br/><br/>

        The machine will help you organize columns, but it needs direction. You can work with the machine in two ways. The first way is to freeze columns. When you freeze a column, you tell the machine that it is not allowed
        to put sentences into that column or take sentences out. You should freeze columns for two reasons: You want a column to contain sentences about a keyword and only that keyword; or, you are happy with an existing column and do not want it to be changed. <br/><br/>

         <b>Freezing columns</b><br/>
        <ul>
        <b>Create new column: </b> You can freeze a column by creating it using a keyword. Suppose you want to create a column with all the sentences about onions. Type "onion" into the box labeled "Create new column" and press enter. 
        Now, click around the new onion column. The color of the column name is now black, indicating that you have frozen it. <br/>
        <b>Rename column: </b> You can also rename an existing column to freeze it. Type a new name into any of the "Rename" boxes below the columns and press enter.
        </ul>

        Notice that even though you created a new column, the "onion" sentences are still elsewhere in the Grid, for example, in the "onion | tomato" column. This is annoying! To let the Grid know about your changes, click the "Update Grid" button.<br/><br/>
        </div>
         
         : 

         <div> There is currently only one column in this Grid, containing all the sentences in the corpus. Your goal is to expand the columns until the sentences are organized to your liking. You can do this by creating columns. <br/><br/>
        <b>Creating columns</b><br/>
        <ul>
        <b>Create new column: </b> You can create a column using a single keyword. Suppose you want to create a column with all the sentences about onions. Type "onions" into the box labeled "Create new column" and press enter. 
        Now, click around the new column; you'll see that all the sentences with the word "onion(s)" have been put into it.<br/>
        <b>Rename column: </b> You can also rename an existing column. Type a new name into the "Rename" box below the "onions" column and press enter.
        </ul>
        Notice that even though you created a new column, the "onion" sentences are still in the original column. This is annoying! To let the Grid know about your changes, click the "Update Grid" button. This will remove the "onion" sentences
        from the original column and update the original column's name to reflect what's in it.<br/><br/>
        </div>

        }


        {flag !== 'control' ? <div>This button does two things. First, it removes the "onion" sentences from the pool of sentences that the machine is allowed to organize. Second, it asks the machine to reorganize the remaining sentences. You'll notice that
        new columns appear in response to your changes. <br/><br/> In summary, freezing columns allows you to make a decision about some sentences (e.g., "I want a column about onions!") while leaving the rest of the sentences to the machine. <br/><br/></div>
            : <div/>
        }

        <b>Training task: </b> Freeze two more columns for keywords of your choice (click around the cells for inspiration!) and update the Grid.<br/><br/>
        <div style={{'fontSize': '14pt'}}><Link to="/training3">Done! Next: Part 3</Link></div><br/><br/>

        </div>
        : <div/>}


        {step ===3 ? <div>

        Creating new columns is handy, but you may not always want to make big changes to the Grid. Sometimes you may want to move individual sentences for more precise organization. Good news: You can!<br/><br/>

        {flag !== 'control' ?
        <div><b>Seeding columns: </b><br/>
        You can drag sentences between columns to move them. This is called <b>seeding</b> a column because it tells the machine not to move that sentence. 
        Seeding is most useful when you want to group several sentences into a column, but you want the machine to decide what else to put there. It's an intermediate step between machine-generated and frozen columns (although you can also drag sentences into frozen columns.) <br/><br/>
            
        <b>Copying:</b> If you want to put a sentence in multiple columns, you can click the "Copy" button before you drag. Don't forget to turn it off when you're done!<br/><br/>

        <b>Training task: </b> Click on any column and find three sentences to move. Drag these sentences into one unfrozen column (any column with a blue name). 
        Note that the name of this column may change to reflect the new sentences. Next, click "Update Grid." The sentences you dragged together will still be in the same column (though it may not be the one you're looking at.)

        </div>
        :
        <div>
        <b>Moving sentences: </b><br/>
        You can drag sentences between columns to move them. Try it out with some sentences! Note that the colors of the cells change to reflect how many sentences are in them. Also, dragging a sentence won't change which row(s) it is in, only its column.<br/><br/>

        <b>Copying:</b> If you want to put a sentence in multiple columns, you can click the "Copy" button before you drag. Don't forget to turn it off when you're done!<br/><br/>
        </div>
        }<br/>


        <div style={{'fontSize': '14pt'}}><Link to="/training4">Done!</Link></div><br/><br/>
        </div>
        : <div/>}

        {step ===4 ? <div>
            <div>Thanks for completing this training! If you want to play around with the Grid some more, you can do so below. If you are ready to begin the study, click the link to get started!</div><br/>
        <div style={{'fontSize': '14pt'}}><Link to="/survey" onClick = {() => handleLinkClick()}>Ready!</Link></div><br/><br/>
        </div>
        : <div/>}


        </div>
      <div style={{'marginBottom':'5%'}}><App apiUrl="." edit={true} training={true} timeLimitGrid={0}/></div> 
      </DndProvider>
  );
}

export default TrainingPage;


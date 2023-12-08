import { useNavigate } from 'react-router-dom'
import { BackButton, Button, Header, Grid } from 'components'
import './styles.css'

function TrainingPage({ step }) {

    const navigate = useNavigate()

    return (
        <>
            <Header>
                <BackButton screenName={'Tutorial'} />
            </Header>
            <div style={{ margin: 20 }}>
                <div className='styledTrainingPage' >
                    {step === 1 &&
                        <div>
                            <div className="title">
                                Welcome to the training page!
                            </div>
                            <br />
                            The Grid is a semi-automated tool for visualizing and curating expert knowledge. There are four aspects of the Grid to learn. Read the information below, and feel free to play around!
                            <br />
                            <br />
                            <b>Content</b>
                            <ul>
                                Grids contain text from your corpus. Text is split into sentences and organized along two axes:
                                <br />
                                <br />
                                <b>Rows:</b> organize sentences by the file that they came from.
                                <br />
                                <b>Columns:</b> organize sentences by topic. You may not know which topics are important at first; the Grid is designed to help you discover them.
                            </ul>
                            You can access sentences in the Grid by clicking on cells. The color of a cell shows how many sentences are in it. Sentences will appear to the right of the Grid; if there are many sentences in a cell, you can scroll to see all of them. Sentences can be in more than one row and column at once.
                            <br />
                            <br />
                            You can also look at the sentences in the context of the interview by clicking on the sentences themselves.
                            <br />
                            <br />
                            <div>
                                <b>Training task: </b>
                                Click around the Grid for a moment to get a feel for the rows and columns.
                            </div>
                            <br />
                            <div className='space-between'>
                                <div>
                                    Done! Click on the button to Part 2.
                                </div>
                                <Button color="blue" label="Next" icon="mi:next" onClick={() => {
                                    window.scrollTo(0, 0)
                                    navigate("/tutorial/training2")
                                }} />
                            </div>
                        </div>
                    }

                    {step === 2 &&
                        <div>
                            <div>The columns you see here are pre-generated for you.</div>
                            <div>You may disagree with the organization of sentences, for example, sometimes columns contain too many topics. Your goal is to organize these columns such that their contents make sense to you.
                                <br />
                                <div>
                                    The machine will help you organize columns, but it needs direction. You can work with the machine in two ways. The first way is to freeze columns. When you freeze a column, you tell the machine that it is not allowed to put sentences into that column or take sentences out.
                                    <br />
                                    You should freeze columns for two reasons: You want a column to contain sentences about a keyword and only that keyword; or, you are happy with an existing column and do not want it to be changed.
                                </div>
                                <br />
                                <b>Freezing columns</b>
                                <br />
                                <ul>
                                    <b>Create new column: </b>
                                        You can freeze a column by creating it using a keyword. Suppose you want to create a column with all the sentences about the Turing test. Type "Turing test" into the box labeled "Create new column" and press enter. Now, click around the new column. The color of the column name is now black, indicating that you have frozen it.
                                        <br />
                                    <b>Rename column: </b>
                                        You can also rename an existing column to freeze it. Type a new name into any of the "Rename" boxes below the columns and press enter.
                                    Notice that even though you created a new column, the "Turing test" sentences are still elsewhere in the Grid. This is annoying! To let the Grid know about your
                                    changes, click the "Update Grid" button.
                                    <br />
                                    This button does two things. First, it removes the "Turing test" sentences from the pool of sentences that the machine is allowed to organize. Second, it asks the machine to reorganize the remaining sentences. You'll notice that new columns appear in response to your changes.
                                    <br />
                                    In summary, freezing columns allows you to make a decision about some sentences (e.g., "I want a column about the Turing test!") while leaving the rest of the sentences to the machine.
                                    <br />
                                    <b>Delete frozen column: </b>
                                        You can click on the wastebasket button beneath a frozen column to delete it. You must update the Grid in order to return the sentences from that column to the Grid.
                                    <br />
                                </ul>
                            </div>
                            <b>Training task: </b>
                            Freeze two more columns for keywords of your choice (click around the cells for inspiration!) and update the Grid.
                            <br />
                            <br />
                            <div className='space-between'>
                                <div>
                                    Done! Click on the button to Part 3.
                                </div>
                                <Button color="blue" label="Next" icon="mi:next" onClick={() => {
                                    window.scrollTo(0, 0)
                                    navigate("/tutorial/training3")
                                }} />
                            </div>
                        </div>
                    }

                    {step === 3 &&
                        <div>
                            Creating new columns is handy, but you may not always want to make big changes to the Grid. Sometimes you may want to move individual sentences for more precise organization. Good news: You can!<br /><br />
                            <div>
                                <b>Dragging sentences: </b>
                                <br />
                                You can drag sentences between columns to move them. When you drag a sentence from one unfrozen column to another, it is called <b>seeding</b> because the machine will not move that sentence when it reorganizes. Seeding is most useful when you want to group several sentences into a column, but you want the machine to decide what else to put there. It's an intermediate step between machine-generated and frozen columns.
                                <br />
                                <br />
                                <b>Training task: </b>
                                Click on any unfrozen column (blue text) and find two or more sentences to move. Drag these sentences into another unfrozen column. Note that the name of this column may change to reflect the new sentences. Next, click "Update Grid." The sentences you dragged together will stay together when the machine reorganizes. 
                                <br />
                                Seeding only works with sentences that are not already part of a frozen column. Suppose you drag a sentence out of a frozen column A and into an unfrozen target column B; it will not remain there during reorganizing unless you freeze column B. Sentences dragged between frozen columns will stay in their target column. 
                                <br />
                                <br />
                                <b>Copying: </b>
                                If you want to put a sentence in multiple columns, you can click the "Copy" button before you drag. Don't forget to turn it off when you're done!
                                <br />
                                <br />
                            </div>
                            <div className='space-between'>
                                <div>
                                    Done! Click on the button to finish the training.
                                </div>
                                <Button color="blue" label="Done!" icon="material-symbols:done" onClick={() => {
                                    window.scrollTo(0, 0)
                                    navigate("/tutorial/training4")
                                }} />
                            </div>
                        </div>
                    }

                    {step === 4 && 
                        <div>
                            <div>Thanks for completing this training! If you want to play
                                around with the Grid some more, you can do so below.
                            </div>
                            <br />
                            <div className='space-between'>
                                <div>
                                    If you are ready to make your own Grid, click on the button to get started.
                                </div>
                                <Button color="blue" label="Get Starded" icon="codicon:debug-start" onClick={() => {
                                    window.scrollTo(0, 0)
                                    navigate("/gallery")
                                }} />
                            </div>
                        </div>
                    }
                </div>
                <div style={{ marginTop: 10 }} className='styledTrainingPage'>
                    <Grid />
                </div>
            </div >
        </>
    )
}

export default TrainingPage


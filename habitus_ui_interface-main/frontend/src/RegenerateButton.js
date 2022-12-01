import {useEffect, useState} from "react";


export default function RegenerateButton({onClick, apiUrl, userID}){

    const [disabled, setDisabled] = useState([]);
    useEffect(() => { setDisabled(false)}, [false] )


    function onLaunchClicked(evt){
        evt.preventDefault();
        setDisabled(true);
        setTimeout(() => setDisabled(false), 4500);

    }


    return(
    <div className={"RegenerateButton"}>
    <button style={{height:'2.5em', width:'8em', background:'#90c5e1', fontSize:'20px', fontFamily: "InaiMathi"}}
    onClick={ (evt) => {fetch(`${apiUrl}/regenerate/${userID}`)
                        .then( response => response.json())
                        .then( response => {onClick(response);
                                            });
                        onLaunchClicked(evt);
               }
           }
               disabled={disabled}
           >Update Grid</button>
    </div>
    );
}
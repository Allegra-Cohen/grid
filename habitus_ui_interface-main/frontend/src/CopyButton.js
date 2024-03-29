import {useEffect, useState} from "react";


export default function CopyButton({onClick, apiurl}){

    const [clicked, setClicked] = useState([false]);


    function onLaunchClicked(evt){
        evt.preventDefault();
        setClicked(!clicked);

    }


    return(
    <div className={"CopyButton"}>
    <button style={{height:'2.5em', width:'8em', background: clicked ? '#FFFFFF' : '#48e3d0', fontSize:'20px', fontFamily: "InaiMathi"}}
    onClick={ (evt) => {fetch(`${apiurl}/copyToggle/`)
                        .then( response => response.json())
                        .then( response => {console.log(response);
                                            console.log('copy click!');
                                            onClick(response);
                                            });
                        onLaunchClicked(evt);
               }
           }
               clicked={clicked}
           >Copy</button>
    </div>
    );
}
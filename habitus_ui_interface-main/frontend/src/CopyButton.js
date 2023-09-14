import { useEffect, useState } from "react";
import { Button } from "./components";


export default function CopyButton({ onClick, apiurl }) {

    const [clicked, setClicked] = useState([false]);


    function onLaunchClicked(evt) {
        evt.preventDefault();
        setClicked(!clicked);

    }


    return (

        <Button label={clicked ? 'Copy' : 'Copied'} color="blue" icon= {clicked ? "icon-park-outline:copy" : 'icon-park-solid:copy'}

            onClick={(evt) => {
                fetch(`${apiurl}/copyToggle/`)
                .then(response => response.json())
                .then(response => {
                    console.log(response);
                    console.log('copy click!');
                    onClick(response);
                });
                onLaunchClicked(evt);
            }
            }
            clicked={clicked}
        />

    );
}
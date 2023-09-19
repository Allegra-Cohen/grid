import { useEffect, useState } from "react";
import { Button } from "./components";
import { fetchDataFromApi } from "./services";


export default function CopyButton({ onClick }) {

    const [clicked, setClicked] = useState([false]);


    function onLaunchClicked(evt) {
        evt.preventDefault();
        setClicked(!clicked);

    }


    return (

        <Button label={clicked ? 'Copy' : 'Copied'} color="blue" icon={clicked ? "icon-park-outline:copy" : 'icon-park-solid:copy'}

            onClick={(evt) => {
                fetchDataFromApi(`/copyToggle/`)
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
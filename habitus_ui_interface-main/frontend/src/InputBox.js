import { useEffect, useState } from "react";
import { toQuery } from "./toEncoding";
import { Input } from "./components";
import { fetchDataFromApi } from "./services";


export default function InputBox({ onKeyPress }) {

	return (
		<Input
			onKeyPress={
				(evt) => {
					if (evt.key === "Enter") {
						if (evt.target.value.length > 0) {
							let query = toQuery([["text", evt.target.value]]);
							fetchDataFromApi(`/textInput/${query}`)					
								.then(response => {
									console.log(response);
									console.log(response);
									onKeyPress(response);
								})
								.then(evt.target.value = '')
								.then(evt.target.blur())
						}
					}
				}
			}
			placeholder="Create new column"
		/>

	);
}
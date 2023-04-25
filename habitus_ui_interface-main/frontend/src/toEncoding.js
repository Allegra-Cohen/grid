export function toHex(string) {
    const array = [];
    for (let i = 0; i < string.length; i++)
        array[i] = ("000" + string.charCodeAt(i).toString(16)).slice(-4);
    return array.join("");
}

export function toQuery(nameAndValuePairs) {
    const urlSearchParams = new URLSearchParams();
    nameAndValuePairs.forEach(nameAndValue => urlSearchParams.append(nameAndValue[0], nameAndValue[1]));
    const query = urlSearchParams.toString()
    return query.length === 0 ? "" : ("?" + query);
}

export function toRequest(apiurl, command, nameAndValuePairs) {
    const query = toQuery(nameAndValuePairs)
    const request = `${apiurl}/${command}/${query}`;
    console.log("request:", request);
    return request;
}

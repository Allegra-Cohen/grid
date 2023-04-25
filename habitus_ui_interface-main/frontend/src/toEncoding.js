export function toHex(string) {
    var array = [];
    for (var i = 0; i < string.length; i++)
        array[i] = ("000" + string.charCodeAt(i).toString(16)).slice(-4);
    return array.join("");
}

export function toQuery(nameAndValuePairs) {
    let urlSearchParams = new URLSearchParams();
    nameAndValuePairs.forEach(nameAndValue => urlSearchParams.append(nameAndValue[0], nameAndValue[1]));
    let query = urlSearchParams.toString()
    return query;
}

export function toRequest(apiurl, command, nameAndValuePairs) {
    let query = toQuery(nameAndValuePairs)
    const request = `${apiurl}/${command}/?${query}`;
    console.log("request:", request);
    return request;
}

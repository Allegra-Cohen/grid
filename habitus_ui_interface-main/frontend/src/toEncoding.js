export function toHex(string) {
    var array = [];
    for (var i = 0; i < string.length; i++)
        array[i] = ("000" + string.charCodeAt(i).toString(16)).slice(-4);
    return array.join("");
}

// This should be an array of arrays of two.
// The two are name and values.
export function toQuery(namesAndValues) {
    let urlSearchParams = new URLSearchParams();
    namesAndValues.forEach(nameAndValue  => urlSearchParams.append(nameAndValue[0], nameAndValue[1]));
    let query = "?" + urlSearchParams.toString();
    console.log("query:", query);
    return query;
}

export function toHex(string) {
        var array = [];
        for (var i = 0; i < string.length; i++)
            array[i] = ("000" + string.charCodeAt(i).toString(16)).slice(-4);
        return array.join("");
}
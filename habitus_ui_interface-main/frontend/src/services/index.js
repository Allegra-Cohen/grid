const apiUrl = 'http://127.0.0.1:8000';

export const fetchDataFromApi = async (path) => {
  const url = `${apiUrl}${path}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.log('error fetching ->', error);
  }
};

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
  namesAndValues.forEach(nameAndValue => urlSearchParams.append(nameAndValue[0], nameAndValue[1]));
  let query = "?" + urlSearchParams.toString();
  console.info("Query is " + query);
  return query;
}

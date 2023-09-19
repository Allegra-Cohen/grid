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
    throw new Error(`${error.message}`);
  }
};
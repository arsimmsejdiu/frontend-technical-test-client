export const REF_WIDTH = 800;
export const REF_HEIGHT = 450;
export const REF_FONT_SIZE = 36;

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("Not Found");
  }
}

function checkStatus(response: Response) {
  if (response.status === 401) {
    throw new UnauthorizedError();
  }
  if (response.status === 404) {
    throw new NotFoundError();
  }
  return response;
}

export const LOGIN = (username: string, password: string) =>
  fetch(`${BASE_URL}/authentication/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => checkStatus(res).json())
    .then((response) => {
      // Store the token in local storage
      localStorage.setItem("auth-token", response.jwt);
      return response;
    });

export const GET_USER_BY_ID = (token: string, id: string) =>
  fetch(`${BASE_URL}/users/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => checkStatus(res).json());

  // Also we have more ways to globalize the fetching of data example making axios global with all the headers and base url then create a function that will be used to fetch data from the api and call this global
  // axios function who is typed with typescript to make sure that the data is fetched correctly and the data is returned correctly and then you call the global URLS created in conctsnts file and pass it to axios global function 
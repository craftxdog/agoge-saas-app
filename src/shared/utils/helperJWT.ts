export const getTokenExpiration = (token: string) => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.exp * 1000;
};

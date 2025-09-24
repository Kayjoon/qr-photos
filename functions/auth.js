const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const token = event.headers.authorization?.split(" ")[1];

  if (!token) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  // Auth0 토큰 검증
  const response = await fetch(`dev-dks7mpcyjjsxcrje.us.auth0.com`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { statusCode: 401, body: "Invalid token" };
  }

  const user = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ user }),
  };
};

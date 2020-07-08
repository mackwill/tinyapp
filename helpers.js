const generateRandomString = (length) => {
  return Math.random().toString(36).substr(2, length);
};

const findUserByEmail = (providedEmail, database) => {
  for (let user in database) {
    if (database[user].email === providedEmail) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let filteredURLs = {};

  Object.keys(database).forEach((url) => {
    if (database[url].userID === id) {
      filteredURLs[url] = database[url].longURL;
    }
  });

  return filteredURLs;
};

module.exports = { generateRandomString, findUserByEmail, urlsForUser };

const generateRandomString = (length) => {
  return Math.random().toString(36).substr(2, length);
};

const createCurrentDate = () => {
  let currentDate = new Date();
  return `${currentDate.getMonth()}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
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
      filteredURLs[url] = {
        longURL: database[url].longURL,
        created: database[url].dateCreated,
        numVisits: database[url].visits,
      };
    }
  });

  return filteredURLs;
};

const checkForExistingShortURL = (shortURL, database, users, id) => {
  let templateVars = {};

  if (database[shortURL] === undefined) {
    templateVars = { user: undefined, error: `Please enter a valid shortURL` };
  } else {
    templateVars = {
      shortURL: shortURL,
      longURL: database[shortURL].longURL,
      user: users[id],
      created: database[shortURL].dateCreated,
      error: null,
      numVisits: database[shortURL].visits,
    };
  }

  return templateVars;
};
module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  createCurrentDate,
  checkForExistingShortURL,
};

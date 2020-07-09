const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");

const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  createCurrentDate,
  checkForExistingShortURL,
  authenticateUser,
  registerUser,
  isValidShortUrl,
} = require("./helpers");

const app = express();
app.use(cookieParser());
const PORT = 8080;

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["userId"],
  })
);

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "jonSnow",
    dateCreated: "05/11/2017",
    visits: 0,
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "NicolasCageSupreme",
    dateCreated: "05/05/2020",
    visits: 0,
  },
};

const users = {
  "jonSnow": {
    id: "jonSnow",
    email: "snowyguy@gmail.com",
    password: bcrypt.hashSync("the-north", 10),
  },

  "NicolasCageSupreme": {
    id: "NicolasCageSupreme",
    email: "thenicolascage@thecage.com",
    password: bcrypt.hashSync("theKing", 10),
  },
};

// GET Requests

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.userId],
    created: createCurrentDate(),
  };

  if (templateVars.user === undefined) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userId];

  const isShortURLValid = isValidShortUrl(
    user,
    urlDatabase,
    req.params.shortURL
  );

  if (isShortURLValid !== true) {
    res.render("urls_index", { user, error: isShortURLValid });
    return;
  }

  let templateVars = checkForExistingShortURL(
    req.params.shortURL,
    urlDatabase,
    users,
    req.session.userId
  );

  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.userId];
  let templateVars = {};

  if (user === undefined) {
    templateVars = { urls: {}, user, error: null };
    res.render("urls_index", templateVars);
    return;
  }

  const filteredURLs = urlsForUser(user.id, urlDatabase);

  templateVars = { urls: filteredURLs, user, error: null };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.userId !== undefined) {
    res.redirect("/urls");
    return;
  }

  let templateVars = {
    user: users[req.session.userId],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.userId !== undefined) {
    res.redirect("/urls");
    return;
  }
  let templateVars = {
    user: users[req.session.userId],
  };
  res.render("login", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    let templateVars = {
      user: undefined,
      error: "Please enter a valid shortURL.",
    };
    res.render("urls_index", templateVars);
    return;
  }
  urlDatabase[req.params.shortURL].visits += 1;
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

// POST Requests

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString(6);
  urlDatabase[newShortURL] = {
    userID: req.session.userId,
    longURL: req.body.longURL,
    dateCreated: createCurrentDate(),
    visits: 0,
  };

  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let user = users[req.session.userId];
  if (user === undefined) {
    res.redirect("/urls");
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);
  let registered = registerUser(email, req.body.password, users);

  if (registered !== true) {
    res.statusCode = 400;
    res.render("register", {
      user: false,
      msg: registered,
    });
    return;
  }

  const newId = generateRandomString(6);
  users[newId] = {
    id: newId,
    email,
    password,
  };

  req.session.userId = newId;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  authenticateUser(req.body.email, users, req.body.password);

  let authenticated = authenticateUser(
    req.body.email,
    users,
    req.body.password
  );
  if (authenticated !== true) {
    res.statusCode = 403;
    res.render("login", {
      user: false,
      msg: authenticated,
    });
    return;
  }
  req.session.userId = findUserByEmail(req.body.email, users);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

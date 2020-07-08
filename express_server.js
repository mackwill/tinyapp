const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const app = express();
app.use(cookieParser());
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = (length) => {
  return Math.random().toString(36).substr(2, length);
};

const findUserByEmail = (users, email) => {
  let foundUser = false;
  Object.keys(users).forEach((elem) => {
    if (users[elem].email === email) {
      foundUser = elem;
    }
  });
  return foundUser;
};

const urlsForUser = (id) => {
  let filteredURLs = {};

  Object.keys(urlDatabase).forEach((url) => {
    if (urlDatabase[url].userID === id) {
      filteredURLs[url] = urlDatabase[url].longURL;
    }
  });

  return filteredURLs;
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "jonSnow" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "NicolasCageSupreme" },
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

app.get("/", (req, res) => {
  res.redirect("/urls");
});

//  Url page
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = {};

  if (user === undefined) {
    templateVars = { urls: {}, user };
    res.render("urls_index", templateVars);
    return;
  }

  const filteredURLs = urlsForUser(user.id);

  templateVars = { urls: filteredURLs, user };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };

  if (templateVars.user === undefined) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (user === undefined) {
    res.redirect("/urls");
    return;
  }

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.cookies["user_id"],
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString(6);
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let user = users[req.cookies["user_id"]];
  if (user === undefined) {
    res.redirect("/urls");
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);

  if (email === "" || password === "") {
    res.statusCode = 400;
    res.send(`Please enter a valid username / password`);
    return;
  } else if (findUserByEmail(users, email)) {
    res.statusCode = 400;
    res.send(`You already have an account`);
    return;
  }
  const newId = generateRandomString(6);
  users[newId] = {
    newId,
    email,
    password,
  };

  res.cookie("user_id", newId);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const selectedUser = findUserByEmail(users, req.body.email);

  if (selectedUser === false) {
    res.statusCode = 403;
    res.send(
      `Status code: ${res.statusCode}. Nicolas Cage didn't find your email.`
    );
    return;
  } else if (
    !bcrypt.compareSync(req.body.password, users[selectedUser].password)
  ) {
    res.statusCode = 403;
    res.send(
      `Status code: ${res.statusCode}. Nicolas Cage didn't match your email and password.`
    );
    return;
  }

  res.cookie("user_id", findUserByEmail(users, req.body.email));

  let templateVars = {
    user: users[req.cookies["user_id"]],
  };

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies["user_id"]);

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

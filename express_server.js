const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "jonSnow": {
    id: "jonSnow",
    email: "snowyguy@gmail.com",
    password: "the-north",
  },

  "NicolasCageSupreme": {
    id: "NicolasCageSupreme",
    email: "thenicolascage@thecage.com",
    password: "theKing",
  },
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//  Url page
app.get("/urls", (req, res) => {
  let templateUrl = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateUrl);
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
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: req.cookies["user_id"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString(6);
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let { email, password } = req.body;

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
    email: req.body.email,
    password: req.body.password,
  };

  res.cookie("user_id", newId);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  console.log(
    "findUserByEmail(users, req.body.email)",
    findUserByEmail(users, req.body.email)
  );

  const selectedUser = findUserByEmail(users, req.body.email);

  if (selectedUser === false) {
    res.statusCode = 403;
    res.send(
      `Status code: ${res.statusCode}. Nicolas Cage didn't find your email.`
    );
    return;
  } else if (users[selectedUser].password !== req.body.password) {
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

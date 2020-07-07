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
  console.log("get register cookies:", users[req.cookies["user_id"]]);
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  console.log("templateVars: ", templateVars);
  res.render("register", templateVars);
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
  console.log("req.body: ", req.body);
  let newShortURL = generateRandomString(6);
  urlDatabase[newShortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("req.body: ", req.body);
  console.log("Deleting");
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
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
  Object.keys(users).forEach((elem) => {
    if (users[elem].email === req.body.email) {
      res.cookie("user_id", elem);
      return;
    }
  });

  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  console.log("templatevars: ", templateVars);
  // res.render("partials/_header", templateVars);

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  console.log("logout cookie: ", req.cookie);

  res.clearCookie("user_id", req.cookies["user_id"]);

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

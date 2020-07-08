const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
} = require("./helpers");

const app = express();
app.use(cookieParser());
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],
  })
);

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

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = {};
  if (user === undefined) {
    res.redirect("/urls");
    return;
  }

  if (urlDatabase[req.params.shortURL] === undefined) {
    templateVars = { user: undefined, error: `Please enter a valid shortURL` };
  } else {
    templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: req.session.user_id,
      error: null,
    };
  }

  res.render("urls_show", templateVars);
});

//  Url page
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = {};

  if (user === undefined) {
    templateVars = { urls: {}, user };
    res.render("urls_index", templateVars);
    return;
  }

  const filteredURLs = urlsForUser(user.id, urlDatabase);

  templateVars = { urls: filteredURLs, user };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };

  if (templateVars.user === undefined) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_new", templateVars);
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
  let user = users[req.session.user_id];
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

  if (email === "" || req.body.password === "") {
    // res.statusCode = 400;
    res.render("register", {
      user: false,
      msg: `Please fill in all fields.`,
    });

    return;
  } else if (findUserByEmail(email, users)) {
    // res.statusCode = 400;

    res.render("register", {
      user: false,
      msg: `This user already has an account.`,
    });

    return;
  }

  const newId = generateRandomString(6);
  users[newId] = {
    newId,
    email,
    password,
  };

  req.session.user_id = newId;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const selectedUser = findUserByEmail(req.body.email, users);

  if (selectedUser === undefined) {
    res.statusCode = 403;
    res.render("login", {
      user: false,
      msg: `You do not seem to have an account with us.`,
    });
    return;
  } else if (
    !bcrypt.compareSync(req.body.password, users[selectedUser].password)
  ) {
    res.statusCode = 403;
    res.render("login", {
      user: false,
      msg: `The provided details do not match our records.`,
    });
    return;
  }

  req.session.user_id = findUserByEmail(req.body.email, users);

  let templateVars = {
    user: users[req.session.user_id],
  };

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

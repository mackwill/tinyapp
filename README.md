# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Register User"](https://github.com/mackwill/tinyapp/blob/master/assets/createAccount.png)
!["My URLs Home Page"](https://github.com/mackwill/tinyapp/blob/master/assets/myURLs.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Current Functionality

- Register a new user
- Log in as existing user
  - Hashed user passwords
- Create new short URL from a regular URL
- Store and display short URLs unique to user (currently clears with session)
- Edit an existing short URL
-
- Tracks number of visits to a short URL in a session

## Further Development

- Convert to Material-UI from Bootstrap
- Add a number of "unique" visitors when showing URLs
- Track and output the visit history of each short URL and display on the edit page
- Update registration to take in a username and a "confirm password" requirement
- Store users in database instead of a variable

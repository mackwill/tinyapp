const { assert } = require("chai");
const { findUserByEmail } = require("../helpers");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("findUserByEmail", () => {
  it("should return a user with a valid email", () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it("should return undefined when provided an email that does not belong to a user", () => {
    const user = findUserByEmail("test@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.isUndefined(user, expectedOutput);
  });
});

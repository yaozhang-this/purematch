# Purematch Coding Challenge

This repository hosts the NodeJS app source code of Purematch coding challenge.

## Installation, Build and Test

To install all the required dependencies, use npm to install node_modules.

```bash
npm install
```

To run in development, type `npm run devStart` which uses nodemon to automatically restart node application each time a file is changed.

## Usage

Examples on using this NodeJS app is documented in the file `requests.rest`, which helps test HTTP request locally.
But below is a simple request to register a user with server running on location host listening on port 3000.

```
POST http://localhost:3000/users/
Content-Type: application/json

{
    "name": "test_user",
    "email":"test@email.com",
    "password":"password123"
}
```

## Approach to Requirement 3

Continuing the design mindset of Req 1 and 2, I added more helper functions to refractor frequetnly used code segments. I added more endpoints in a consistent manner to previous requirements. Moreover, in this final version, I reviewed the codebase and made changes and improvements to previous versions like real world software development cycle.

### Comments

I added the comments table and joined the tables with user during query as explicitly instructed.

### Pagination

Pagination is a useful tool for users of this API. However, as backend developer I also need to ensure that no malicious users can temper with our access. For example, besides paginating the posts and comments result according to user reqeust paramerters, I sanitized the request first and set the limit of the range of datas that a user can query. As such, with large databases, users would not be accidently or maliciously querying millions of rows at once. The constraints are set so that only 10 posts /comments are sent to users each time with paging used to iterate through the data.

### Username addon

As username is said to be optional, I assumed that it is nullable. And by intuition I assumed it to be unique. I created migration files so that the new column is added to database and the user model is adjusted to fit the new column.

In a AGILE manner, all of these changes do not break previous versions but progressively add functionality to the app.

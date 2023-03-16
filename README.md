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

## Approach to Requirement 2

Continuing the design mindset of Req 1, I followed good programming principles and refractored helper functions into a utilities directory. I wrote comments for each functions to help other programmers understand my code.

In this requirement, some works are saved due to the design of Seqeulize + Postgres, each table created by Sequelize already has the `createdAt` attribute stored in ISO format that is easy to retrieve and compare with local time. I made a helper function that uses simple math to calcualte the most relevant time diff in a human readable format.

The Photo constraits is easily achieved by setting up a constant. This allows me to easily adjust for future photo limits without ever touching the database.

The edit functionality is achieved by using the `put` request with Sequelize's `update()` or `save()` API. However, I set the contraits so that only users logged in can edit their own posts. This makes sense on the client side. But if there requires a server side need to directly manipute data for a different user, I can also implement it easily. Another detail regarding the edit functionality is that with each edit, we are not only changing the url stored in postrges database but also S3. As with user delete that cascades to all user images, these functionality requires managing the S3 buckets as well. I implemneted these changes so now S3 bucket is synced with database CRUD changes. Although I don't have much time to carefull test concurrent connections or the efficiency of bulk delete, these features could be ammended in the future.

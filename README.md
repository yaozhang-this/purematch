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

## Approach to Requirement 1

As mentioned in the instruction page of this challenge, the source code needs to follow naming conventions, be easily readable, have good file structure with decent error handling. I paid attention to these areas from the start. Throughout the development, I also paid attention to software development best practices in places that might affect program efficiency, compute times as well as storage spaces.

### Tackling the General Criteria

Besides creating each route with their respective endpoitns and functionalities, I refractored and created saparate directories for AWS related functions and middleware used to authenticate the user using JWT. This makes the codebase more organized and decreases the complexity of each functions. I also followed the naming conventions of HTTP endpoints, using only nouns, lowercase alphabet and hosted the endpoints in a hierarchical manner. For Javascript, I used the naming conventions of camel case. For Postgresql, I used the naming convention of lower case with understores. I used try catch to increase error handling and followed the HTTP return code standards when errors occur.

### Tackling the Core Requirements

In this first requirement, before I deployed it to Elastic Beanstalk, I tested the functions locally with a postgresql database connecting through Sequelize. Tackling the first requirment was not a major challenge, since using express-generator saved me a lot of time in building the infrastruture tools for the frameworks. In designing the database schema, I paid attention to common constraints related to user table, such as unique email, and non empty fields. I created migration files using Sequelize-cli which protects the database from mishandling.

The first major feature in this reqruiement is the use of authentication and authorization of users. First, I utilized the bcrypt library to hash the passwords with salt and stored only the hash in the databases, protecting sensitive user data from data leaks. I then used JWT library to sign the user information as a token that can authorize/authenticate a user's login. I signed them using a secure random secret key stored in the environment hidden away from version control system. This can be easily achieved using node's crypto library like so `require('crypto').randomBytes(64).toString('hex')`. I used the middleware with next() to pass the authenticated user info into request pipeline.

One improvement that I did not implement in this challenge is refresh tokens. Ideally we should set login tokens to expire in a short amount of time so that anyone who managed to get access to this token does not get to use it for very long. The client should use the refresh token to request new login tokens. But since time is short for this challenge, I cut for simplicity's sake but this should be present in a production environment.

### The Photo Dilemma.

Requirement 1.4 states the need for a post functionality. This was easy to do with Sequelize. I simply set the new table with foreign key constraints and set up the cascade with foreign key deletions. So the post also stores the user who created it. I did not join both tables on query, both for simplicity's sake and the fact that it differs with use case of the data. But it is easy to achieve with seqeulize using the `include` key in its query parameters. Once that is done. The question comes to how to store the post photos. For very small databases, storing image data directly in database might be sufficient, but this does not scale well and can easily compromise perfomances on large data querying. The best way to do this is to store them on the AWS S3 bucket and only store the urls to those bucket. Since S3 is cheap and database querying time is expensive to users, this solves the problem and scales well with large databases.

But how to store the urls? From a design perspective, there are two ways to store this, one is to create a saparate photo table like the post table, the another is to store them with the post entries. Since these are just urls that takes very small storage space and that a post with >1000 photos doesn't make sense realistically, the ease of querying with the post entry, which is the majority use case, persuaded me to go with the second approach. Plus, Postgre has a convenient ARRAY datatype that makes this approach very easy to implement.

Although the requriement does not mention deleting posts or users, I still implemented them to demonstrate my ability to complete this task.

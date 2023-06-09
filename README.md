# Purematch Coding Challenge

This repository hosts the NodeJS app source code of Purematch coding challenge. For previous requirement infomration, please check out respective branches.

## Installation, Build and Test

To install all the required dependencies, use npm to install node_modules.

```bash
npm install
```

To run in development, type `npm run devStart` which uses nodemon to automatically restart node application each time a file is changed.

## Usage

Examples on using this NodeJS app is documented in the file `requests.rest`, which helps test HTTP request locally.
But below is a simple request to register a user with server running on local host listening on port 3000.

```
POST http://localhost:3000/users/
Content-Type: application/json

{
    "name": "John Appleseed",
    "email": "john@apple.com",
    "password":"password123"
}
```

## Approach to Requirement 3

Continuing the design mindset of Req 1 and 2, I added more helper functions to refactor frequently used code segments. I added more endpoints in a consistent manner to previous requirements. Moreover, in this final version, I reviewed the codebase and made changes and improvements to previous versions in accordance to real world software development cycle.

### Comments

I added the comments table and joined the tables with user during query as explicitly instructed.

### Pagination

Pagination is a useful tool for users of this API. However, as backend developer I also need to ensure that no malicious users can temper with our access. For example, besides paginating the posts and comments result according to user reqeust parameters, I sanitized the request first and set the limit of the range of data that a user can query. As such, with large databases, users would not be accidently or maliciously querying millions of rows at once. The constraints are set so that only 10 posts /comments are sent to users each time with paging used to iterate through the data.

### Username addon

As username is said to be optional, I assumed that it is nullable. And by intuition I assumed it to be unique. I created migration files so that the new column is added to database and the user model is adjusted to fit the new column.

In a AGILE manner, all of these changes do not break previous versions but progressively add functionalities to the app.

### AWS Deployment

For this challenge, I configured a fresh AWS free tier account with a IAM user set to dev role. I used AWS Elastic Beanstalk to host the NodeJS & express app. The EB environment has a EC2 instance and connects to AWS RDS database with Postgres driver via Sequelize. The EB environment uses a AWS bucket to store source code bundle. The NodeJs app itself also uses a AWS S3 bucket to store user images. I installed eb cli so it is very easy to deploy from local machine. But there could be many improvements in a real production environment, such as using the AWS CodePipeline for CI/CD in dev cycle. We can also use that to automatically migrate database upon each deploy.

Currently, all sensitive data, including JWT secret key and database connection info, are stored inside EB Environment as environment variables and are not exposed to public, but in a production environment, it is best to use AWS SecretManager for retrieving secrets on each use for maximum security.

# EdluminUI

[![Build Status](https://dev.azure.com/hcmventure/hcmventure/_apis/build/status/RedRoverK12.EdluminUI?branchName=master)](https://dev.azure.com/hcmventure/hcmventure/_build/latest?definitionId=3&branchName=master)

## Stack

This project is a single-page webapp using the following technologies:

- [TypeScript](https://www.typescriptlang.org)  – a type-safe variant of JavaScript from Microsoft which reduces errors and improves IDE/editor support over regular JavaScript.
- Node.js – powers our server, and is pinned to the latest LTS release.
- [GraphQL](http://graphql.org) – an alternative to REST apis which supports a demand-driven architecture. Our GraphQL server is [Apollo GraphQL server](http://dev.apollodata.com/tools/graphql-server/).
- [Jest](http://facebook.github.io/jest/#use) for unit testing.
- [Webpack](https://webpack.github.io) – builds our application for our various deployment targets.
- [React Storybook](https://storybook.js.org/) for component documentation and style guides.

## Setup

- Install Node 10 LTS and yarn. Older or newer versions may or may not work. (Recommend `nodenv` and `brew install yarn --without-node` on mac.)

## Configuration

The compiled frontend is influenced by config variables which can optionally be set as environment variables. The current list is:

- `NODE_ENV`: If "production", the app will be built minified and compressed.
- `DEV_PROXY_HOST`: The URL that webpack-dev-server will proxy graphql requests to.
- `AUTH0_DOMAIN`: The auth0 domain.
- `AUTH0_CLIENT_ID`: Client ID to use for Auth0.
- `AUTH0_REDIRECT_URL`: Full URL of where Auth0 will send the user back to after authenticating.
- `AUTH0_API_AUDIENCE`: This specifies the Auth0 audience. It should match the API's configuration.
- `AUTH0_SCOPE`: Additional information that will be included in the token sent to our API.
- `AUTH0_CLOCK_SKEW_LEEWAY_SECONDS`: The total amount of clock skew (in seconds) we will accept before failing the authentication attempt. This is primarily to address issues around the User's local clock being behind. Example error: `Error: Issued At (iat) claim error in the ID token; current time (Wed Feb 12 2020 09:01:12 GMT-0500 (Eastern Standard Time)) is before issued at time (Wed Feb 12 2020 09:18:22 GMT-0500 (Eastern Standard Time))`.

The `config/default.js` is used to default these variables and `config/production.js` is used for defaulting the production build.

The .env file can be used to override these variables. See the `.env.example` file. You can override these by setting
them at the unix shell, or using the `cross-env` utility. In most cases, the `DEV_PROXY_HOST` variable is likely to be changed for testing against a local version of the API.

### Adding additional configuration vars

1. Edit `webpack/client.config.js`. Add the new variable in the `webpack.DefinePlugin` section.
   For an example, see `Config.Auth0.domain`.
2. Update the type declaration `modules/core/env.d.ts` so that it's aware of the new flag.
3. You can now reference the variable directly from code via the global `Config` object.

## Running the app

- Run `yarn` to install dependencies.
- Run `yarn start`. This will run code generation for graphql types and start a live-reloading
  webpack-dev-server.
- Visit port 3000 to view the running app.

## Updating the Server Schema

To keep the client schema up to date with the server:

- Checkout the server code and pull
- Run `dotnet build`
- In the client, run `yarn watch-server-schema`
- Finally, run `yarn start` to generate the new GraphQL types

Commit the updated schema.

## Generating Graphql Types

The `codegen` task generates all type files. It:

1.  Generates `schema-types.gen.ts` in the graphql module
2.  Generates `graphql-types.ts` in the client

## Interactive Style Guide

We are using [React Storybook](https://storybook.js.org/) to generate a styleguide for our react components.

- To view the interactive style guide and component tests run `yarn storybook` and visit `localhost:6006`

## Linting

We are using `eslint` for linting. Run `yarn lint`.

## Testing

- To run unit tests, run `yarn jest` or `yarn jest --watch` (for the interactive jest-based test runner). This simply runs jest in the current directory, which will use config in the `jest` section of `package.json`.

## Analyzing bundle size

If you run the command `yarn analyze`, webpack will open a visualizer that measures the file size of individual
chunks and their dependencies. It's a good idea to keep an eye on this as the application grows or new dependencies
are added.

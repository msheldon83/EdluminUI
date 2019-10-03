# EdluminUI

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
- Install Docker.app. Our database and other services are configured to run in docker.
- Symlink `.env.example` to `.env`, which sets up your environment to run from Docker. You can copy and modify `.env.example` to `.env` if the defaults won't work for you.
- Symlink `.envrc.example` to `.envrc`. This allows you to set some environment variables for development

## Running the app

- Run `yarn` to install dependencies.
- Run `yarn build` to, among other things, create generated types and scripts.
  - We decided not to check in the generated GraphQL types for this project. If you view or edit the source code before building the app, you will see many type errors and failed imports. (This is because generated type / files will not exist yet.)
- Run `yarn dev` to start the hot-reloading dev server.
- Visit port 3000 to view the running app.

## Generating Graphql Types

The `codegen` task generates all type files. It:

1.  Runs a regex on the `server-schema.graphql` to conform to the code generator syntax
2.  Generates `schema-types.gen.ts` in the graphql module
3.  Generates `graphql-types.ts` in the client

## Interactive Style Guide

We are using [React Storybook](https://storybook.js.org/) to generate a styleguide for our react components.

- To view the interactive style guide and component tests run `yarn dev:storybook` and visit `localhost:9001`

## Linting

We are using `eslint` for linting. Run `yarn lint`.

## Testing

- To run unit tests, run `yarn test:unit` or `yarn test:unit --watch` (for the interactive jest-based test runner). This simply runs jest in the current directory, which will use config in the `jest` section of `package.json`.

Note: `yarn test:unit` is an alias for running `jest` directly.

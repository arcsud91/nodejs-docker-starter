# Introduction
This project is the primary backend (server-side) code to kick-start any node js project with docker.

# Structuring
The following tree is what the file/directory structure of the project looks like:

```
.
├── Dockerfile
├── README.md
├── __tests__
│   ├── integration
│   │   ├── 00-setup.specs.js
│   │   ├── auth-login.specs.js
│   │   ├── auth-signup.specs.js
│   │   └── zz-teardown.specs.js
│   ├── test-base.js
│   ├── units
│   │   └── route-definition-base.specs.js
│   └── utils.js
├── deploy
│   ├── compose
│   │   ├── docker-compose.override.yml
│   │   └── docker-compose.yml
│   └── config
│       └── supervisord.conf
├── index.js
├── knexfile.js
├── migrations
│   ├── 20190415125311-user.js
│   └── 20190515162338-account-activation.js
├── package-lock.json
├── package.json
├── seeds
│   ├── 01-users.js
└── src
    ├── api
    │   ├── auth
    │   └── route-definition-base.js
    ├── app.js
    ├── config
    │   ├── config.json
    │   └── index.js
    ├── lib
    │   ├── errors
    │   ├── index.js
    │   ├── queue.js
    │   ├── services
    │   └── sessions.js
    ├── logging
    │   └── index.js
    ├── middlewares
    │   ├── error-handler.js
    │   └── index.js
    ├── models
    │   ├── bookshelf.js
    │   ├── index.js
    │   ├── knex.js
    │   └── user.js
    └── runtime
        └── index.js
```

## `Dockerfile`
A pretty basic file; it contains the code to create a functioning Docker image which is **environment agnostic**.

## `README.md`
This file.

## `__tests__`
Right off the bat, we have the `__tests__` directory which will house all the test files. It is further bifurcated into `unit`
and `integration` based on our requirements.

The file scoping is based on the CSS Module standard: `[prefix]-[module]-[method?].specs.js`. For example,
if we have a `crypto` module in `src/helpers`, it'll be scoped as: `helpers-crypto.specs.js`. If you have a
very complicated method or module, you might want to break it down into it's formal components like
`helpers-crypto-rsa-calculateTotient.specs.js`.

All the tests related to the routes should be placed in the `routes` sub-directory.

Tests are written with the [`node-tap`](https://www.npmjs.com/package/tap) test runner following the
[`test anything protocol (tap)`](https://testanything.org/).

The tests import the `app.js` file which exports the `express` application (without listening). There are two
very interesting test files:

* `00-setup.specs.js` - cleans and remigrates the database;
* `zz-teardown.specs.js` - cleans and closes all the sockets and connections;

Their names are like that for a specific reason (order of execution, to be precise) and **should not be changed**. They define two constant sections `## SETUP ##` and `## TEARDOWN ##`. Since API testing is not like frontend testing, we also need to account for TCP sockets, etc. which need to be closed in order for the parent handle to be release. Simply put, when you bind the Express application through `.listen( PORT )`, you create a TCP socket handle. Every other service you start or connect to from within this process is considered to be a requirement for the Express application (parent handle). So, when you try closing the server with `server.disconnect()`, it will **not** work; and even if it does, it's not a good method to do testing. This happens because the handles have leaked and have hung the process since: i) the parent handle is detached; or ii) the parent TCP connection wasn't dissolved because otherwise the child processes will become orphans and not quit gracefully.

To make this easier for everyone, the `__tests__` directory contain two files:

  - `00-setup.specs.js` -- this is the first file which is executed by the test runner and hence is
  the best place to put all of the setup for services which may be required by the core application
  or the test suite in the process.

  - `zz-teardown.specs.js` -- Disconnects, clears, flushes and detaches the child process handle from
  the primary process. Disconnect from the database, end the Redis cluster: do it here.

**Oh, I just can not.**

`TestBase` is an abstract class which contains a lot of reusable code you can use to quickly write tests. It's **only used in integration tests** since they require a considerable amount of setup.

In the interest of brevity, I will leave the exploration part to the reader. It's pretty straight forward.

## `deploy`
This directory houses all our scripts, configuration files, etc. related to deploying the application. This folder contains one directory:

* `compose`: contains the `docker-compose` files;

The `docker-compose` program accepts a stack definition in the form of `docker-compose.yml`; however, since software engineers like following an incremental build model, it also tries to load `docker-compose.override.yml` file if found. This gives us a nice surface to work with; as backend engineers, we'd want the external services running and alive. For that, all the cannonical configuration is hosted in the `docker-compose.yml` file. QA would require access to the actual API for testing, for example, and for that, we can use the override file; it updates a couple of things and adds the `api` service which is basically our code. :)

## `.gitlab-ci.yml`
This is our CI/CD definition file.

## `index.js`
This is the primary entrypoint for the application which is to say that it is the one responsible for starting the HTTP server itself. This separation is done to ensure smoother and pain-free testing.

This file also contains two very specific lines:

```javascript
process.on( 'SIGINT', interruptHandler );
process.on( 'SIGTERM', interruptHandler );
```

With Node.js, you have to the ability to dynamically react to process signals sent by the OS or the user. In particular, `SIGINT` is sent when you press `Ctrl-C` and `SIGTERM` is sent when the hypervisor requests the application to terminate.

In order to gracefully handle this, we have a handler which logs the signal name, closes all the connections to databases, messaging queues, etc. and finally closes the server itself.

## `src`
This directory contains the meat of the application. I will only cover the parts which are intersting.

### `api`
Every folder here is basically a route. The folder must contain two files:

* `index.js` - this is the route definition;
* `controller.js` - this is the associated route handler defined in `index.js`.

To ease with development, common code has been extracted in an abstract class called `RouteDefinitionBase` which has to be imported by the `index.js` file and `extended`.

Everything else is self-explanatory; be sure to browse the directory and its associated files.

### `runtime`
This is the dynamic route loading module. It lists all the routes it finds in the `api` folder and attaches them to the application.

**Note**: when `NODE_ENV` is `testing`, no routes are attached. Rather, they are dynamically attached using the `TestBase` as defined in the section above.

### `lib`
This folder contains all the library code. Examples of this include the different types of errors, database services, etc.

## `scripts`
The boilerplate provides a lot of scripts:

* `test:unit`: runs all the unit test cases;
* `test:integration`: runs all the integration test cases (i.e., API tests);
* `pretest`: runs the linter before the `test` script is called;
* `test`: runs _every_ test case;
* `start`: starts the application;
* `start:dev`: starts the application with live-reload;
* `start:stack`: starts the `docker-compose` stack for development;
* `stop:stack`: stops the `docker-compose` stack;
* `logs`: prints the logs of the `docker-compose` stack; you can also run it with `--` and pass the name of the service whose logs you want; and
* `migrate:clean`: cleans the database and re-seeds everything;

In addition to that, there are a couple of other _commands_ you _should_ be familiar with:

* `npx ...`: runs a specific binary exported by a package in `package.json` (`knex` for example!);
* `npx knex migrate:make <Name>`: makes a new migration in the `migrations/` directory with the specified `<Name>`;
* `npx knex seed:make XX-<Name>`: makes a new seed file in the `seeds/` directory; the `XX` stands for the number which should be prefixed to make sure that the seeds run in a specific order.

# Commiting Guidelines
To generate the changelog for every release, we use the conventional-commit format. In a nutshell, it means that your commits are in the form of: `type(scope?): message [flags?]` where the `type` can be one of:

* `breaking`: usually used for MAJOR releases, this indicates that there is some feature which breaks the system's backward compatibility and interoperability;
* `build`: a commit related to build systems (`npm`, `gulp`, etc.);
* `ci`: a commit which affects the CI/CD tools and/or pipeline;
* `chore`: a commit which affects anything apart from the source code;
* `docs`: a commit affecting the documentation;
* `feat`: a commit which adds a new feature;
* `fix`: a commit which fixes a bug; `message` MUST include the issue number;
* `other`: a global umbrella for _anything_ else;
* `perf`: a commit improving the performance;
* `refractor`: a commit which includes refractoring of the source code; MUST NOT add any features/fixes;
* `revert`: revert to a branch/commit/release/tag;
* `style`: a commit fixing the style of the code;
* `test`: add/amend test cases.

`scope` refers to what part/component/service/file is being changed by this commit.

The `message` should be a clear, crisp, concise giving a bird's eye view of the commit. In case you want to add additional information, you can leave a blank line after the commit and provide whatever detail you need.

`flags` MUST be set to `breaking` in case of a breaking change to the system.

# Conclusion
This boilerplate has been created keeping in mind the basic setup required to kick-off the development. If you feel any changes are required feel free to raise a PR.

## Metadata
Maintainer - [Archit Sud](@arcsud91)

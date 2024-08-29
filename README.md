# VueModel
This is very much WIP! I've made the repo public so people can see what I'm talking about in the podcast 😉

To see how it works, take a look at:
- `tests/*`
- `packages/core/src/contracts/crud`
- `packages/core/src/composables`

If you're interested in implementing a backend for your api/framework, you'll only need to implement the contracts within `packages/core/src/contracts/crud` and the composables will just work! We'll soon build out a structure for running the tests within `tests/*` against any backend so **you won't even have to write the tests yourself!**... at least not all of them.

# Drivers
We'll start with [IndexedDB (powered by PiniaORM)](https://pinia-orm.codedredd.de/), [laravel Orion](https://tailflow.github.io/laravel-orion-docs/) and [Dataverse](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro) then take it from there!
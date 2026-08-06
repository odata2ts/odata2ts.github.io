[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/odata2ts/odata2ts.github.io/buildAndDeploy.yml?branch=release&style=for-the-badge)](https://github.com/odata2ts/odata2ts.github.io/actions/workflows/buildAndDeploy.yml)

# Documentation Website of odata2ts

This repository contains the source of the official documentation website of
[odata2ts](https://github.com/odata2ts/odata2ts), published at
[https://odata2ts.github.io](https://odata2ts.github.io/).

It is built with [Docusaurus](https://docusaurus.io/) and serves two separate documentation sections:

- `docs/` - **Documentation**: everything about odata2ts itself, from the generator over the converters
  to the generated OData client. Navigation: [sidebars.js](./sidebars.js).
- `odata-concepts/` - **OData Concepts**: everything about the OData protocol itself, independent of
  odata2ts. Navigation: [sidebarsConcepts.js](./sidebarsConcepts.js).

Everything else is the site itself: `src/` (React components, pages and styles), `static/` (images and
other assets) and [docusaurus.config.js](./docusaurus.config.js) (site configuration, navbar, footer and
the URL redirects that keep former documentation paths alive).

## Local Development

Prerequisites: Node.js and Yarn.

```shell
yarn install
yarn start
```

This starts a local development server and opens a browser window; most changes are reflected live.
Note that the URL redirects configured in `docusaurus.config.js` only take effect in a production build.

Before opening a pull request, run the same checks that CI runs:

```shell
yarn typecheck
yarn check-format
yarn build
```

`yarn format` applies the formatting. `yarn build` generates the static site into `build/` and is the
check that matters most: broken links and broken anchors fail the build. `yarn serve` serves that
build locally, `yarn clear` removes the Docusaurus caches.

## Branches and Deployment

This repository uses two long-lived branches:

- **`main`** collects the work. Every pull request targets `main`, and everything that is finished
  lands there - including documentation for features that are not released yet.
- **`release`** is what the live site shows. It is only advanced once the corresponding odata2ts
  release is out, by merging `main` into it.

That split exists so that documentation can be written ahead of a release without publishing it
early. `release` is never worked on directly: it only ever receives what has already passed
through `main`.

The site is deployed to GitHub Pages by the
[buildAndDeploy](./.github/workflows/buildAndDeploy.yml) workflow, which runs on every push to
`release` and can also be triggered manually from the Actions tab. There is no manual deployment
step - in particular, the site is not served from a `gh-pages` branch.

Pull requests are verified by the [buildAndTest](./.github/workflows/buildAndTest.yml) workflow,
which type-checks, checks the formatting and builds the site.

## Support, Feedback, Contributing

If you have any sorts of questions use [GitHub Discussions](https://github.com/odata2ts/odata2ts/discussions)
of the main `odata2ts` repository.

This project is open to feature requests, suggestions, bug reports, and the like
via [GitHub issues](https://github.com/odata2ts/odata2ts/issues) of the main `odata2ts` repository.

Contributions and feedback are encouraged and always welcome. Documentation gaps are bugs: if you did
not find the answer you needed here, that alone is worth an issue.

## License

Copyright (c) odata2ts, all rights reserved. See [License](./LICENSE).

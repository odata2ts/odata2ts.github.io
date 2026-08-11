[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/odata2ts/odata2ts.github.io/buildAndDeploy.yml?branch=main&style=for-the-badge)](https://github.com/odata2ts/odata2ts.github.io/actions/workflows/buildAndDeploy.yml)

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

## Commits

[Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) drive the release, so the type
is not decoration: it decides whether a change ever reaches the live site. Everything in this
repository is documentation, which makes `doc` meaningless as a type here. Pick the type by what the
change does to the content instead:

- `feat` - new content: a new page or chapter, a newly documented option
- `fix` - content that was wrong, outdated, misleading or broken, dead links and typos included
- `refactor` - restructuring existing content without changing what it says
- `chore` / `build` - dependencies, tooling, workflows
- `doc` - this repository's own meta documentation, i.e. this README

Only `feat`, `fix`, dependency bumps and anything marked as a breaking change reach the changelog and
cause a release. The rest is invisible to release-please, so a batch of only `refactor` or `chore`
commits sits on `main` until the next `feat` or `fix` publishes it along with everything else.

Scope with the page or section the change belongs to - `fix(configuration): ...` - or leave the scope
out.

## Branches and Deployment

`main` is the only long-lived branch. Every pull request targets it, and everything that is finished
lands there - including documentation for features that are not released yet. What separates
"finished" from "published" is release-please: merged work accumulates in a release PR
(`chore(release): publish branch main`), and only merging that release PR publishes the live site.

That way documentation can be written ahead of a release without publishing it early, which is what
the former `release` branch was for, but without a second branch to keep in sync.

Both steps live in the [buildAndDeploy](./.github/workflows/buildAndDeploy.yml) workflow, which runs
on every push to `main`: it first lets release-please open or merge the release PR, and deploys to
GitHub Pages only when that actually created a release. There is no manual deployment step - in
particular, the site is not served from a `gh-pages` branch.

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

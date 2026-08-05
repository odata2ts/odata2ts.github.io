// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require("prism-react-renderer");

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import("@docusaurus/types").Config} */
const config = {
  title: "odata2ts",
  tagline:
    "Centers around a flexible and powerful generator, so that you can work with OData model types, type-safe query builders, and full-fledged, domain-specific OData clients.",
  favicon: "img/odata2ts.ico",

  // Set the production url of your site here
  url: "https://odata2ts.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "odata2ts", // Usually your GitHub org/user name.
  projectName: "odata2ts.github.io", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  plugins: [
    [
      "@docusaurus/theme-classic",
      {
        customCss: require.resolve("./src/css/custom.css"),
      },
    ],
    // Docusaurus 3 extracted SVGR into its own plugin; without it an imported
    // SVG is a URL instead of a React component.
    "@docusaurus/plugin-svgr",
    [
      // Keeps the URLs of the navigation restructuring alive. Only takes effect in a
      // production build, not under `yarn start`.
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          // converters left the generator section
          { from: "/docs/generator/converters", to: "/docs/converters" },
          { from: "/docs/generator/converters/v2-to-v4-converter", to: "/docs/converters/v2-to-v4-converter" },
          { from: "/docs/generator/converters/common-converter", to: "/docs/converters/common-converter" },
          { from: "/docs/generator/converters/big-number-converters", to: "/docs/converters/big-number-converters" },
          { from: "/docs/generator/converters/luxon-converter", to: "/docs/converters/luxon-converter" },
          { from: "/docs/generator/converters/ui5-v2-converter", to: "/docs/converters/ui5-v2-converter" },
          // upgrading became a section of its own
          { from: "/docs/generator/upgrading", to: "/docs/upgrading" },
          // "OData - Basics" dissolved: feature support went up, the data types to the converters
          { from: "/docs/odata/feature-support", to: "/docs/feature-support" },
          { from: "/docs/odata/odata-types", to: "/docs/converters/odata-types" },
          { from: "/docs/category/odata---basics", to: "/docs/feature-support" },
          // "Query Builder" dissolved: querying and filtering joined the client,
          // the overview became the standalone use case
          { from: "/docs/query-builder/querying", to: "/docs/odata-client/querying" },
          { from: "/docs/query-builder/filtering", to: "/docs/odata-client/filtering" },
          { from: "/docs/query-builder/overview-and-setup", to: "/docs/special-use-cases/standalone-query-builder" },
          { from: "/docs/category/query-builder", to: "/docs/odata-client/querying" },
          // the getting started guide for that use case is gone
          {
            from: "/docs/getting-started/use-case_query-builder",
            to: "/docs/special-use-cases/standalone-query-builder",
          },
        ],
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        sidebarPath: require.resolve("./sidebars.js"),
        // Remove this to remove the "edit this page" links.
        // editUrl:
        //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        remarkPlugins: [[require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }]],
      },
    ],
    [
      "@docusaurus/plugin-content-pages",
      {
        path: "src/pages",
        /*routeBasePath: '',
        include: ['**!/!*.{js,jsx,ts,tsx,md,mdx}'],
        exclude: [
          '**!/_*.{js,jsx,ts,tsx,md,mdx}',
          '**!/_*!/!**',
          '**!/!*.test.{js,jsx,ts,tsx}',
          '**!/__tests__/!**',
        ],
        mdxPageComponent: '@theme/MDXPage',
        remarkPlugins: [require('remark-math')],
        rehypePlugins: [],
        beforeDefaultRemarkPlugins: [],
        beforeDefaultRehypePlugins: [],*/
      },
    ],
  ],
  themeConfig: {
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: "odata2ts",
      logo: {
        alt: "odata2ts Logo",
        src: "img/logo-odata2ts.svg",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          position: "left",
          label: "Documentation",
        },
        // {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: "https://github.com/odata2ts/odata2ts",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Documentation",
              to: "docs/intro",
            },
          ],
        },
        {
          title: "More",
          items: [
            /*     {
                     label: 'Blog',
                     to: '/blog',
                   },
              */ {
              label: "GitHub",
              href: "https://github.com/odata2ts/odata2ts",
            },
          ],
        },
        {
          title: "Credits",
          items: [
            {
              label: "Built with Docusaurus",
              href: "https://docusaurus.io/",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} odata2ts`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
};

module.exports = config;

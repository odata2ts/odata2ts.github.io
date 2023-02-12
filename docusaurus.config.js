// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import("@docusaurus/types").Config} */
const config = {
  title: "odata2ts",
  tagline: "Set of tools for generating useful stuff out of given OData services: From TypeScript model interfaces to complete TypeScript based OData client services.",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://odata2ts.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "odata2ts", // Usually your GitHub org/user name.
  projectName: "odata2ts.github.io", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },
  plugins: [
    [
      '@docusaurus/theme-classic',
      {
        customCss: require.resolve("./src/css/custom.css")
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        sidebarPath: require.resolve("./sidebars.js")
        // Remove this to remove the "edit this page" links.
        // editUrl:
        //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
      }
      ],
    [
      '@docusaurus/plugin-content-pages',
      {
        path: 'src/pages',
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
  themeConfig:
    ({
      // Replace with your project's social card
      // image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: "odata2ts",
        logo: {
          alt: "odata2ts Logo",
          src: "img/docs.png"
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Documentation"
          },
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: "https://github.com/odata2ts/odata2ts",
            label: "GitHub",
            position: "right"
          }
        ]
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Documentation",
                to: "docs/intro"
              }
            ]
          },
          {
            title: "More",
            items: [
              /*     {
                     label: 'Blog',
                     to: '/blog',
                   },
              */     {
                label: "GitHub",
                href: "https://github.com/odata2ts/odata2ts"
              }
            ]
          },
          {
            title: "Credits",
            items: [
              {
                label: "Docs icons created by Freepik - Flaticon",
                href: "https://www.flaticon.com/free-icons/docs"
              },
              {
                label: "Built with Docusaurus",
                href: "https://docusaurus.io/"
              }
            ]
          }

        ],
        copyright: `Copyright © ${new Date().getFullYear()} odata2ts`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
};

module.exports = config;

import React from "react";

export interface FeatureItem {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<"svg">>;
  img?: any;
  screenshot?: any;
  description: JSX.Element;
};

export const FEATURE_LIST: Array<FeatureItem> = [
  {
    title: "Leveraging OData Metadata",
    img: require("@site/static/img/ODataLogo-96.png").default,
    description: (
      <>
        <p>
          Each decent OData service comes with its own metadata description.
          This EDMX document is processed by <code>odata2ts</code> to generate different sorts of artefacts.
        </p>

        <p>
          OData versions V2 & V4 are supported and automatically detected by virtue of the EDMX document.
        </p>
      </>
    )
  },
  {
    title: "Powerful & Type-Safe Configuration",
    img: require("@site/static/img/config-icon.png").default,
    // Svg: require("@site/static/img/ts-logo-128.svg").default,
    description: (
      <>
        <p>
          The generator can be configured in a type-safe manner by facilitating the
          TS based config file. It allows for handling multiple odata services,
          using type converters, renaming props and more.
        </p>

        <p>
          You can <a href={"./docs/generator/configuration"}>fine-tune most aspects</a> of the artefact generation to your needs.
        </p>
      </>
    )
  },
  {
    title: "Generating Types for OData Models",
    Svg: require("@site/static/img/ts-logo-128.svg").default,
    description: (
      <>
        <p>
          For each entity and complex type <code>odata2ts</code> generates TypeScript interfaces:
          One representing a query response model, one suitable for editing operations like patch, update or create,
          and one for the entity id type. Additionally, parameter models for any custom operation
          are generated. <a href="./docs/getting-started/use-case_data-models">Get Started!</a>
        </p>
      </>
    )
  },
/*  {
    title: "Generating Q-Objects",
    Svg: require("@site/static/img/q.svg").default,
    description: (
      <>
        <p>
          Q-Objects are the magic sauce, since they encapsulate most of the functionality.
          Each entity or complex type is represented by a specific <code>QueryObject</code>,
          which helps formulating type-safe filter queries and allows for renaming and conversion features.
        </p>

        <p>
          Functions and actions also have a q counterpart, allowing for renaming and conversion features.
        </p>
      </>
    )
  },*/
  {
    title: "Building OData Queries",
    // Svg: require("@site/static/img/q.svg").default,
    screenshot: require("@site/static/img/query-builder.png").default,
    description: (
      <>
        <p>
          <code>odata-query-builder</code> is a library which helps you formulate even complex OData queries with ease.
          It uses a fluent API and makes use of the generated models and query objects to support type-safety all around.
          Additionally, the query-builder harmonizes V2 and V4 API differences.
        </p>

        <p>
          Find out all about <a href="./docs/query-builder/querying">querying</a> and <a href="./docs/query-builder/filtering">filtering</a>.
        </p>
      </>
    )
  },
  {
    title: "Domain-Savvy OData Client",
    // Svg: require("@site/static/img/q.svg").default,
    screenshot: require("@site/static/img/trippinService-auto-completion.png").default,
    description: (
      <>
        <p>
          The full-fledged OData client supports all CRUD operations and any custom operation (function / action).
          It offers excellent querying capabilities with the help of the query builder. You can choose between
          three readily available http client implementations (fetch, axios, jquery), but you can also roll your own.
        </p>

        <p>
          <a href="./docs/getting-started/use-case_full-service">Get Started!</a> or
          read the <a href="./docs/odata-client/the-main-service">main service</a> docs.
        </p>
      </>
    )
  }
];

import React from "react";

export interface FeatureItem {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<"svg">>;
  img?: any;
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
    Svg: require("@site/static/img/ts-logo-128.svg").default,
    description: (
      <>
        <p>
          The generator can be configured in a type-safe manner by virtue of a TS based config file:
          <code>odata2ts.config.ts</code>.
        </p>

        <p>
          It allows for handling multiple odata services, using type converters, renaming props and more.
        </p>
      </>
    )
  },
  {
    title: "Generating Model Interfaces",
    Svg: require("@site/static/img/ts-logo-128.svg").default,
    description: (
      <>
        <p>
          For each entity type and complex type TypeScript interfaces are generated: One representing
          a query response model and one suitable for editing operations like patch, update or create.
        </p>

        <p>
          Additionally, entity id types and parameter models for operations are generated.
        </p>
      </>
    )
  },
  {
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
  },
  {
    title: "Query-Builder",
    Svg: require("@site/static/img/q.svg").default,
    description: (
      <>
        <p>
          <code>odata-query-builder</code> is a library which helps you formulate complex OData queries in a fluent and type-safe way.
          It makes use of the generated models and q-objects.
        </p>

        <p>
          Additionally, the query-builder harmonizes V2 and V4 API differences.
        </p>
      </>
    )
  }
];

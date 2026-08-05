import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { FEATURE_LIST, FeatureItem } from "@site/src/components/HomepageFeatures/features";



function Feature({ title, Svg, img, screenshot, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className={styles.featureImgWrapper}>
        {img || screenshot ? (
          <img src={img || screenshot} className={screenshot ? styles.featureScreenshot : styles.featureImg} role="img" />
        ) : Svg ? (
          <Svg className={styles.featureImg} role="img" />
        ) : null}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        {/* a description consists of several paragraphs of its own, so it must not sit in a <p> */}
        <div>{description}</div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): React.JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FEATURE_LIST.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

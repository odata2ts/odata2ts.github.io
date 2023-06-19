import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { FEATURE_LIST, FeatureItem } from "@site/src/components/HomepageFeatures/features";



function Feature({ title, Svg, img, screenshot, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className={styles.featureImgWrapper}>
        {img || screenshot ? <img src={img || screenshot} className={ screenshot ? styles.featureScreenshot : styles.featureImg} role="img" /> : <Svg className={styles.featureImg} role="img" />}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
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

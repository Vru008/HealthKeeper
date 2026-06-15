import React from "react";
import "./aboutUs.css";

const values = [
  {
    title: "Mission",
    text: "To fix the broken patient journey by offering full-stack healthcare services and increasing patient centricity.",
  },
  {
    title: "Vision",
    text: "To ensure consistent quality and advanced surgical care and take the latest medical technologies to Tier 2 and Tier 3 cities.",
  },
  {
    title: "Value",
    text: "To collaborate as a team and take extreme ownership of our audacious goals to achieve targets and display tremendous integrity.",
  },
];

const expertise = [
  { icon: "/Icon/lung.png", title: "Lung Diseases" },
  { icon: "/Icon/heart1.png", title: "Heart Diseases" },
  { icon: "/Icon/ortho.png", title: "Orthopaedic" },
  { icon: "/Icon/general.png", title: "General Surgery" },
  { icon: "/Icon/pharma.png", title: "Pharmacy" },
  { icon: "/Icon/sports.png", title: "Sports Injury" },
];

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__overlay">
          <h1>
            Happiness begins
            <br />
            with good health
          </h1>
          <p>
            HealthKeeper connects you with trusted doctors and hospitals across
            India — and makes booking effortless.
          </p>
        </div>
      </section>

      {/* Mission / Vision / Value */}
      <section className="about-values">
        {values.map((v, i) => (
          <div
            className="value-card"
            key={v.title}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </div>
        ))}
      </section>

      {/* Expertise */}
      <section className="about-expertise">
        <h2>Our Expertise</h2>
        <div className="expertise-grid">
          {expertise.map((e, i) => (
            <div
              className="expertise-card"
              key={e.title}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="expertise-icon">
                <img src={e.icon} alt={e.title} />
              </div>
              <h4>{e.title}</h4>
              <p>
                Expert, compassionate care backed by modern technology and
                specialists who focus on the best outcomes for you.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

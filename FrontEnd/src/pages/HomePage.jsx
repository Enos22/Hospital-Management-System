import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext.jsx";
import { getLandingForRole, ROUTES } from "../app/navigation/routePaths.js";

const services = [
  {
    icon: "calendar",
    title: "Appointments",
    text: "Book, manage, and keep track of your hospital visits.",
  },
  {
    icon: "records",
    title: "Medical records",
    text: "View clear, secure information from your care history.",
  },
  {
    icon: "lab",
    title: "Lab services",
    text: "Request tests and follow results with confidence.",
  },
];

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const portalLink = isAuthenticated
    ? getLandingForRole(user?.role)
    : ROUTES.LOGIN;

  return (
    <div className="home-page">
      <header className="home-header">
        <Link className="home-brand" to="/" aria-label="AfyaCare home">
          <span className="home-brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>AfyaCare</span>
        </Link>

        <Link className="home-header-login" to={ROUTES.LOGIN}>
          Sign in
        </Link>

        <nav className="home-nav" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <Link className="home-nav-cta" to={ROUTES.SIGNUP}>Create account</Link>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Compassionate care, connected</p>
            <h1>Your health journey, <span>made simpler.</span></h1>
            <p className="home-lead">
              Access appointments, medical information, prescriptions, and
              billing support in one secure AfyaCare portal.
            </p>
            <div className="home-actions">
             
              <a className="home-secondary-action" href="#services">
                Explore services
              </a>
            </div>

            <div className="home-trust">
              <div className="home-avatar-stack" aria-hidden="true">
                <span>A</span>
                <span>K</span>
                <span>M</span>
              </div>
              <p><strong>Trusted care experience</strong><br />One account for every step</p>
            </div>
          </div>

          <div className="home-hero-visual" aria-label="AfyaCare patient care overview">
            <div className="home-visual-orbit orbit-one" />
            <div className="home-visual-orbit orbit-two" />
            <div className="home-care-card">
              <div className="home-care-icon" aria-hidden="true">+</div>
              <div>
                <span>Care team</span>
                <strong>Here when you need us</strong>
              </div>
            </div>
            <div className="home-doctor-portrait" role="img" aria-label="Doctor and patient illustration">
              <div className="portrait-circle portrait-circle-one" />
              <div className="portrait-circle portrait-circle-two" />
              <div className="portrait-doctor">
                <div className="portrait-head" />
                <div className="portrait-coat">
                  <span className="portrait-cross">+</span>
                </div>
              </div>
            </div>
            <div className="home-appointment-card">
              <div className="appointment-card-top">
                <span>Next visit</span>
                <span className="appointment-status">Confirmed</span>
              </div>
              <strong>General consultation</strong>
              <p><span aria-hidden="true">◷</span> 9:30 AM · Today</p>
            </div>
          </div>
        </section>

        <section className="home-services" id="services">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">Care made convenient</p>
              <h2>Everything you need, in one place</h2>
            </div>
            <p>Simple digital tools help you stay informed and in control of your health.</p>
          </div>

          <div className="home-service-grid">
            {services.map((service) => (
              <article className="home-service-card" key={service.title}>
                <div className={`home-service-icon ${service.icon}`} aria-hidden="true">
                  {service.icon === "calendar" && "▦"}
                  {service.icon === "records" && "≡"}
                  {service.icon === "lab" && "⌁"}
                </div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
               
              </article>
            ))}
          </div>
        </section>

        <section className="home-about" id="about">
          <div>
            <p className="home-eyebrow">Built around people</p>
            <h2>Better access. Better conversations. Better care.</h2>
          </div>

        </section>
      </main>
    </div>
  );
}

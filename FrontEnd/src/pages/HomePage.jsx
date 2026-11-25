import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext.jsx";
import { getLandingForRole, ROUTES } from "../app/navigation/routePaths.js";

const services = [
  {
    icon: "calendar",
    title: "Appointments",
    eyebrow: "Plan with ease",
    text: "Book, reschedule, and keep every hospital visit organized.",
  },
  {
    icon: "records",
    title: "Medical records",
    eyebrow: "Stay informed",
    text: "View your care history and prescriptions in one secure place.",
  },
  {
    icon: "lab",
    title: "Lab services",
    eyebrow: "Know sooner",
    text: "Request tests, receive updates, and follow results with confidence.",
  },
];

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const portalLink = isAuthenticated
    ? getLandingForRole(user?.role)
    : ROUTES.LOGIN;

  return (
    <div className="afya-page">
      <header className="home-header">
        <Link className="home-brand" to="/" aria-label="AfyaCare home">
          <span className="home-brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>AfyaCare <small>Health care</small></span>
        </Link>
        <nav className="home-nav" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#about">About AfyaCare</a>
          <Link className="home-header-login" to={ROUTES.LOGIN}>Sign in</Link>
          <Link className="home-nav-cta" to={ROUTES.SIGNUP}>Create account</Link>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Compassionate care, connected</p>
            <h1>Health care,<br /><span>made personal.</span></h1>
            <p className="home-lead">
              One thoughtful place for appointments, medical records,
              prescriptions, lab results, and billing.
            </p>
            <div className="home-actions">
              <Link className="home-primary-action" to={isAuthenticated ? portalLink : ROUTES.SIGNUP}>
                {isAuthenticated ? "Open my portal" : "Get started"}
              </Link>
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
              <p><strong>One secure account</strong><br />Designed around your care</p>
            </div>
          </div>
          <div className="afya-dashboard-preview" aria-label="AfyaCare dashboard preview">
            <header className="afya-dashboard-header">
              <div className="afya-dashboard-brand">
                <span className="afya-dashboard-mark" aria-hidden="true">+</span>
                <strong>AfyaCare</strong>
              </div>
              <div className="afya-dashboard-actions" aria-hidden="true">
                <span className="afya-dashboard-bell">◦</span>
                <span className="afya-dashboard-avatar">AM</span>
              </div>
            </header>

            <div className="afya-dashboard-body">
              <aside className="afya-dashboard-sidebar" aria-hidden="true">
                <span className="active">⌂</span>
                <span>▦</span>
                <span>≡</span>
                <span>⌁</span>
              </aside>

              <div className="afya-dashboard-content">
                <div className="afya-dashboard-title">
                  <div>
                    <span>Patient dashboard</span>
                    <strong>Good morning, Alex</strong>
                  </div>
                  <span className="afya-dashboard-status">All up to date</span>
                </div>

                <article className="afya-upcoming-card">
                  <div className="afya-upcoming-date">
                    <span>NOV</span>
                    <strong>23</strong>
                  </div>
                  <div className="afya-upcoming-info">
                    <span>Upcoming appointment</span>
                    <strong>General consultation</strong>
                    <p>Dr. Njeri · 9:30 AM</p>
                  </div>
                  <span className="afya-upcoming-confirmed">Confirmed</span>
                </article>

                <div className="afya-dashboard-summary">
                  <article className="afya-summary-card">
                    <div className="afya-summary-icon">≡</div>
                    <div>
                      <span>Medical records</span>
                      <strong>12 documents</strong>
                      <small>Last updated today</small>
                    </div>
                  </article>
                  <article className="afya-summary-card">
                    <div className="afya-summary-icon lab">⌁</div>
                    <div>
                      <span>Laboratory</span>
                      <strong>2 new results</strong>
                      <small>Blood panel · Complete</small>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-services" id="services">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">Care made clear</p>
              <h2>Everything you need, in one place</h2>
            </div>
            <p>Simple tools. Less admin. More time focused on feeling better.</p>
          </div>

          <div className="home-service-grid">
            {services.map((service) => (
              <article className="home-service-card" key={service.title}>
                <div className={`home-service-icon ${service.icon}`} aria-hidden="true">
                  {service.icon === "calendar" && "▦"}
                  {service.icon === "records" && "≡"}
                  {service.icon === "lab" && "⌁"}
                </div>
                <p className="home-card-eyebrow">{service.eyebrow}</p>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <Link to={isAuthenticated ? portalLink : ROUTES.LOGIN}>
                  Open service <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-about" id="about">
          <div>
            <p className="home-eyebrow">Built around people</p>
            <h2>More clarity.<br />More confidence.</h2>
          </div>
          <p>
            AfyaCare keeps your care information close and your next step clear,
            wherever you are in your health journey.
          </p>
          <Link className="home-about-cta" to={ROUTES.SIGNUP}>Create your account</Link>
        </section>
      </main>
    </div>
  );
}

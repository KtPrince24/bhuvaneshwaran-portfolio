import { useState } from "react";
import { ArrowDown, ArrowUpRight, Github, Linkedin, Sparkles } from "lucide-react";
import { profile } from "../data/profile";

export function Hero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoSrc = profile.photo || "/images/profile.jpg";
  const photoAlt = profile.photoAlt || `Portrait of ${profile.name}, ${profile.title}`;

  return (
    <section id="home" className="hero section-shell">
      <div className="hero-grid container">
        <div className="hero-copy reveal">
          <div className="eyebrow"><span className="status-dot" /> Available for meaningful software work</div>
          <p className="hero-kicker">HELLO, I'M</p>
          <h1>{profile.name}</h1>
          <p className="hero-title">{profile.title} <span>/</span> {profile.subtitle}</p>
          <p className="hero-summary">{profile.summary}</p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={() => scrollTo("projects")} data-testid="hero-explore-button">Explore my work <ArrowDown size={17} /></button>
            <button className="button button--quiet" onClick={() => scrollTo("contact")} data-testid="hero-contact-button">Get in touch <ArrowUpRight size={17} /></button>
          </div>
          <div className="social-row" aria-label="Social links">
            <span>Find me on</span>
            <a className="icon-link" href={profile.github.startsWith("http") ? profile.github : undefined} target="_blank" rel="noreferrer" aria-label="GitHub" data-testid="hero-github-link"><Github size={18} /></a>
            <a className="icon-link" href={profile.linkedin.startsWith("http") ? profile.linkedin : undefined} target="_blank" rel="noreferrer" aria-label="LinkedIn" data-testid="hero-linkedin-link"><Linkedin size={18} /></a>
          </div>
        </div>
        <div className="hero-visual reveal reveal-delay-2" aria-label="Developer workspace illustration" data-testid="hero-visual">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="profile-photo-chip" data-testid="profile-photo-chip">
            {!photoFailed ? (
              <img
                className="profile-photo-chip-image"
                src={photoSrc}
                alt={photoAlt}
                width="152"
                height="152"
                loading="eager"
                decoding="async"
                onError={() => setPhotoFailed(true)}
                data-testid="profile-photo"
              />
            ) : (
              <div className="profile-photo-chip-fallback" aria-hidden="true">{profile.initials}</div>
            )}
          </div>
          <div className="code-card">
            <div className="code-top"><span><i /><i /><i /></span><small>developer.js</small><Sparkles size={15} className="code-sparkle" /></div>
            <div className="code-line"><span className="code-number">01</span><span><b className="syntax-purple">const</b> developer = {'{'}</span></div>
            <div className="code-line indent"><span className="code-number">02</span><span>name: <b className="syntax-blue">"Bhuvaneshwaran"</b>,</span></div>
            <div className="code-line indent"><span className="code-number">03</span><span>focus: <b className="syntax-blue">"reliable systems"</b>,</span></div>
            <div className="code-line indent"><span className="code-number">04</span><span>craft: [<b className="syntax-green">"APIs"</b>, <b className="syntax-green">"interfaces"</b>]</span></div>
            <div className="code-line"><span className="code-number">05</span><span>{'}'}</span></div>
            <div className="code-cursor" />
          </div>
          <div className="visual-caption"><span className="caption-line" /> Building with purpose, one layer at a time.</div>
        </div>
      </div>
      <div className="container hero-tech"><span>CORE TOOLKIT</span><div>{["Java", "Python","Spring Boot", "FastAPI", "React", "MySQL", "PostgreSQL", "MongoDB"].map((item) => <b key={item}>{item}</b>)}</div></div>
    </section>
  );
}

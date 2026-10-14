import { BookOpen, Briefcase, Code2, GraduationCap } from "lucide-react";
import { education } from "../data/profile";
import { SectionIntro } from "./SectionIntro";

const cards = [
  { icon: Briefcase, title: "Professional Experience", text: "Hands-on experience developing web applications, integrating REST APIs, and working with database-driven modules." },
  { icon: Code2, title: "Full Stack Development", text: "Building responsive user interfaces and backend services with a focus on reliable APIs, maintainable code, and data integration." },
  { icon: GraduationCap, title: "Continuous Learning", text: "Continuously strengthening technical skills, exploring better engineering practices, and solving practical software development challenges." },
];

export function About() {
  return <section id="about" className="section-shell section-muted"><div className="container">
    <SectionIntro eyebrow="01 / ABOUT" title="Building with clarity." copy="A practical software developer who enjoys turning real product needs into dependable, thoughtful experiences." />
    <div className="about-layout"><div className="about-copy"><p className="large-copy">I'm a Software Developer with a background in Information Technology and hands-on experience building web applications, REST APIs, backend services, database-driven systems, and responsive user interfaces.</p><p>I work with Java, Spring Boot, Python, FastAPI, React, JavaScript, SQL, and PostgreSQL. I enjoy solving practical engineering problems, developing reliable software, and continuously improving my technical skills.</p></div><div className="education-card"><span className="eyebrow">EDUCATION</span>{education.map((item) => <div className="education-item" key={item.degree}><BookOpen size={17} /><div><strong>{item.degree}</strong><span>{item.period}</span></div></div>)}</div></div>
    <div className="insight-grid">{cards.map(({ icon: Icon, title, text }) => <article className="insight-card" key={title}><div className="insight-card-icon"><Icon size={20} /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div></section>;
}
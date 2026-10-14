import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { experience } from "../data/profile";
import { SectionIntro } from "./SectionIntro";

export function Experience() {
  return (
    <section id="experience" className="section-shell section-muted">
      <div className="container">
        <SectionIntro eyebrow="03 / EXPERIENCE" title="Where I’ve been building." copy="Professional experience across software development, product modules, and engineering workflows." />
        <div className="timeline">
          {experience.map((item, index) => (
            <article className="timeline-item" key={item.company}>
              <div className="timeline-marker">
                <BriefcaseBusiness size={17} />
              </div>
              <div className="timeline-content">
                <div className="timeline-meta">
                  <span>0{index + 1}</span>
                  <span>{item.status}</span>
                </div>
                <h3>{item.role}</h3>
                <p className="company-name">
                  <a
                    href={item.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.company} — visit company website (opens in new tab)`}
                  >
                    {item.company} <ArrowUpRight size={15} />
                  </a>
                </p>
                <p>{item.description}</p>
                {item.stack.length > 0 && (
                  <div className="tag-list">
                    {item.stack.map((tech) => <span key={tech}>{tech}</span>)}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
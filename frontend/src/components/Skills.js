import { Braces, Database, GitBranch, Server, Terminal } from "lucide-react";
import { skills } from "../data/profile";
import { SectionIntro } from "./SectionIntro";

const icons = [Terminal, Braces, Server, Database, GitBranch];
export function Skills() {
  return <section id="skills" className="section-shell"><div className="container"><SectionIntro eyebrow="02 / TOOLKIT" title="Technical skills." copy="A growing toolkit organized around building, connecting, and maintaining useful software." /><div className="skills-grid">{skills.map((group, index) => { const Icon = icons[index]; return <article className="skill-card" key={group.label}><div className="skill-card-top"><span className="skill-icon"><Icon size={19} /></span><span className="skill-index">0{index + 1}</span></div><h3>{group.label}</h3><div className="tag-list">{group.items.map((item) => <span key={item}>{item}</span>)}</div></article>; })}</div></div></section>;
}
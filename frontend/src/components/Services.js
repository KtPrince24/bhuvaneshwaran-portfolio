import { Bug, Database, PanelsTopLeft, ServerCog } from "lucide-react";
import { capabilities } from "../data/profile";
import { SectionIntro } from "./SectionIntro";

const icons = [PanelsTopLeft, ServerCog, Database, Bug];
export function Services() {
  return <section id="approach" className="section-shell section-dark"><div className="container"><SectionIntro eyebrow="05 / APPROACH" title="How I contribute." copy="The kind of practical, detail-aware work I bring to a software team." /><div className="capability-grid">{capabilities.map((item, index) => { const Icon = icons[index]; return <article className="capability-card" key={item.title}><span className="capability-number">{item.number}</span><Icon size={23} /><h3>{item.title}</h3><p>{item.text}</p></article>; })}</div></div></section>;
}
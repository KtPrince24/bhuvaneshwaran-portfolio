import { ArrowUpRight, Code2, Github, Linkedin } from "lucide-react";
import { profile } from "../data/profile";
import { useAssetAvailable } from "../hooks/useAssetAvailable";

export function Footer() {
  const links = ["about", "skills", "experience", "projects", "contact"];
  const resumeAvailable = useAssetAvailable(profile.resumePath);
  return <footer className="site-footer"><div className="container footer-top"><div><div className="footer-brand"><span className="footer-brand-mark" aria-label="K. Bhuvaneshwaran logo"><Code2 size={17} aria-hidden="true" /></span><span><strong>{profile.name}</strong><small>{profile.title}</small></span></div><p>Thoughtful software, built one useful layer at a time.</p></div><div className="footer-links"><span className="eyebrow">EXPLORE</span>{links.map((link) => <a href={`#${link}`} key={link} data-testid={`footer-${link}-link`}>{link}</a>)}</div><div className="footer-links"><span className="eyebrow">CONNECT</span><a href={profile.github.startsWith("http") ? profile.github : undefined} target="_blank" rel="noreferrer" data-testid="footer-github-link">GitHub <ArrowUpRight size={14} /></a><a href={profile.linkedin.startsWith("http") ? profile.linkedin : undefined} target="_blank" rel="noreferrer" data-testid="footer-linkedin-link">LinkedIn <ArrowUpRight size={14} /></a>{resumeAvailable ? (
              <a className="footer-resume-link" href={profile.resumePath} download="K_Bhuvaneshwaran_Resume.pdf" data-testid="footer-resume-link">Download resume <ArrowUpRight size={14} /></a>
            ) : (
              <span className="resume-placeholder" data-testid="resume-placeholder"><span /> Resume PDF to be added</span>
            )}</div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {profile.name}</span><span>Software Developer / Full Stack Developer</span></div></footer>;
}
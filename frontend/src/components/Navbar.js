import { useEffect, useState } from "react";
import { ArrowUpRight, Code2, Menu, X } from "lucide-react";
import { profile } from "../data/profile";
import { useAssetAvailable } from "../hooks/useAssetAvailable";

const links = ["about", "skills", "experience", "projects", "contact"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const resumeAvailable = useAssetAvailable(profile.resumePath);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`} data-testid="site-header">
      <div className="container nav-inner">
        <button className="brand" onClick={() => goTo("home")} data-testid="brand-home-button" aria-label="Back to home">
          <span className="brand-mark" aria-label="K. Bhuvaneshwaran logo"><Code2 size={17} aria-hidden="true" /></span><span className="brand-label">bhuvanesh.js</span>
        </button>
        <nav className={`nav-links ${open ? "nav-links--open" : ""}`} aria-label="Primary navigation">
          {links.map((link) => <button key={link} onClick={() => goTo(link)} data-testid={`nav-${link}-button`}>{link}</button>)}
          {resumeAvailable ? (
            <a className="nav-resume" href={profile.resumePath} download="K_Bhuvaneshwaran_Resume.pdf" data-testid="nav-resume-button">Resume <ArrowUpRight size={15} /></a>
          ) : (
            <span className="nav-resume nav-resume--unavailable" data-testid="nav-resume-button" aria-disabled="true">Resume <ArrowUpRight size={15} /></span>
          )}
        </nav>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} data-testid="mobile-menu-toggle">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
import { useState, useCallback, useRef } from "react";
import { AlertCircle, CheckCircle2, Github, Linkedin, Mail, Send } from "lucide-react";
import { profile } from "../data/profile";
import { SectionIntro } from "./SectionIntro";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8001").replace(/\/$/, "");
const API = `${BACKEND_URL}/api/contact`;

const emailPattern = /^\S+@\S+\.\S+$/;

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [state, setState] = useState({ status: "idle", message: "" });
  const isSendingRef = useRef(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = useCallback(async (event) => {
    event.preventDefault();
    if (isSendingRef.current) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const topic = form.topic.trim();
    const message = form.message.trim();

    if (!name || !email || !topic || !message) {
      setState({ status: "error", message: "Please complete every field before sending." });
      return;
    }
    if (!emailPattern.test(email)) {
      setState({ status: "error", message: "Please enter a valid email address." });
      return;
    }
    if (name.length > 120 || topic.length > 160 || message.length > 4000) {
      setState({ status: "error", message: "One or more fields exceed the allowed length." });
      return;
    }

    isSendingRef.current = true;
    setState({ status: "sending", message: "Sending your message…" });
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      if (!response.ok) {
        const detail = payload && typeof payload.detail === "string" ? payload.detail : null;
        throw new Error(detail || "send failed");
      }
      setForm({ name: "", email: "", topic: "", message: "" });
      setState({ status: "success", message: "Thanks — your message was sent successfully." });
    } catch (error) {
      const messageText = error instanceof Error && error.message && error.message !== "send failed"
        ? error.message
        : "The message could not be sent right now. Please try again shortly.";
      setState({ status: "error", message: messageText });
    } finally {
      isSendingRef.current = false;
    }
  }, [form]);

  return (
    <section id="contact" className="section-shell section-muted">
      <div className="container">
        <SectionIntro eyebrow="06 / CONTACT" title="Let’s work together." copy="I’m interested in connecting with teams working on meaningful software products and opportunities where I can contribute as a Software Developer." />
        <div className="contact-layout">
          <div className="contact-details">
            <div className="contact-note">
              <Mail size={20} />
              <div>
                <span className="eyebrow">EMAIL</span>
                <a href={`mailto:${profile.email}`}><strong data-testid="contact-email">{profile.email}</strong></a>
                <p>For opportunities, collaborations, and thoughtful software conversations.</p>
              </div>
            </div>
            <div className="social-contact">
              <a href={profile.github} target="_blank" rel="noreferrer" data-testid="contact-github-link"><Github size={18} /> GitHub</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" data-testid="contact-linkedin-link"><Linkedin size={18} /> LinkedIn</a>
            </div>
          </div>
          <form className="contact-form" onSubmit={submit} aria-describedby="contact-form-status" data-testid="contact-form">
            <div className="contact-intro" data-testid="contact-form-ready">
              <div>
                <strong>Let’s Start a Conversation</strong>
                <p>Have a project in mind, a job opportunity, or just want to connect? I’d love to hear from you.</p>
              </div>
            </div>
            <div className="form-grid">
              <label>Name<input aria-required="true" maxLength={120} name="name" value={form.name} onChange={update} placeholder="Your name" data-testid="contact-name-input" /></label>
              <label>Email<input aria-required="true" type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" data-testid="contact-email-input" /></label>
            </div>
            <label>Subject<input aria-required="true" maxLength={160} name="topic" value={form.topic} onChange={update} placeholder="How can we work together?" data-testid="contact-subject-input" /></label>
            <label>Message<textarea aria-required="true" maxLength={4000} name="message" value={form.message} onChange={update} rows="5" placeholder="Tell me a little about your project..." data-testid="contact-message-input" /></label>
            {state.status !== "idle" && (
              <div className={`form-status form-status--${state.status}`} id="contact-form-status" role="status" data-testid={`contact-form-${state.status}`}>
                {state.status === "success" ? <CheckCircle2 size={17} /> : state.status === "error" ? <AlertCircle size={17} /> : <Send size={17} />}
                {state.message}
              </div>
            )}
            <button className="button button--primary" disabled={state.status === "sending"} type="submit" data-testid="contact-submit-button">
              <Send size={16} /> {state.status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

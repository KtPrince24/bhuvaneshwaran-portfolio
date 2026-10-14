# PRD — K. Bhuvaneshwaran Portfolio

## Original problem statement
Build a premium, modern, responsive single-page personal portfolio for K. Bhuvaneshwaran, a Software Developer / Full Stack Developer, using the existing React starter. Include sticky navigation, hero, about, education, technical skills, experience, projects, development approach, contact, footer, accessibility, SEO, responsive layouts, subtle motion, verified links only, and no invented professional claims.

## Architecture decisions
- React single-page application with reusable section components and no backend dependency.
- Portfolio content is centralized in `frontend/src/data/profile.js` and `frontend/src/data/projects.js`.
- CSS-first visual system in `frontend/src/App.css`, with responsive breakpoints from mobile through large desktop.
- Contact form remains visibly unavailable until a real email service is configured; it does not fake submission.

## Implemented
- Sticky desktop/mobile navigation with smooth scrolling and mobile menu close behavior.
- Responsive hero with developer code illustration, calls to action, social-link placeholders, and technology toolkit.
- About, education, grouped skills, experience timeline, capabilities, six project cards, contact state, and footer.
- Only verified public project links are active: Money Manager live demo and GitHub repository.
- Metadata, Open Graph tags, semantic sections, descriptive labels, focusable controls, and `data-testid` coverage for user-facing flows.
- Production build verified with `yarn build`.

## Prioritized backlog
- **P0:** Add verified email, LinkedIn URL, and personal GitHub URL in `profile.js`.
- **P0:** Add the supplied resume PDF and enable the download action.
- **P1:** Connect a real email service and enable validated contact submissions.
- **P2:** Add approved project screenshots and verified internship details when available.
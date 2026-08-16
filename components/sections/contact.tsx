import { Container } from "@/components/primitives";
import { identity } from "@/content/site";

/**
 * The email itself is the focal element, set in display type. No contact form:
 * a form on a static site needs a third-party endpoint, invites spam, and this
 * audience will use email regardless.
 */
export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="ground-invert py-[var(--section-y)]"
    >
      <Container width="wide" className="text-center">
        <p className="t-caption tracking-[0.08em] uppercase">Contact</p>
        <h2 id="contact-heading" className="mt-6">
          <a
            href={`mailto:${identity.email}`}
            className="t-h1 break-words text-[var(--accent)] underline-offset-8 hover:underline"
          >
            {identity.email}
          </a>
        </h2>

        <p className="t-intro mx-auto mt-8">
          Based in {identity.location}. Open to application security and red
          team work, and to coordinated disclosure enquiries.
        </p>

        <p className="t-mono mt-10 text-[var(--text-tertiary)]">
          <a
            href="/.well-known/security.txt"
            className="hover:text-[var(--text)]"
          >
            /.well-known/security.txt
          </a>
        </p>
      </Container>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { cinematic } from "@/content/cinematic";
import { profiles } from "@/content/profiles";
import { identity, nav } from "@/content/site";

const social = profiles.filter((profile) =>
  ["GitHub", "LinkedIn", "X"].includes(profile.platform),
);

export function SiteFooter() {
  const closing = cinematic.closing;

  return (
    <footer
      id="contact"
      className="film-footer"
      data-station="9"
      data-station-label="Contact"
      aria-labelledby="contact-title"
    >
      <div className="film-footer__stage">
        <div className="film-footer__copy">
          <p className="film-eyebrow">{closing.eyebrow}</p>
          <h2 id="contact-title">{closing.title}</h2>
          <p className="film-footer__description">{closing.text}</p>
          <a className="film-cta" href={`mailto:${identity.email}`}>
            Start a conversation
          </a>
          <a className="film-footer__email" href={`mailto:${identity.email}`}>
            {identity.email}
          </a>
        </div>

        <figure className="film-footer__photo">
          <span className="film-eyebrow">The person behind the portfolio</span>
          <div className="film-footer__photo-frame">
            <Image
              src={closing.image}
              alt={closing.imageAlt}
              width={1254}
              height={1254}
              sizes="(max-width: 767px) 90vw, 45vw"
            />
          </div>
          <figcaption>{closing.caption}</figcaption>
        </figure>
      </div>

      <div className="film-footer__meta">
        <div className="film-footer__signature">
          <p>{identity.name}</p>
          <span>
            {identity.title} / {identity.location}
          </span>
        </div>
        <nav aria-label="Footer navigation" className="film-footer__links">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/resume">Résumé</Link>
          <Link href="/security">Disclosure record</Link>
        </nav>
        <div className="film-footer__links">
          {social.map((profile) => (
            <a
              key={profile.url}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${profile.platform} profile (opens in a new tab)`}
            >
              {profile.platform}
            </a>
          ))}
          <a href="/.well-known/security.txt">Security policy</a>
        </div>
      </div>
    </footer>
  );
}

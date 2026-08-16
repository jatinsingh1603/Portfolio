# Award photos

Drop photos here and they appear automatically in the Recognition section,
with a click-to-enlarge view. Nothing renders if the folder is empty.

Filenames must match the award's `projectSlug` + index, e.g.

    eclipse-6-0-hackathon-1.jpg
    eclipse-6-0-hackathon-2.jpg
    sprint4good-hackathon-1.jpg
    india-innovates-hackathon-1.jpg

The slug is the award's `event` field, lowercased, non-alphanumerics collapsed
to hyphens. `content/career.ts` is the source; `awardPhotoSlug()` in
`content/awards-media.ts` computes it.

Before adding a photo, check two things:

1. **You have the right to publish it.** Event photography is usually owned by
   the organiser, not the participants. A photo you were sent is not the same
   as a photo you may republish.
2. **Everyone identifiable in it is fine with being on your public site.**
   Teammates and judges did not sign up to appear on a personal portfolio.

Formats: jpg, png or webp. Any size — they are resized at build time.

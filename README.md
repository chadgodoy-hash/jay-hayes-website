# Jay Hayes · Gut-brain therapy website (HighLevel)

A three-page site for Jay Hayes, psychotherapist and clinical hypnotherapist. It's built as paste-in code for HighLevel's **Custom JS/HTML** element, on the same system as the Advice With Erin build.

| Page | File to paste | HighLevel path |
|---|---|---|
| Home | `dist/home.html` | `/` |
| About | `dist/about.html` | `/about` |
| Book a free call + message form | `dist/book.html` | `/book` |
| Free resources | `dist/resources.html` | `/resources` |

SEO titles and descriptions for each page are in `dist/_pages.csv`. To check a page locally, open it in `dist/preview/`. Edit `src/`, then run `node build.mjs`.

## Hosting (Hostinger)
`node build.mjs` also writes a standalone static copy to `dist/site/`: one folder per page path, with photos in `img/`. It's live for review at https://mediumturquoise-stingray-818727.hostingersite.com (a temporary Hostinger address).
- **Redeploy:** run `node build.mjs`, zip the *contents* of `dist/site/`, then use hPanel → Websites → this site → File manager (or the Hostinger static-site deploy) to upload and extract it into `public_html`.
- **Forms and booking** use the same HighLevel webhook and calendar settings in `src/config.json`. Until those are set, they show the "not connected" state on Hostinger too.
- **Custom domain:** once Jay has one, connect it to this website in hPanel.

## Design
- **Signature: the gut-brain line.** One thin apricot line starts in the hero at *the brain*, threads down the side of the homepage (never over text), and coils into *the gut* beside the final "Book your free call" button. It draws itself as you scroll, and is shown fully drawn for visitors who prefer reduced motion. It appears on the homepage only.
- **Palette ("dusk"):**

  | Name | Hex |
  |---|---|
  | Dusk | `#1E2A4A` |
  | Mist | `#F3F1F8` |
  | Haze | `#DCD5EE` |
  | Apricot | `#F2A779` |
  | Eucalypt | `#5E8C7B` |
- **Type:** Young Serif for headings, Figtree for text. Both are free Google Fonts.

## HighLevel setup
1. **Photos.** Upload the three web-ready files in `src/img/` to Media Storage, paste each URL into `assets-map.json`, then run `node build.mjs`. The originals stay untouched in `../Pictures/`.

   | File | Used on | Source |
   |---|---|---|
   | `jay-headshot.webp` | Home, "Meet Jay" (transparent cut-out on a lilac arch) | Diet vs Disease team headshot |
   | `jay-dogs.jpg` | About, hero | photo with her two dogs (black frame trimmed) |
   | `jay-hiking.jpg` | About, next to her health quote | waterfall hike |
2. **Booking calendar.** Create a calendar, e.g. "Free 20-minute call" (video, 20 minutes). Copy its booking link into `src/config.json` → `bookingCalendarUrl` and rebuild. Until then, the Book page shows a note pointing people to the message form.
3. **Message form.** Create a workflow with an **Inbound Webhook** trigger and paste its URL into `src/config.json` → `signupWebhook`, then rebuild. Map these fields:

   | Webhook field | Map to |
   |---|---|
   | `first_name`, `last_name`, `email` | the contact fields |
   | `message` | a note or custom field |
   | `consent` | a custom field |
   | `tags` | `website-enquiry` |

   Then notify Jay and send an auto-reply.
4. **Contact details.** Add `contactEmail` and, if she has one, `instagramUrl` to `src/config.json`. They appear in the footer once set.
5. **Pages.** Create the three pages using the paths and SEO text in `dist/_pages.csv`. Each page gets one full-width section with zero padding and a Custom JS/HTML element containing the whole `dist/<page>.html`.

All copy is a **draft for Jay to review**. Jay's facts come only from her Diet vs Disease bio. I didn't invent testimonials, statistics, prices or results.

## Resources page (`/resources`)
The resources are listed in `src/data/resources.json`. They're draft topics for Jay to confirm, and all are marked *coming soon*.
- **Coming soon:** "Notify me" opens an email field. The signup goes to the same HighLevel webhook with `source: resource-waitlist` and tags `resource-waitlist` + `resource-<slug>`.
- **When a resource is ready:**
  1. Upload the file to HighLevel Media.
  2. Change that item's `status` to `"available"` and run `node build.mjs`. The button becomes "Send me the download" (`source: resource-download`).
  3. In the workflow, email the file link for that tag.
  4. Send one email to everyone tagged `resource-<slug>` to tell the waitlist.
- **"Keep me posted"** at the bottom of the page signs people up for all future resources (`source: resources-updates`, tag `resource-updates`).
- **Workflow branches to add:** `resource-waitlist` (confirmation email), `resource-download` (email the file), `resources-updates` (welcome to the list).

## Questions for Jay (please confirm or correct)
1. **Title.** Her bio says "Gut Direct Therapist". The site uses "gut-brain therapist" and "gut-directed hypnotherapy", the standard terms. Is that right?
2. **Sessions online.** The site says sessions are by video, worldwide. Does she also see people in person in Brisbane? Are there any countries or states she can't work with?
3. **Free 20-minute call.** Is that the right length and offer?
4. **Hypnotherapy recordings** between sessions. Does she provide these?
5. **Reply time.** The message form promises a reply "within two business days". OK?
6. **Fees and rebates.** Not shown anywhere yet. Does she want prices on the site? Can clients claim private health insurance or other rebates?
7. **Diet vs Disease.** Is she happy to mention her role there on her own site?
8. **First-person "My path" copy on About.** It expands on her bio and needs her approval.
9. **Acknowledgement of Country.** The footer names the Turrbal and Yuggera peoples (Brisbane). Please confirm the wording she prefers.
10. **Personal details.** The About page uses her quote on health from the bio. The bio also mentions her kids and dog, which I left out. Include them?
11. **Headshot rights.** The Home headshot is Diet vs Disease's team photo. Can she use it on her own site, or does she have the original from the photographer? Also, are the two dogs hers? The bio mentions one dog.
12. **Brand name / domain.** "Jay Hayes · Gut-brain therapy" is a placeholder wordmark. Does she have a business name or logo?
13. **Privacy policy.** The site collects names and emails, so she needs a privacy policy page; Australian Privacy Principles apply to health providers. Send hers, or I can draft one for her to have reviewed.

## Possible next pages
A dedicated "Gut-directed hypnotherapy" explainer (good for SEO), Fees, Privacy policy, and a free lead magnet (e.g. a short guided relaxation audio) once Jay has one.

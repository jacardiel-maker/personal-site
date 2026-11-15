# The Paper Meadow – scrapbook e-Portfolio (sample)

A hand-coded e-Portfolio for GE ELECT 3: Living in the IT Era.
Plain HTML, CSS and JavaScript. No template, no frameworks.

## Files

```
index.html      all five pages (Home, Goals & Philosophy, Reflections, Best Works, Privacy & Ethics)
css/style.css   colors, fonts, layout (change the colors at the top in :root)
js/script.js    painted anime-style scenes, page switching, tabs, filter, pop-up, day/night, leaves & fireflies
images/         put your own photos here
```

## Group 5

1. Alcantara, Gerald
2. Bernal, Angelika E.
3. Brandes, Roshiene A.
4. De Leon, Jellian P.
5. Francisco, Cameron R.
6. Ibarrientos, Felicity L.
7. Mirasol, Kristine Diane B.
8. Sanchez, Camille C.
9. Tabarangao, Zyrus Jan M.
10. Triviño, Jhudiel Jayreen L.

## Photos

- `images/group.jpg`: the whole group (used on the Home hero polaroid and the Group 5 movie card)
- `images/member-01.jpg` to `images/member-10.jpg`: one per member, in the order above
  (portrait photos look best; they are shown at a 4:5 ratio)

Every photo slot shows a painted placeholder until its file is added.

## Reflections (each member writes 3)

Each member has one card in each tab of the Reflections page (30 cards in all). To fill yours:

1. Replace the whole `<p class="draft">...</p>` with `<p>your reflection</p>`.
2. Replace `<span class="todo">add date</span>` with the date you wrote it.
3. Replace the chip `<li class="todo-chip">...</li>` with one `<li>` per tool, and list the same
   tools in `data-tools="Tool 1, Tool 2"` on the `<article>`.

The "0 of 10 members" stamp on each tab counts only finished cards, which is what the rubric
formula uses: 15 x (number of reflections / total group members).

## Other things to replace

1. The synopsis and motto on the Group 5 card (marked SAMPLE)
2. Goals and philosophy (Goals & Philosophy page)
3. Best works: title, member, software, date, reason (Best Works page). The 8 works there now are samples.
4. Contact email and social links (footer)
5. "Published" date and "Website URL" (Privacy & Ethics page) after you publish
6. Have every member read the consent statement on the Privacy & Ethics page before you publish;
   it is signed with all ten names.

To add a reflection card, copy one `<article class="entry ...">` block.

## Where each rubric item lives

| Rubric item | Page |
|---|---|
| Student goals & philosophy | Goals & Philosophy |
| Daily communication reflection | Reflections → Daily Communication tab |
| Hobbies / talents reflection | Reflections → Hobbies & Talents tab |
| Professional development reflection | Reflections → Professional Development tab |
| Software used, date created, reason | Reflections entries + Best Works pop-ups |
| Statement of own discretion, data privacy | Privacy & Ethics |
| Footer: contact, copyright, social links | Every page |
| Bidirectional links | Header nav, footer nav, Previous / Next buttons |

## Page backgrounds (film stills)

Each page can show a scene from *Spirited Away* behind everything, with its own citation tag.

1. Open https://www.ghibli.jp/works/chihiro/#frame (the page says the images may be used
   freely within reasonable limits; read it yourself first).
2. Pick five stills and save them in `images/` as:
   `bg-home.jpg`, `bg-goals.jpg`, `bg-reflections.jpg`, `bg-works.jpg`, `bg-privacy.jpg`.
3. In index.html, find each `<p class="bg-credit">` and replace "add date" with the date you
   downloaded the image.

The site samples each still's colors to tint the page. A page whose file is missing shows the
original painted sea world instead. Note: browsers block that color sampling when you open
index.html straight from your computer (file://), so the tint only appears once the site is
published or served from a local server.

## Mood board (Inspiration section on Home)

1. Download scenes from the free images on the Studio Ghibli official website:
   https://www.ghibli.jp/info/013344/ (read the terms on that page first).
2. Save them in `images/` as `inspiration-1.jpg` to `inspiration-6.jpg`. Each frame shows a
   painted placeholder until its file is there.
3. In each caption in index.html, change the film title and the `alt` text to the film your
   image is from, and replace "add date" with the date you downloaded it.

Keep these images in the mood board only, never under Best Works: they are not your work.

## The painted scenes

A full-screen painted sea world sits behind every page, drawn live in a `<canvas id="world">`
by js/script.js. Each page shows it at a different time of day (`data-scene="tide"`, `dawn`, `twilight`, `moonlit`, `starry`). Change the
`data-scene` value on a `<div class="sky">` to swap a page's scene. Colors for each
time of day are in `PAL`, and what each scene contains (clouds, tree, cottage) is in
`LAYOUT`, both near the top of js/script.js.

## Preview locally

Open `index.html` in a browser. Internet is needed for the Google Fonts.

## Sample reflections (models only, do not copy)

These were the example reflections in the first draft of the site. Use them to see the length and the details that score well (which tools, when, and why), then write your own.

- **Daily Communication | tools: Messenger, Google Calendar | written 12 Sep 2026**  
  Most of our group work starts in a Messenger group chat. I learned that a long thread loses details fast, so I started pinning decisions and putting deadlines in a shared Google Calendar. Now nobody has to ask "kailan ulit?" three times a day. Technology did not make us talk more. It helped us talk on purpose.
- **Daily Communication | tools: Google Meet, Gmail | written 14 Sep 2026**  
  Before this course I treated email like a chore. Writing to our instructor taught me to use a clear subject line, a proper greeting, and one short point. For meetings we use Google Meet when we cannot be on campus. I listen better when my camera is on and my other tabs are closed. Tools help, but attention is still my job.
- **Daily Communication | tools: Viber, Messenger | written 15 Sep 2026**  
  My family is spread between Bicol and Manila, so Viber video calls are part of our Sunday. This course made me think about what I share in our family group chat. I stopped forwarding posts I had not checked and now look for the source first. It is a small habit, but it keeps our conversations about each other instead of rumors.
- **Daily Communication | tools: Discord, Google Docs | written 18 Sep 2026**  
  Our study group moved to Discord because channels keep topics apart: one for notes, one for questions, one for memes. Writing shared notes in Google Docs with comments showed me that clear writing is a form of respect. When I explain something well in text, my groupmates spend less time guessing and more time learning.
- **Hobbies & Talents | tools: Snapseed, Google Photos | written 2 Oct 2026**  
  I take photos of ordinary things around Nabua: tricycles at golden hour, rice fields after rain. Snapseed taught me that editing is about guiding the eye, not piling on filters. I back up every shot to Google Photos so a lost phone does not mean lost memories. Photography made me slower and more observant, and that helps in class too.
- **Hobbies & Talents | tools: Ibis Paint X, Canva | written 4 Oct 2026**  
  I paint on my phone with Ibis Paint X, mostly landscapes with big skies. Layers changed how I think: I can fix one part without ruining the rest. I also use Canva to turn my drawings into posters for our org. Sharing my art online made me braver, and it taught me to credit my references and never trace someone else's work.
- **Hobbies & Talents | tools: CapCut | written 6 Oct 2026**  
  I make short vlogs of campus life with CapCut. My first videos were long and slow. Learning cuts, captions, and pacing taught me to respect the viewer's time, and auto-captions made my videos easier to follow for people watching without sound. Editing also taught me patience: a one-minute video can take two hours to get right.
- **Hobbies & Talents | tools: BandLab, YouTube | written 8 Oct 2026**  
  I sing and play guitar, and BandLab lets me record separate layers on my phone without a studio. I learned basic mixing from YouTube tutorials. Posting covers online was scary at first, but kind comments from strangers pushed me to practice more. Music reminds me that technology can amplify talent, but it cannot replace practice.
- **Professional Development | tools: VS Code, GitHub | written 20 Oct 2026**  
  Building this website in VS Code was my first real project outside class exercises. I saved every version on GitHub, which rescued me twice when I broke the layout. I learned that developers do not memorize everything; they read documentation and test small changes. I want to keep building small sites to grow my portfolio before graduation.
- **Professional Development | tools: Microsoft Word, Grammarly | written 22 Oct 2026**  
  Writing my résumé in Microsoft Word showed me how much formatting matters: consistent headings, clear spacing, and one page. I used Grammarly to catch errors but learned to check each suggestion instead of accepting all of them. A clean document tells an employer I pay attention to detail before they even meet me.
- **Professional Development | tools: LinkedIn, Coursera | written 25 Oct 2026**  
  I made a LinkedIn profile this semester and started an online course on Coursera about digital marketing basics. An online profile works like a first handshake, so I removed old public posts that did not represent me well. Building a professional presence now means I will not be starting from zero when I apply for internships.
- **Professional Development | tools: Microsoft Excel, Google Forms | written 28 Oct 2026**  
  Running our group survey taught me practical data skills. I built the questionnaire in Google Forms, then cleaned and summarized the responses in Microsoft Excel with pivot tables and charts. Many jobs need someone who can turn messy data into a clear answer, and I want to be that person.

## Credits

The layout of the Group 5 section was inspired by a *Spirited Away* movie-card design by DearRev_ (shared on Pinterest). The design and code on this site are the group's own.
#   p e r s o n a l - s i t e  
 
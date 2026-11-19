# May Poe Khitt - Portfolio

My personal portfolio website for the Portfolio Development module (C390) at Republic Polytechnic.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: introduction, featured projects, skills |
| `about.html` | About: skills, education, experience, certifications |
| `projects.html` | Projects: all projects, with a Software / DevOps filter |
| `contact.html` | Contact: email, GitHub, LinkedIn and a message form |

## How it is built

- **HTML** for the content of each page
- **CSS** in `css/style.css`, shared by all pages. The colours and fonts are set once as variables at the top of the file.
- **JavaScript** in `js/main.js`, which opens the menu on phones, filters the project cards, and turns the contact form into an email
- Images and the resume are in `assets/`

There is no build step and no framework. Open `index.html` in a browser to view the site.

## Putting it online with GitHub Pages

1. Create a new public repository on GitHub, for example `portfolio`.
2. Upload everything inside this folder, so that `index.html` is at the top level of the repository.
3. In the repository, go to **Settings > Pages**.
4. Under **Branch**, choose `main` and `/ (root)`, then click **Save**.
5. After a minute or two the site is live at `https://<your-username>.github.io/portfolio/`.

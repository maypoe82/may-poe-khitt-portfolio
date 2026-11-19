/* =====================================================================
   May Poe Khitt - Portfolio
   One script shared by all four pages. Each part first checks that its
   elements exist on the current page, so the same file can be loaded
   everywhere without causing errors.

   Contents
   1. Loading screen
   2. Scroll reveal
   3. Counting numbers
   4. Typing effect
   5. Scroll progress bar and sticky header
   6. Back to top button
   7. Phone menu
   8. Project filter
   9. Project pop-up
   10. Contact form
   11. 3D tilt and pointer highlight
   12. Background parallax
   13. Moving between pages
   ===================================================================== */

// If the visitor has asked their device to reduce animation, we skip the
// moving parts. Movement can make some people feel unwell.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- 1. Loading screen ----------
// Counts from 0 to 100 while the page loads, then fades away. It only
// runs the first time someone arrives: once they are clicking around my
// site, making them watch the counter again on every page would feel
// slow, so from then on the page simply fades in (see section 13).
// sessionStorage is wrapped in try/catch because a browser set to block
// site data throws when it is read.
let alreadyVisited = false;

try {
  alreadyVisited = sessionStorage.getItem("mpk-visited") === "1";
  sessionStorage.setItem("mpk-visited", "1");
} catch (error) {
  alreadyVisited = false;
}

const loader = document.querySelector(".loader");

if (loader && alreadyVisited) {
  loader.remove();
  document.body.classList.remove("locked");
} else if (loader) {
  const countEl = loader.querySelector(".loader-count");
  const fillEl = loader.querySelector(".loader-fill");
  let count = 0;

  function finishLoading() {
    loader.classList.add("done");
    document.body.classList.remove("locked");
    // Remove it from the page once the fade has finished
    setTimeout(function () {
      loader.remove();
    }, 700);
  }

  if (reduceMotion) {
    finishLoading();
  } else {
    document.body.classList.add("locked");

    // Step the number up every 25 milliseconds
    const timer = setInterval(function () {
      count = count + Math.floor(Math.random() * 6) + 2;
      if (count >= 100) {
        count = 100;
        clearInterval(timer);
        setTimeout(finishLoading, 350);
      }
      // padStart puts a 0 in front of single digits, so 7 shows as 07
      countEl.textContent = String(count).padStart(3, "0");
      fillEl.style.width = count + "%";
    }, 25);

    // Safety net: never keep the page hidden for more than 4 seconds
    setTimeout(function () {
      clearInterval(timer);
      finishLoading();
    }, 4000);
  }
}

// ---------- 2. Scroll reveal ----------
// Anything marked data-reveal starts slightly lower down and see-through.
// IntersectionObserver tells us when an element scrolls into view, and we
// add the class "shown", which the CSS animates.
const revealItems = document.querySelectorAll("[data-reveal]");

if (revealItems.length > 0) {
  if (reduceMotion) {
    revealItems.forEach(function (item) {
      item.classList.add("shown");
    });
  } else {
    const revealWatcher = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("shown");
            // Each element only needs to appear once
            revealWatcher.unobserve(entry.target);
          }
        });
      },
      // Start the animation when the element is 12% of the way up the screen
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      revealWatcher.observe(item);
    });
  }
}

// ---------- 3. Counting numbers ----------
// The four statistics on the Home page count up from 0 when scrolled to.
const counters = document.querySelectorAll("[data-count]");

if (counters.length > 0) {
  function runCounter(el) {
    const target = Number(el.dataset.count);
    const duration = 1400; // milliseconds
    const start = performance.now();

    function step(now) {
      // progress goes from 0 at the start to 1 at the end
      let progress = (now - start) / duration;
      if (progress > 1) progress = 1;

      // Ease-out: fast at first, slowing down near the final number
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = String(value).padStart(2, "0");

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  if (reduceMotion) {
    counters.forEach(function (el) {
      el.textContent = String(el.dataset.count).padStart(2, "0");
    });
  } else {
    const countWatcher = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            countWatcher.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      el.textContent = "00";
      countWatcher.observe(el);
    });
  }
}

// ---------- 4. Typing effect ----------
// Types out each job title letter by letter, waits, deletes it, then
// moves on to the next one and repeats.
const typedEl = document.querySelector(".typed");

if (typedEl) {
  const words = JSON.parse(typedEl.dataset.words);
  let wordIndex = 0;
  let letterCount = 0;
  let deleting = false;

  if (reduceMotion) {
    typedEl.textContent = words[0];
  } else {
    function type() {
      const word = words[wordIndex];
      letterCount = letterCount + (deleting ? -1 : 1);
      typedEl.textContent = word.slice(0, letterCount);

      let wait = deleting ? 45 : 90;

      if (!deleting && letterCount === word.length) {
        // Whole word typed: pause so it can be read, then start deleting
        wait = 1600;
        deleting = true;
      } else if (deleting && letterCount === 0) {
        // Word deleted: move to the next one
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        wait = 300;
      }

      setTimeout(type, wait);
    }

    type();
  }
}

// ---------- 5. Scroll progress bar and sticky header ----------
const progressBar = document.querySelector(".progress");
const orbs = document.querySelector(".orbs");
const header = document.querySelector(".site-header");
const toTop = document.querySelector(".to-top");

function onScroll() {
  const scrolled = window.scrollY;
  // How far the page can scroll in total
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;

  if (progressBar) {
    const ratio = scrollable > 0 ? scrolled / scrollable : 0;
    progressBar.style.transform = "scaleX(" + ratio + ")";
  }

  if (header) {
    header.classList.toggle("scrolled", scrolled > 40);
  }

  if (toTop) {
    toTop.classList.toggle("show", scrolled > 500);
  }

  // Background parallax: the coloured blobs drift down more slowly than
  // the page itself, which makes them feel further away. (Section 12.)
  if (orbs && !reduceMotion) {
    orbs.style.setProperty("--oy", scrolled * 0.14 + "px");
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- 6. Back to top button ----------
if (toTop) {
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
}

// ---------- 7. Phone menu ----------
// On small screens the menu links are hidden and a "MENU" button is shown.
// Pressing the button adds or removes the "open" class, and the CSS shows
// the links when that class is present.
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    // Tells screen readers whether the menu is open or closed
    navToggle.setAttribute("aria-expanded", isOpen);
  });
}

// ---------- 8. Project filter (Projects page) ----------
// Every filter button has a data-filter value: "all", "software" or "devops".
// Every project card has a data-category value: "software" or "devops".
// When a button is pressed, cards that do not match are hidden, and the
// ones that stay replay a short fade-in so the change is easy to follow.
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card[data-category]");

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const chosen = button.dataset.filter;

    // Highlight only the button that was pressed
    filterButtons.forEach(function (other) {
      other.classList.remove("active");
      other.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    projectCards.forEach(function (card) {
      const matches = chosen === "all" || card.dataset.category === chosen;
      card.classList.toggle("hidden", !matches);

      if (matches && !reduceMotion) {
        // Removing and re-adding the class makes the animation play again
        card.classList.remove("refresh");
        void card.offsetWidth; // forces the browser to notice the change
        card.classList.add("refresh");
      }
    });
  });
});

// ---------- 9. Project pop-up (Projects page) ----------
// Each "Read more" button carries the project's full write-up in data
// attributes. Pressing it fills the pop-up and opens it.
const modal = document.querySelector("#project-modal");

if (modal) {
  const modalBox = modal.querySelector(".modal-box");
  const openButtons = document.querySelectorAll("[data-modal-open]");
  let lastButton = null; // so we can put the keyboard focus back afterwards

  function openModal(button) {
    lastButton = button;
    const card = button.closest(".project-card");

    modal.querySelector(".modal-type").textContent = card.dataset.type;
    modal.querySelector(".modal-title").textContent = card.dataset.title;
    modal.querySelector(".modal-summary").textContent = card.dataset.summary;
    modal.querySelector(".modal-tech").textContent = card.dataset.tech;

    // The feature and role lists are stored as text separated by "|"
    function fillList(selector, text) {
      const list = modal.querySelector(selector);
      list.innerHTML = "";
      text.split("|").forEach(function (item) {
        const li = document.createElement("li");
        li.textContent = item.trim();
        list.appendChild(li);
      });
    }

    fillList(".modal-features", card.dataset.features);
    fillList(".modal-role", card.dataset.role);

    // Links: show a button only when the project has that link
    const actions = modal.querySelector(".modal-actions");
    actions.innerHTML = "";
    const links = [
      ["github", "View on GitHub ↗", "btn"],
      ["live", "Live site ↗", "btn btn-outline"],
      ["extra", card.dataset.extraLabel, "btn btn-outline"],
    ];
    links.forEach(function (link) {
      const url = card.dataset[link[0]];
      if (!url) return;
      const a = document.createElement("a");
      a.className = link[2];
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = link[1];
      actions.appendChild(a);
    });

    modal.classList.add("open");
    document.body.classList.add("locked");
    modalBox.scrollTop = 0;
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("locked");
    if (lastButton) lastButton.focus();
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      openModal(button);
    });
  });

  modal.querySelector(".modal-close").addEventListener("click", closeModal);

  // Clicking the dark area outside the box also closes it
  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  // So does pressing the Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
}

// ---------- 10. Contact form (Contact page) ----------
// This site is hosted as plain files, so there is no server to receive
// the form. Instead, the form builds an email addressed to me and opens
// it in the visitor's own email app, ready for them to press Send.
const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    // Stop the browser from reloading the page
    event.preventDefault();

    const name = contactForm.elements["name"].value.trim();
    const email = contactForm.elements["email"].value.trim();
    const subject = contactForm.elements["subject"].value.trim();
    const message = contactForm.elements["message"].value.trim();
    const note = document.querySelector("#form-note");

    // All four boxes must be filled in
    if (!name || !email || !subject || !message) {
      note.textContent = "Please fill in all four boxes before sending.";
      return;
    }

    // Build the email text. encodeURIComponent makes spaces, line breaks
    // and symbols safe to put inside a link.
    const body = message + "\n\nFrom: " + name + "\nEmail: " + email;
    const mailLink =
      "mailto:maypoe827@gmail.com" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    window.location.href = mailLink;
    note.textContent = "Your email app should now open with the message ready to send.";
  });
}


// ---------- 11. 3D tilt and pointer highlight ----------
// Cards marked .tilt lean towards the mouse pointer. I work out where the
// pointer is over the card as a fraction (0 at the left edge, 1 at the
// right), turn that into two angles, and write them into CSS variables.
// The CSS does the actual turning, which keeps the maths here simple.
//
// It is switched off on phones and tablets, where there is no mouse to
// follow, and for anyone who has asked for less animation.
const tiltCards = document.querySelectorAll(".tilt");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (tiltCards.length > 0 && finePointer && !reduceMotion) {
  const MAX_TILT = 7; // degrees; more than this looks silly

  tiltCards.forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;

      // Left of centre tips one way, right of centre the other
      card.style.setProperty("--ry", ((x - 0.5) * 2 * MAX_TILT).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - y) * 2 * MAX_TILT).toFixed(2) + "deg");
      card.style.setProperty("--lift", "-6px");

      // The same position moves the soft highlight on the card
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    });

    // Put the card back flat when the pointer leaves it
    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--lift", "0px");
    });
  });
}

// The photo on the Home page leans towards the pointer wherever it is on
// the screen, not just when the pointer is over the photo itself.
const heroPhoto = document.querySelector(".hero-photo");

if (heroPhoto && finePointer && !reduceMotion) {
  window.addEventListener("pointermove", function (event) {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    heroPhoto.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
    heroPhoto.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
  });
}

// ---------- 13. Moving between pages ----------
// Normally a browser blanks the screen for a moment between two pages.
// To smooth that over, every page puts a dark sheet (.veil) on top of
// itself and fades it away as soon as it has arrived. When a link to
// another page of my own site is clicked, the same sheet fades back in
// first and the page only changes once the fade has finished, so the two
// pages cross-fade through the same colour instead of flashing.
if (!reduceMotion) {
  const veil = document.createElement("div");
  veil.className = "veil on";
  document.body.appendChild(veil);

  // Two frames of waiting, so the browser paints the sheet before it is
  // told to fade out. Without this the fade would be skipped.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      veil.classList.remove("on");
    });
  });

  document.addEventListener("click", function (event) {
    const link = event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0) return;

    // Leave anything that opens elsewhere, downloads, or belongs to
    // another website to behave exactly as it normally would.
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname.slice(-4).toLowerCase() === ".pdf") return;
    if (url.href === window.location.href) return;

    event.preventDefault();
    veil.classList.add("on");
    setTimeout(function () {
      window.location.href = url.href;
    }, 280);
  });

  // Coming back with the browser's back button can restore the page
  // exactly as it was left, sheet and all, so clear it again.
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) veil.classList.remove("on");
  });
}

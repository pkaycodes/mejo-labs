(() => {
  const header = document.querySelector(".site-header");
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const pageMain = document.querySelector("main");
  const pageFooter = document.querySelector(".site-footer");

  const setMenu = (open) => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    if (pageMain) pageMain.inert = open;
    if (pageFooter) pageFooter.inert = open;
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.querySelectorAll(".brand").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (menuToggle.getAttribute("aria-expanded") !== "true") return;
      setMenu(false);
      menuToggle.focus();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) setMenu(false);
    });
  }

  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    navSections.forEach((section) => navObserver.observe(section));
  }
})();

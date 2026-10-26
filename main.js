(() => {
  const header = document.querySelector(".site-header");
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const clockEls = document.querySelectorAll("[data-clock]");
  let timeFormatter = null;
  try {
    timeFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Accra",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    timeFormatter = null;
  }

  const updateClock = () => {
    if (!clockEls.length) return;
    let time;
    if (timeFormatter) {
      time = timeFormatter.format(new Date());
    } else {
      const now = new Date();
      time = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
    }
    clockEls.forEach((el) => {
      el.textContent = `${time} GMT`;
    });
  };
  updateClock();
  window.setInterval(updateClock, 30000);

  const tabs = Array.from(document.querySelectorAll(".code-tab"));
  const selectTab = (tab) => {
    tabs.forEach((item) => {
      const isSelected = item === tab;
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-selected", String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
      if (panel) panel.hidden = !isSelected;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      next.focus();
      selectTab(next);
    });
  });

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

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (menuToggle.getAttribute("aria-expanded") !== "true") return;
      setMenu(false);
      menuToggle.focus();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) setMenu(false);
    });

    if (window.innerWidth > 980) setMenu(false);
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

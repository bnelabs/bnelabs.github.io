const landscapeWidth = 1487;
const landscapeHeight = 1058;
const duration = 2200;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const river = "M 315 974 C 475 949 665 934 775 875 C 852 843 878 823 909 814 C 967 794 943 779 869 768 C 826 764 760 751 768 735 C 783 722 896 717 913 692 C 928 673 878 667 838 656 C 800 647 759 640 781 626 C 804 613 772 610 790 602";
const upperRiver = river + " C 841 579 896 572 942 546 C 971 532 975 524 955 518 C 929 509 952 501 964 493 C 939 483 898 474 905 454 C 911 439 938 437 928 426 C 898 415 953 398 957 386";

const projects = {
  hoz: {
    name: "HoZ", x: 1004, y: 173,
    summary: "I’m building HoZ to explore digital forensics. I study the traces software and devices leave behind to understand how a system worked and what changed.",
    route: upperRiver + " C 916 348 984 318 1000 275 S 979 207 1004 173",
  },
  beacon: {
    name: "Beacon", x: 651, y: 286, repository: "beacon",
    summary: "A liquidity model depends on the data it starts with.",
    route: river + " C 713 577 666 548 688 509 S 770 428 726 384 S 657 335 651 286",
  },
  tenerus: {
    name: "Tenerus", x: 1060, y: 425, repository: "tenerus",
    summary: "I test market scenarios on data the models haven’t seen.",
    route: river + " C 841 579 896 572 942 546 C 1005 521 1046 469 1060 425",
  },
  gpu: {
    name: "GPU recovery", x: 552, y: 552, repository: "gpu-xid79-recovery",
    summary: "One RTX 3090 setup recovered without a reboot.",
    route: river + " C 713 571 658 598 613 569 S 566 554 552 552",
  },
  wifi: {
    name: "M1 Wi-Fi research", x: 914, y: 655, repository: "bcm4378-research",
    summary: "I measured what the M1 MacBook Air’s Wi-Fi radio reports.",
    route: river + " C 873 603 884 649 914 655",
  },
  ozmos: {
    name: "OzMos", x: 938, y: 775, phoneX: "58%", repository: "OzMos",
    summary: "I wanted a way to explore the solar system in 3D.",
  },
  reshivo: {
    name: "Reshivo", x: 714, y: 841, phoneX: "38%", repository: "reshivo",
    summary: "I wanted to see how a product plan could adapt when the recycled material mix changed.",
  },
  tvStick: {
    name: "Linux on a TV stick", x: 530, y: 996, phoneX: "18%", repository: "rk3066-mt5931-linux",
    summary: "I wanted to see what it would take to run Linux on an old TV stick and get its Wi-Fi working.",
  },
  echolyra: {
    name: "Echolyra", repository: "echolyra",
    summary: "I’m exploring what echoes can reveal about a room. Mapping is still experimental.",
    route: river,
  },
};

const valley = document.querySelector("#valley");
const ridgeProjects = document.querySelector("#ridge-projects");
const riverProjects = document.querySelector("#river-projects");
const followRiver = document.querySelector("#follow-river");
const note = document.querySelector("#note-copy");
const noteTitle = note.querySelector("h2");
const noteSummary = note.querySelector(".summary");
const riverNote = note.querySelector(".river-note");
const sourceLink = document.querySelector("#project-source");
const route = document.querySelector(".route g");
const routeLine = route.querySelector("path");
const routeLight = route.querySelector("circle");
let activeFrame;
let noteAnimation;

for (const [id, project] of Object.entries(projects)) {
  if (project.x === undefined) continue;

  const marker = document.createElement("button");
  marker.type = "button";
  marker.dataset.project = id;
  marker.setAttribute("aria-controls", "project-note");
  marker.setAttribute("aria-pressed", String(id === "beacon"));
  marker.style.setProperty("--pin-x", (100 * project.x / landscapeWidth) + "%");
  marker.style.setProperty("--pin-y", (100 * project.y / landscapeHeight) + "%");

  if (project.phoneX) {
    marker.className = "pebble";
    marker.setAttribute("aria-label", project.name);
    marker.style.setProperty("--pin-phone-x", project.phoneX);
    marker.innerHTML = '<span class="pebble-mark" aria-hidden="true"></span><span class="pebble-name" aria-hidden="true"></span>';
    marker.querySelector(".pebble-name").textContent = project.name;
    riverProjects.append(marker);
  } else {
    marker.className = "pin";
    marker.innerHTML = '<span class="pin-dot" aria-hidden="true"></span><span class="pin-leader" aria-hidden="true"></span><span class="pin-name"></span>';
    marker.querySelector(".pin-name").textContent = project.name;
    ridgeProjects.append(marker);
  }
}

const projectButtons = valley.querySelectorAll("button[data-project]");

function playRoute(path) {
  cancelAnimationFrame(activeFrame);
  routeLine.setAttribute("d", path);
  const length = routeLine.getTotalLength();
  routeLine.style.strokeDasharray = String(length);
  const start = performance.now();

  function advance(now) {
    const elapsed = Math.max(0, now - start);
    const progress = reducedMotion.matches ? 1 : Math.min(elapsed / duration, 1);
    const point = routeLine.getPointAtLength(length * progress);
    routeLine.style.strokeDashoffset = String(length * (1 - progress));
    routeLight.setAttribute("cx", point.x);
    routeLight.setAttribute("cy", point.y);

    const opacity = reducedMotion.matches ? .62 : Math.min(1, Math.max(0, 1 - (elapsed - duration) / 840));
    route.setAttribute("opacity", String(opacity));
    if (opacity > 0 && !reducedMotion.matches) activeFrame = requestAnimationFrame(advance);
  }

  advance(start);
}

function openProject(button) {
  const project = projects[button.dataset.project];
  for (const marker of projectButtons) marker.setAttribute("aria-pressed", String(marker === button));
  noteTitle.textContent = project.name;
  noteSummary.textContent = project.summary;
  riverNote.hidden = !project.phoneX;
  sourceLink.hidden = !project.repository;
  if (project.repository) sourceLink.href = "https://github.com/bnelabs/" + project.repository;
  else sourceLink.removeAttribute("href");

  noteAnimation?.cancel();
  if (!reducedMotion.matches) {
    noteAnimation = note.animate([
      { opacity: 0, transform: "translateY(7px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: 280, easing: "ease-out" });
  }

  if (project.route) {
    playRoute(project.route);
  } else {
    cancelAnimationFrame(activeFrame);
    route.setAttribute("opacity", "0");
    if (!reducedMotion.matches) {
      button.firstElementChild.animate([
        { boxShadow: "0 0 0 0 #b6e6dbb0" },
        { boxShadow: "0 0 0 10px #b6e6db00" },
      ], { duration: 600, easing: "ease-out" });
    }
  }
}

for (const button of projectButtons) button.addEventListener("click", () => openProject(button));
followRiver.addEventListener("click", () => playRoute(upperRiver));
followRiver.hidden = false;
valley.querySelector(".research-note").hidden = false;

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const viewer = document.querySelector('#viewer');
const viewerTitle = document.querySelector('#viewer-title');
const viewerContent = document.querySelector('#viewer-content');
const viewerOpen = document.querySelector('#viewer-open');
const viewerClose = document.querySelector('#viewer-close');
const readingProgress = document.querySelector('.reading-progress');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let scrollFrame = 0;
function syncScrollState() {
  scrollFrame = 0;
  header?.classList.toggle('scrolled', window.scrollY > 12);
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  if (readingProgress) readingProgress.style.transform = `scaleX(${distance > 0 ? Math.min(window.scrollY / distance, 1) : 0})`;
}
function scheduleScrollSync() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScrollState);
}
syncScrollState();
window.addEventListener('scroll', scheduleScrollSync, { passive: true });
window.addEventListener('resize', scheduleScrollSync);

function navigateTo(target) {
  const top = target.id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY;
  const behavior = !reducedMotion.matches && Math.abs(top - window.scrollY) < window.innerHeight * 1.3 ? 'smooth' : 'instant';
  if (target.id === 'top') window.scrollTo({ top: 0, behavior });
  else target.scrollIntoView({ behavior });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', hash);
    navigateTo(target);
  });
});

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu.hidden = open;
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-scroll-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.scrollTarget);
    if (target) navigateTo(target);
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const resumeLinks = [...document.querySelectorAll('.resume-nav a')];
const resumeSections = resumeLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const resumeObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  resumeLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
  });
}, { rootMargin: '-25% 0px -58% 0px', threshold: [0, .15, .4] });

resumeSections.forEach((section) => resumeObserver.observe(section));

document.querySelectorAll('.experience-details').forEach((details) => {
  const summary = details.querySelector('summary');
  const syncLabel = () => {
    if (summary?.firstChild) summary.firstChild.textContent = details.open ? '收起工作详情 ' : '展开工作详情 ';
  };
  details.addEventListener('toggle', syncLabel);
  syncLabel();
});

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || entry.target.dataset.done) return;
    entry.target.dataset.done = 'true';
    const end = Number(entry.target.dataset.count || 0);
    const suffix = entry.target.dataset.suffix || '';
    const startedAt = performance.now();
    const duration = reducedMotion.matches ? 0 : 650;
    const tick = (now) => {
      const progress = duration ? Math.min((now - startedAt) / duration, 1) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      entry.target.textContent = `${Math.round(end * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach((element) => countObserver.observe(element));

const chartButtons = document.querySelectorAll('[data-chart]');
const chartImageButton = document.querySelector('.chart-image');
const chartImage = chartImageButton?.querySelector('img');
const chartCaption = document.querySelector('.chart-foot strong');

chartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    chartButtons.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    if (!chartImage || !chartImageButton) return;
    chartImage.src = button.dataset.chart;
    chartImage.alt = button.dataset.caption;
    chartImageButton.dataset.view = button.dataset.chart;
    chartImageButton.dataset.title = button.dataset.caption;
    chartCaption.textContent = button.dataset.caption;
  });
  button.addEventListener('keydown', (event) => {
    const current = [...chartButtons].indexOf(button);
    const next = event.key === 'ArrowRight' ? (current + 1) % chartButtons.length
      : event.key === 'ArrowLeft' ? (current - 1 + chartButtons.length) % chartButtons.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? chartButtons.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    chartButtons[next].focus();
    chartButtons[next].click();
  });
});

const rscLiveStage = document.querySelector('#rsc-live-stage');
const rscLiveCanvas = rscLiveStage?.querySelector('.rsc-live-canvas');
const rscLiveFrame = rscLiveCanvas?.querySelector('iframe');
const rscInteractToggle = rscLiveStage?.querySelector('.rsc-interact-toggle');
const rscInteractExit = rscLiveStage?.querySelector('.rsc-interact-exit');
let rscLiveWidth = 0;
let rscLiveCompact = null;

function setRscInteraction(active) {
  if (!rscLiveStage) return;
  rscLiveStage.classList.toggle('is-interacting', active);
  rscInteractToggle?.setAttribute('aria-pressed', String(active));
  if (rscInteractExit) rscInteractExit.hidden = !active;
  if (rscLiveFrame) rscLiveFrame.tabIndex = active ? 0 : -1;
}

function fitRscLiveSite() {
  if (!rscLiveStage || !rscLiveCanvas) return;
  const width = rscLiveStage.clientWidth;
  const compact = window.matchMedia('(max-width: 760px)').matches;
  if (width === rscLiveWidth && compact === rscLiveCompact) return;
  const modeChanged = compact !== rscLiveCompact;
  rscLiveWidth = width;
  rscLiveCompact = compact;
  if (compact) {
    rscLiveStage.style.height = '560px';
    rscLiveCanvas.style.transform = 'none';
    if (modeChanged) setRscInteraction(false);
  } else {
    const scale = width / 1280;
    rscLiveStage.style.height = `${Math.round(1020 * scale)}px`;
    rscLiveCanvas.style.transform = `scale(${scale})`;
    rscLiveStage.classList.remove('is-interacting');
    if (rscInteractExit) rscInteractExit.hidden = true;
    rscLiveFrame?.removeAttribute('tabindex');
  }
}

fitRscLiveSite();
if (rscLiveStage) new ResizeObserver(fitRscLiveSite).observe(rscLiveStage);
window.addEventListener('resize', fitRscLiveSite);
rscInteractToggle?.addEventListener('click', () => setRscInteraction(true));
rscInteractExit?.addEventListener('click', () => setRscInteraction(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && rscLiveStage?.classList.contains('is-interacting')) setRscInteraction(false);
});

const portfolioLinks = [...document.querySelectorAll('.portfolio-nav a')];
const portfolioChapters = portfolioLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const portfolioObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  const previous = portfolioLinks.find((link) => link.classList.contains('active'));
  portfolioLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${visible.target.id}`;
    link.classList.toggle('active', active);
    if (active && previous !== link && portfolioLinks[0]?.parentElement) {
      const nav = portfolioLinks[0].parentElement;
      const left = link.offsetLeft - nav.offsetLeft - (nav.clientWidth - link.clientWidth) / 2;
      nav.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  });
}, { rootMargin: '-27% 0px -56% 0px', threshold: [0, .1, .3] });

portfolioChapters.forEach((chapter) => portfolioObserver.observe(chapter));

function openViewer(trigger) {
  const source = trigger.dataset.view;
  const kind = trigger.dataset.kind || 'pdf';
  const title = trigger.dataset.title || '作品预览';
  if (!source) return;
  viewerTitle.textContent = title;
  viewerOpen.href = source;
  viewerContent.replaceChildren();

  let media;
  if (kind === 'image') {
    media = document.createElement('img');
    media.src = source;
    media.alt = title;
  } else if (kind === 'video') {
    media = document.createElement('div');
    media.className = 'video-player';
    const video = document.createElement('video');
    const parts = (trigger.dataset.parts || source).split(',').filter(Boolean);
    let activePart = 0;
    video.src = parts[activePart];
    video.poster = trigger.dataset.poster || '';
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    const partNav = document.createElement('nav');
    partNav.className = 'video-parts';
    partNav.setAttribute('aria-label', '视频分段');
    const selectPart = (index, autoplay = false) => {
      activePart = index;
      video.src = parts[index];
      viewerOpen.href = parts[index];
      [...partNav.children].forEach((button, buttonIndex) => button.classList.toggle('active', buttonIndex === index));
      if (autoplay) video.play().catch(() => {});
    };
    parts.forEach((part, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `第 ${index + 1} 段`;
      button.addEventListener('click', () => selectPart(index, true));
      partNav.append(button);
    });
    video.addEventListener('ended', () => {
      if (activePart < parts.length - 1) selectPart(activePart + 1, true);
    });
    media.append(partNav, video);
    selectPart(0);
  } else if (kind === 'site') {
    media = document.createElement('iframe');
    media.src = source;
    media.title = title;
    media.allow = 'clipboard-write';
  } else {
    media = document.createElement('iframe');
    media.src = `${source}#view=FitH`;
    media.title = title;
  }
  viewerContent.append(media);
  viewer.showModal();
  document.body.classList.add('modal-open');
}

document.querySelectorAll('[data-view]').forEach((trigger) => {
  trigger.addEventListener('click', () => openViewer(trigger));
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openViewer(trigger);
    }
  });
});

function closeViewer() {
  viewer.close();
  document.body.classList.remove('modal-open');
  viewerContent.replaceChildren();
}

viewerClose?.addEventListener('click', closeViewer);
viewer?.addEventListener('click', (event) => {
  if (event.target === viewer) closeViewer();
});
viewer?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeViewer();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) viewerContent.querySelector('video')?.pause();
});

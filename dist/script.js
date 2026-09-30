const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const viewer = document.querySelector('#viewer');
const viewerTitle = document.querySelector('#viewer-title');
const viewerContent = document.querySelector('#viewer-content');
const viewerOpen = document.querySelector('#viewer-open');
const viewerClose = document.querySelector('#viewer-close');

const setHeaderState = () => header.classList.toggle('scrolled', window.scrollY > 12);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

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
  button.addEventListener('click', () => document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' }));
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
    const duration = 900;
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
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
    chartImage.style.opacity = '0';
    window.setTimeout(() => {
      chartImage.src = button.dataset.chart;
      chartImage.alt = button.dataset.caption;
      chartImageButton.dataset.view = button.dataset.chart;
      chartImageButton.dataset.title = button.dataset.caption;
      chartCaption.textContent = button.dataset.caption;
      chartImage.style.opacity = '1';
    }, 160);
  });
});

const rscLiveStage = document.querySelector('#rsc-live-stage');
const rscLiveCanvas = rscLiveStage?.querySelector('.rsc-live-canvas');
let rscLiveWidth = 0;
let rscLiveCompact = null;

function fitRscLiveSite() {
  if (!rscLiveStage || !rscLiveCanvas) return;
  const width = rscLiveStage.clientWidth;
  const compact = window.matchMedia('(max-width: 760px)').matches;
  if (width === rscLiveWidth && compact === rscLiveCompact) return;
  rscLiveWidth = width;
  rscLiveCompact = compact;
  if (compact) {
    rscLiveStage.style.height = '620px';
    rscLiveCanvas.style.transform = 'none';
  } else {
    const scale = width / 1280;
    rscLiveStage.style.height = `${Math.round(1020 * scale)}px`;
    rscLiveCanvas.style.transform = `scale(${scale})`;
  }
}

fitRscLiveSite();
if (rscLiveStage) new ResizeObserver(fitRscLiveSite).observe(rscLiveStage);
window.addEventListener('resize', fitRscLiveSite);

const portfolioLinks = [...document.querySelectorAll('.portfolio-nav a')];
const portfolioChapters = portfolioLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const portfolioObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  portfolioLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${visible.target.id}`;
    link.classList.toggle('active', active);
    if (active && portfolioLinks[0]?.parentElement) {
      const nav = portfolioLinks[0].parentElement;
      const left = link.offsetLeft - nav.offsetLeft - (nav.clientWidth - link.clientWidth) / 2;
      nav.scrollTo({ left, behavior: 'smooth' });
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

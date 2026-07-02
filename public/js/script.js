document.addEventListener('DOMContentLoaded', () => {

  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');

if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    hamburger.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 992) {
    mainNav.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
});

  const typeEl = document.getElementById('typewriter');
  if (typeEl) {
    const words = ['Full Stack Developer', 'Web Designer', 'Problem Solver'];
    let wi = 0, ci = 0, deleting = false;
    const TYPE_SPEED = 90, DELETE_SPEED = 50, PAUSE = 1800;

    function type() {
      const word = words[wi];
      typeEl.textContent = deleting
        ? word.slice(0, --ci)
        : word.slice(0, ++ci);

      if (!deleting && ci === word.length) {
        setTimeout(() => { deleting = true; type(); }, PAUSE);
      } else if (deleting && ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        setTimeout(type, 300);
      } else {
        setTimeout(type, deleting ? DELETE_SPEED : TYPE_SPEED);
      }
    }
    type();
  }

  const ticker = document.getElementById('tickerTrack');
  if (ticker) {
    ticker.innerHTML += ticker.innerHTML;
    let pos = 0;
    const speed = 1.5;
    function animTicker() {
      pos -= speed;
      if (Math.abs(pos) >= ticker.scrollWidth / 2) pos = 0;
      ticker.style.transform = `translateX(${pos}px)`;
      requestAnimationFrame(animTicker);
    }
    animTicker();
  }

  const svcTrack = document.getElementById('servicesTrack');
  if (svcTrack) {
    svcTrack.innerHTML += svcTrack.innerHTML;
    let svcPos = 0;
    let paused = false;
    svcTrack.parentElement.addEventListener('mouseenter', () => paused = true);
    svcTrack.parentElement.addEventListener('mouseleave', () => paused = false);
    function animSvc() {
      if (!paused) {
        svcPos += 1;
        if (svcPos >= svcTrack.scrollWidth / 2) svcPos = 0;
        svcTrack.style.transform = `translateX(-${svcPos}px)`;
      }
      requestAnimationFrame(animSvc);
    }
    animSvc();
  }

  const slider = document.getElementById('projectSlider');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (slider && prevBtn && nextBtn) {
    let idx = 0;
    const cardW = 320 + 24;

    function getVisible() {
      const vw = slider.parentElement.clientWidth;
      return Math.floor(vw / cardW) || 1;
    }

    function slide(dir) {
      const total = slider.children.length;
      const visible = getVisible();
      idx = Math.max(0, Math.min(idx + dir, total - visible));
      slider.style.transform = `translateX(-${idx * cardW}px)`;
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx >= total - visible;
    }

    prevBtn.addEventListener('click', () => slide(-1));
    nextBtn.addEventListener('click', () => slide(1));
    slide(0);
  }

  const skillTabs = document.querySelectorAll('.skill-tab');
  skillTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      skillTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('active', p.id === `tab-${cat}`);
      });
      animateSkillBars();
    });
  });

  function animateSkillBars() {
    document.querySelectorAll('.tab-panel.active .skill-fill').forEach(bar => {
      const w = bar.dataset.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = w; }, 50);
    });
  }
  animateSkillBars();

  const tlTabs = document.querySelectorAll('.tl-tab');
  tlTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tlTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.dataset.tl;
      document.querySelectorAll('.tl-panel').forEach(p => {
        p.classList.toggle('active', p.id === `tl-${id}`);
      });
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
          // Animate skill bar if inside revealed card
          e.target.querySelectorAll('.skill-fill').forEach(bar => {
            bar.style.width = bar.dataset.width;
          });
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => obs.observe(el));
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const btnText = document.getElementById('btnText');
      const btnLoading = document.getElementById('btnLoading');
      const msgEl = document.getElementById('formMsg');

      btnText.classList.add('hidden');
      btnLoading.classList.remove('hidden');
      btn.disabled = true;
      msgEl.className = 'form-msg hidden';

      const data = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim(),
        website: document.getElementById('website').value,
      };

      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        msgEl.textContent = result.message;
        msgEl.className = `form-msg ${result.success ? 'success' : 'error'}`;

        if (result.success) contactForm.reset();
      } catch {
        msgEl.textContent = 'Network error. Please try again.';
        msgEl.className = 'form-msg error';
      } finally {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        btn.disabled = false;
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

});

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".port-card");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});
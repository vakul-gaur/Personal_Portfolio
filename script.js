const texts = ["Front-end Developer", "Website Developer"];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const speed = 100;
const wait = 1500;

document.addEventListener('DOMContentLoaded', function () {
  // Typewriter Effect
  function typeEffect() {
    const el = document.getElementById("typewriter");
    const currentText = texts[textIndex];

    if (!el) return;

    if (!isDeleting) {
      el.innerHTML = currentText.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(typeEffect, wait);
      } else {
        setTimeout(typeEffect, speed);
      }
    } else {
      el.innerHTML = currentText.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }
      setTimeout(typeEffect, speed);
    }
  }

  typeEffect();

  // Navigation Toggle
  const nav = document.getElementById('mainNav');
  const menuToggle = document.querySelector('.menu-toggle');

  if (nav && menuToggle) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }

  // Horizontal Card Slider
  const slider = document.getElementById("cardSlider");
  const leftBtn = document.querySelector(".nav.left");
  const rightBtn = document.querySelector(".nav.right");

  let scrollX = 0;
  const cardWidth = 470;

  if (slider && leftBtn && rightBtn) {
    rightBtn.addEventListener("click", () => {
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      scrollX = Math.min(scrollX + cardWidth, maxScroll);
      slider.style.transform = `translateX(-${scrollX}px)`;
    });

    leftBtn.addEventListener("click", () => {
      scrollX = Math.max(scrollX - cardWidth, 0);
      slider.style.transform = `translateX(-${scrollX}px)`;
    });
  }

  // Tab Switcher
  window.switchTab = function (tabId) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab-button[onclick*="${tabId}"]`)?.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
  };

  // Auto-Scrolling Services Section
  const container = document.getElementById("servicesContainer");
  if (window.innerWidth > 992 && container) {
    container.innerHTML += container.innerHTML;
    let scrollAmount = 0;

    function animate() {
      scrollAmount += 2;
      if (scrollAmount >= container.scrollWidth / 2) {
        scrollAmount = 0;
      }
      container.style.transform = `translateX(-${scrollAmount}px)`;
      requestAnimationFrame(animate);
    }

    animate();
  }
});

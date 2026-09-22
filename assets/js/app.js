/**
 * JAENUDIN SUWANDI — INTERACTIVE RESUME & PORTFOLIO
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Navigation Menu Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
            });
        });
    }

    // 2. Active Scroll Spy
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const onScroll = () => {
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // 3. Toast Notification System
    const toastMsg = document.getElementById('toastMsg');
    const toastText = document.getElementById('toastText');
    let toastTimer = null;

    const showToast = (message) => {
        if (!toastMsg) return;
        toastText.textContent = message;
        toastMsg.classList.add('show');

        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastMsg.classList.remove('show');
        }, 3200);
    };

    // Copy Email to Clipboard
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const emailText = document.getElementById('emailText');

    if (copyEmailBtn && emailText) {
        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(emailText.textContent.trim())
                .then(() => {
                    showToast('Email copied to clipboard: jaenudin.suwandi17@gmail.com');
                })
                .catch(() => {
                    showToast('Email: jaenudin.suwandi17@gmail.com');
                });
        });
    }

    // 4. Modal Management
    const cvModal = document.getElementById('cvModal');
    const openCvModalBtn = document.getElementById('openCvModalBtn');
    const heroCvBtn = document.getElementById('heroCvBtn');
    const closeCvModalBtn = document.getElementById('closeCvModalBtn');

    const openCV = () => {
        if (cvModal) {
            cvModal.classList.add('active');
            cvModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeCV = () => {
        if (cvModal) {
            cvModal.classList.remove('active');
            cvModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };

    if (openCvModalBtn) openCvModalBtn.addEventListener('click', openCV);
    if (heroCvBtn) heroCvBtn.addEventListener('click', openCV);
    if (closeCvModalBtn) closeCvModalBtn.addEventListener('click', closeCV);

    if (cvModal) {
        cvModal.addEventListener('click', (e) => {
            if (e.target === cvModal) closeCV();
        });
    }

});
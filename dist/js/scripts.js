/*- modal -*/
document.addEventListener('DOMContentLoaded', () => {
    let isLocked = false;
    let scrollY = 0;

    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    function lockScroll() {
        if (isLocked) return;
        scrollY = window.pageYOffset;

        const scrollbarWidth = getScrollbarWidth();
        const html = document.documentElement;

        html.classList.add('modal-opened');
        html.style.top = `-${scrollY}px`;

        if (scrollbarWidth > 0) {
            html.style.marginRight = `${scrollbarWidth}px`;
        }

        isLocked = true;
    }

    function unlockScroll() {
        if (!isLocked) return;

        const html = document.documentElement;

        html.classList.remove('modal-opened');

        const scrollToY = scrollY;
        
        html.style.top = '';
        html.style.position = '';
        html.style.width = '';

        window.scrollTo(0, scrollToY);

        html.style.marginRight = '';
        isLocked = false;
    }

    function updateScrollLock() {
        const anyOpen = document.querySelectorAll('.modal.show').length > 0;
        if (anyOpen) {
            lockScroll();
        } else {
            unlockScroll();
        }
    }

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('show');
        updateScrollLock();
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        } else {
            document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
        }
        updateScrollLock();
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal]');
        if (!trigger) return;
        e.preventDefault();

        const selector = trigger.getAttribute('data-modal');
        const modal = document.querySelector(selector);
        openModal(modal);
    });

    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.modal__close');
        if (!closeBtn) return;
        closeModal(closeBtn.closest('.modal'));
    });

    document.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (!modal) return;
        if (!e.target.closest('.modal__content')) {
            closeModal(modal);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    window.addEventListener('resize', () => {
        if (isLocked) {
            const scrollbarWidth = getScrollbarWidth();
            document.documentElement.style.marginRight =
                scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
        }
    });
});

/*- vertical-scroll -*/
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".vertical-scroll").forEach(initCustomScroll);
});

function initCustomScroll(wrapper) {
    const content = wrapper.querySelector(".vertical-scroll__content");
    const line = wrapper.querySelector(".vertical-scroll__line");
    const drag = wrapper.querySelector(".vertical-scroll__drag");

    function updateScrollbar() {
        const visible = content.clientHeight;
        const total = content.scrollHeight;

        if (total <= visible) {
            wrapper.classList.remove("show");
            line.style.display = "none";
            return;
        }

        wrapper.classList.add("show");
        line.style.display = "block";

        const lineH = line.clientHeight;
        const dragH = Math.max((visible / total) * lineH, 30);
        drag.style.height = dragH + "px";

        const maxTop = lineH - dragH;
        const dragTop = (content.scrollTop / (total - visible)) * maxTop || 0;
        drag.style.top = dragTop + "px";
    }

    content.addEventListener("scroll", updateScrollbar, { passive: true });
    window.addEventListener("resize", updateScrollbar);

    if (window.ResizeObserver) {
        const ro = new ResizeObserver(updateScrollbar);
        ro.observe(content);
    }

    let isDragging = false;
    let startY = 0;
    let startTop = 0;

    drag.addEventListener("pointerdown", e => {
        e.preventDefault();
        isDragging = true;
        startY = e.clientY;
        startTop = drag.offsetTop;
        drag.setPointerCapture?.(e.pointerId);
        document.body.style.userSelect = "none";
    });

    document.addEventListener("pointermove", e => {
        if (!isDragging) return;
        const delta = e.clientY - startY;
        const lineH = line.clientHeight;
        const dragH = drag.clientHeight;
        const maxTop = lineH - dragH;
        let newTop = Math.min(Math.max(0, startTop + delta), maxTop);
        drag.style.top = newTop + "px";
        const ratio = maxTop === 0 ? 0 : newTop / maxTop;
        content.scrollTop = ratio * (content.scrollHeight - content.clientHeight);
    });

    document.addEventListener("pointerup", e => {
        if (!isDragging) return;
        isDragging = false;
        drag.releasePointerCapture?.(e.pointerId);
        document.body.style.userSelect = "";
    });

    updateScrollbar();
}

/*- mobile menu -*/
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu-btn");
    const header = document.querySelector(".header");
    const headerCol = document.querySelector(".header__col");

    if (menuBtn && header && headerCol) {
        menuBtn.addEventListener("click", () => {
            const overlay = document.querySelector(".menu-overlay");

            const isOpen = menuBtn.classList.toggle("open");
            header.classList.toggle("changed", isOpen);
            headerCol.classList.toggle("show", isOpen);

            if (isOpen && !overlay) {
                const menuOverlay = document.createElement("div");
                menuOverlay.className = "menu-overlay";
                header.insertAdjacentElement("afterend", menuOverlay);

                menuOverlay.addEventListener("click", () => {
                    menuBtn.classList.remove("open");
                    header.classList.remove("changed");
                    headerCol.classList.remove("show");
                    menuOverlay.remove();
                });
            } else if (!isOpen && overlay) {
                overlay.remove();
            }
        });
    }
});

/*- steps-slider -*/
document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelector(".steps");
    if (!steps) return;

    let swiperInstance = null;
    const originalHTML = steps.innerHTML;

    function enableSwiper() {
        if (steps.classList.contains("swiper-initialized")) return;

        const stepItems = steps.querySelectorAll(".step");
        steps.classList.add("swiper");
        steps.innerHTML = `
        <div class="swiper-wrapper">
        ${Array.from(stepItems).map(step => `
          <div class="swiper-slide">${step.outerHTML}</div>
        `).join("")}
        </div>
        <div class="swiper-nav">
            <div class="swiper-button-prev">
                <span>loren ipsum</span>
            </div>
            <div class="swiper-button-next">
                <span>loren ipsum</span>
            </div>
        </div>
        `;

        /* swiper */
        swiperInstance = new Swiper(".steps", {
            slidesPerView: 2,
            spaceBetween: 20,
            loop: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
            0: {
                slidesPerView: 1,
                spaceBetween: 30,
                },
            480: {
                slidesPerView: 2,
                spaceBetween: 20,
                },
            },
        });
    }

    function disableSwiper() {
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
        steps.classList.remove("swiper");
        steps.innerHTML = originalHTML;
    }

    const mq = window.matchMedia("(max-width: 767px)");

    function handleResize(e) {
        if (e.matches) {
        enableSwiper();
    } else {
        disableSwiper();
        }
    }

    handleResize(mq);
    mq.addEventListener("change", handleResize);
});

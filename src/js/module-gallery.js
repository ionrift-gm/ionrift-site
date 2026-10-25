/* Module page screenshot gallery. Progressive enhancement: without this
   script the track is a plain horizontally scrollable row. */
(function () {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initGallery(root) {
        var track = root.querySelector(".module-gallery-track");
        var slides = track ? track.querySelectorAll(".module-gallery-slide") : [];
        if (!track || slides.length < 2) return;

        var prev = root.querySelector("[data-gallery-prev]");
        var next = root.querySelector("[data-gallery-next]");
        var nav = root.querySelector("[data-gallery-nav]");
        var dots = root.querySelectorAll("[data-gallery-dot]");
        var counter = root.querySelector("[data-gallery-counter]");
        var total = slides.length;
        var current = -1;

        function indexFromScroll() {
            var w = track.clientWidth || 1;
            return Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / w)));
        }

        function update() {
            var i = indexFromScroll();
            if (i === current) return;
            current = i;
            prev.disabled = i === 0;
            next.disabled = i === total - 1;
            for (var d = 0; d < dots.length; d++) {
                if (d === i) dots[d].setAttribute("aria-current", "true");
                else dots[d].removeAttribute("aria-current");
            }
            if (counter) counter.textContent = (i + 1) + " / " + total;
            for (var s = 0; s < slides.length; s++) {
                slides[s].setAttribute("aria-hidden", s === i ? "false" : "true");
            }
        }

        function goTo(i) {
            i = Math.max(0, Math.min(total - 1, i));
            track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
        }

        prev.addEventListener("click", function () { goTo(indexFromScroll() - 1); });
        next.addEventListener("click", function () { goTo(indexFromScroll() + 1); });
        for (var d = 0; d < dots.length; d++) {
            dots[d].addEventListener("click", function (e) {
                goTo(parseInt(e.currentTarget.getAttribute("data-gallery-dot"), 10));
            });
        }

        root.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft") { e.preventDefault(); goTo(indexFromScroll() - 1); }
            else if (e.key === "ArrowRight") { e.preventDefault(); goTo(indexFromScroll() + 1); }
            else if (e.key === "Home") { e.preventDefault(); goTo(0); }
            else if (e.key === "End") { e.preventDefault(); goTo(total - 1); }
        });

        var ticking = false;
        track.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () { ticking = false; update(); });
        }, { passive: true });
        window.addEventListener("resize", function () { current = -1; update(); });

        prev.hidden = false;
        next.hidden = false;
        if (nav) nav.hidden = false;
        root.classList.add("is-enhanced");
        update();
    }

    var galleries = document.querySelectorAll("[data-gallery]");
    for (var g = 0; g < galleries.length; g++) initGallery(galleries[g]);
})();

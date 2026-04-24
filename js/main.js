

// Sticky dot nav


var dots = document.querySelectorAll('.dot-nav .dot');


var dotMap = {};
dots.forEach(function(dot) {
    var id = dot.getAttribute('href').replace('#', '');
    dotMap[id] = dot;
});


var sectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {

            dots.forEach(function(d) { d.classList.remove('active'); });

            if (dotMap[entry.target.id]) {
                dotMap[entry.target.id].classList.add('active');
            }
        }
    });
}, { threshold: 0.4 });


document.querySelectorAll('[id]').forEach(function(el) {
    sectionObserver.observe(el);
});

// footer year
var yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================================
// main.js — Music DNA Version 1: Slide-Up Modal
// ============================================================
// Handles:
//   1. Scroll progress bar
//   2. Dot nav active state (IntersectionObserver)
//   3. Spotify slide-up modal (triggered by .play-btn buttons)
//   4. Footer year
// ============================================================


// ============================================================
// 2. DOT NAV — ACTIVE STATE
// Acknowledgement: IntersectionObserver approach from CSS-Tricks:
// https://css-tricks.com/sticky-smooth-active-nav/
// ============================================================

// explanation: gathers all dot links in the right-side nav
var dots = document.querySelectorAll('.dot-nav .dot');

// explanation: maps each section id to its dot element so
// we can find the right dot quickly when a section comes into view
var dotMap = {};
dots.forEach(function(dot) {
    var id = dot.getAttribute('href').replace('#', '');
    dotMap[id] = dot;
});

// explanation: IntersectionObserver fires when a section
// enters the viewport; we then mark the matching dot active
var sectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            // explanation: clear the active class from all dots
            dots.forEach(function(d) { d.classList.remove('active'); });
            // explanation: add active to the dot that matches
            // the section now visible
            if (dotMap[entry.target.id]) {
                dotMap[entry.target.id].classList.add('active');
            }
        }
    });
}, { threshold: 0.4 });

// explanation: observe every element that has an id
document.querySelectorAll('[id]').forEach(function(el) {
    sectionObserver.observe(el);
});


// ============================================================
// 3. SPOTIFY SLIDE-UP MODAL
// Acknowledgement: Spotify embed iframe format from:
// https://developer.spotify.com/documentation/embeds
// Modal slide-up pattern from:
// https://css-tricks.com/considerations-styling-modal/
//
// HOW THE MODAL WORKS:
//   - Clicking a .play-btn inside a .hit row calls openPlayer().
//   - openPlayer() reads data-track-id from the .hit element,
//     looks it up in window.SPOTIFY_TRACKS (spotify-config.js),
//     builds a Spotify embed iframe, and injects it into
//     #spotifyEmbedWrap.
//   - Adding class "open" to #spotifyModal and #modalBackdrop
//     triggers the CSS slide-up and fade-in transitions.
//   - closePlayer() removes "open" and clears the iframe.
// ============================================================

// explanation: cache all modal-related elements once at startup
var modal       = document.getElementById('spotifyModal');
var backdrop    = document.getElementById('modalBackdrop');
var embedWrap   = document.getElementById('spotifyEmbedWrap');
var setupNote   = document.getElementById('spotifySetupNote');
var trackLabel  = document.getElementById('modalTrackName');
var closeBtn    = document.getElementById('modalClose');

// explanation: keeps track of which .hit row is currently
// highlighted so we can un-highlight it on close
var activeHit = null;

// explanation: looks up a placeholder key like
// "SPOTIFY_TRACK_ID_MUNDIAN" in the config object and returns
// the real Spotify track ID string, or "" if not set
function resolveTrackId(key) {
    if (!key) return '';
    var config = window.SPOTIFY_TRACKS || {};
    // explanation: if the key exists in config, return its value
    if (config.hasOwnProperty(key)) return config[key] || '';
    // explanation: otherwise assume it is already a raw ID
    return key;
}

// explanation: opens the modal for the given .hit list item
function openPlayer(hitEl) {
    var key     = hitEl.dataset.trackId   || '';
    var name    = hitEl.dataset.trackName || 'Unknown Track';
    var trackId = resolveTrackId(key);

    // explanation: update the "Now Playing" track name
    trackLabel.textContent = name;

    // explanation: remove playing highlight from previous hit
    if (activeHit) activeHit.classList.remove('playing');
    activeHit = hitEl;
    hitEl.classList.add('playing');

    if (trackId) {
        // explanation: build and inject the Spotify embed iframe.
        // The src uses the Spotify embed URL format:
        // https://open.spotify.com/embed/track/TRACK_ID?theme=0
        // theme=0 forces the dark player skin.
        // Ref: https://developer.spotify.com/documentation/embeds
        embedWrap.innerHTML = '<iframe'
            + ' src="https://open.spotify.com/embed/track/' + trackId + '?utm_source=generator&theme=0"'
            + ' allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"'
            + ' loading="lazy">'
            + '</iframe>';
        // explanation: show the embed, hide the setup note
        embedWrap.style.display = 'block';
        setupNote.style.display = 'none';
    } else {
        // explanation: no track ID set — clear any old iframe
        // and show the setup instructions
        embedWrap.innerHTML = '';
        embedWrap.style.display = 'none';
        setupNote.style.display = 'block';
    }

    // explanation: adding "open" triggers the CSS slide-up
    // on the modal and the fade-in on the backdrop
    modal.classList.add('open');
    backdrop.classList.add('open');
    // explanation: stop the page scrolling behind the modal
    document.body.style.overflow = 'hidden';
}

// explanation: closes the modal and clears the player
function closePlayer() {
    // explanation: removing "open" triggers the CSS slide-down
    modal.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';

    // explanation: remove the playing highlight from the hit row
    if (activeHit) activeHit.classList.remove('playing');
    activeHit = null;

    // explanation: wait for the slide-down animation (400ms)
    // before clearing the iframe so audio stops cleanly
    setTimeout(function() {
        embedWrap.innerHTML = '';
        embedWrap.style.display = 'none';
    }, 400);
}

// explanation: wire up every .play-btn inside a .hit row
document.querySelectorAll('.play-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        // explanation: prevent the click from also firing the
        // parent .hit row's click handler below
        e.stopPropagation();
        var hitEl = btn.closest('.hit');
        if (!hitEl) return;
        // explanation: clicking an already-playing track closes
        // the modal (toggle behaviour)
        if (hitEl === activeHit && modal.classList.contains('open')) {
            closePlayer();
        } else {
            openPlayer(hitEl);
        }
    });
});

// explanation: clicking anywhere on a hit row also opens the
// player, not just the small play button
document.querySelectorAll('.hit').forEach(function(hitEl) {
    hitEl.addEventListener('click', function(e) {
        // explanation: if the click came from the .play-btn,
        // its own handler already dealt with it
        if (e.target.closest('.play-btn')) return;
        if (hitEl === activeHit && modal.classList.contains('open')) {
            closePlayer();
        } else {
            openPlayer(hitEl);
        }
    });
});

// explanation: close button inside the modal
closeBtn.addEventListener('click', closePlayer);
// explanation: clicking the dark backdrop also closes the modal
backdrop.addEventListener('click', closePlayer);
// explanation: Escape key closes the modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePlayer();
});


// ============================================================
// 4. FOOTER YEAR
// ============================================================

// explanation: sets the copyright year dynamically
var yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Scroll stack effect powered by GSAP + ScrollTrigger.
//
// Panels live in normal document flow (no negative margins, no
// position:sticky — that's what caused the earlier full-width bug).
// Instead, each panel after the first gets pulled upward by GSAP as it
// scrolls into view, so it visually rides up and covers a chunk of the
// panel before it. The pull is expressed in a fixed viewport-height unit
// (not a percentage of the panel's own height), so the overlap accumulates
// consistently across any number of panels, not just the first pair.

gsap.registerPlugin(ScrollTrigger);

const OVERLAP_VH = 35; // how much of the previous panel gets covered

const panels = gsap.utils.toArray('.panel');

// Panels are shifted upward via transform (not real layout), so the
// document's flow height never shrinks to match. A negative margin only
// pulls the footer up — main's own 400vh box still sets the scroll height,
// leaving a blank screen below the footer. Size main to the visual height
// of the stack instead; overflow:clip (style.css) keeps the untransformed
// panel boxes from stretching the page back out.
const totalOverlap = (panels.length - 1) * OVERLAP_VH;
document.querySelector('main').style.height = `${panels.length * 100 - totalOverlap}vh`;

panels.forEach((panel, i) => {
  const img = panel.querySelector('[data-parallax]');

  // photo drifts slower than the scroll — sells the "this panel is slower" read
  if (img) {
    gsap.fromTo(
      img,
      { yPercent: -12 },
      {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  }

  // Panel rides up over the one before it as it scrolls in. The ramp has
  // to span from the very start of the stack (panel 1 arriving) all the
  // way to THIS panel's own arrival — not just this panel's own V-tall
  // window — otherwise panel 2 finishes its ride (and freezes) before
  // panel 3's window even begins, opening a white gap between them.
  // Stretching every panel's ramp back to the same start point keeps the
  // math (and the touching edges) consistent no matter how many panels
  // are stacked.
  //
  // The ramp ends when the panel's SHIFTED top reaches the viewport top,
  // i.e. after i * (100 - OVERLAP_VH) vh of scroll — not at its original
  // layout position, which it has already passed by i * OVERLAP_VH.
  if (i > 0) {
    gsap.fromTo(
      panel,
      { y: 0 },
      {
        y: () => -i * window.innerHeight * OVERLAP_VH / 100,
        ease: 'none',
        scrollTrigger: {
          trigger: panels[0],
          start: 'top top',
          end: () => `+=${i * window.innerHeight * (1 - OVERLAP_VH / 100)}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  }

  // darken THIS panel while the NEXT panel rides up and covers it
  const nextPanel = panels[i + 1];
  const overlay = panel.querySelector('.panel-overlay');

  if (nextPanel && overlay) {
    gsap.to(overlay, {
      opacity: 0.5,
      ease: 'none',
      scrollTrigger: {
        trigger: nextPanel,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      },
    });
  }
});

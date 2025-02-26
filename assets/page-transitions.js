document.addEventListener('DOMContentLoaded', function () {
  const navTrigger = document.querySelector('input#nav-trigger');
  const body = document.body;
  const pageContent = document.querySelector('.page-content');
  const gradientContainer = document.querySelector('.gradient-container');

  // --- Mobile navigation functionality ---
  if (navTrigger) {
    navTrigger.addEventListener('change', function () {
      if (this.checked) {
        body.classList.add('nav-open');
      } else {
        body.classList.remove('nav-open');
      }
    });

    document.addEventListener('click', function (e) {
      const navMenu = document.querySelector('.site-nav');
      const isClickInside = navMenu.contains(e.target) || navTrigger.contains(e.target);
      if (!isClickInside && body.classList.contains('nav-open')) {
        navTrigger.checked = false;
        body.classList.remove('nav-open');
      }
    });
  }

  // --- Page transition functionality ---

  // If we are transitioning from another page, the flag will be set.
  const transitioning = sessionStorage.getItem('transitioning');

  // On load, fade in the content.
  if (pageContent) {
    pageContent.classList.add('fade-in');
  }

  // For homepage: if transitioning, start with gradient collapsed then animate it open.
  if (gradientContainer && gradientContainer.classList.contains('show-gradient')) {
    if (transitioning) {
      // Remove the class so it starts collapsed.
      gradientContainer.classList.remove('show-gradient');
      // Force a reflow to register the change.
      void gradientContainer.offsetWidth;
      // Then add it back to animate the height change.
      setTimeout(() => {
        gradientContainer.classList.add('show-gradient');
      }, 10);
    }
  }
  // Clear the transition flag
  sessionStorage.removeItem('transitioning');

  // Intercept page-link clicks for transitions.
  document.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetUrl = this.href;
      // Set a flag so the next page knows to run its entrance animation.
      sessionStorage.setItem('transitioning', 'true');

      // Animate the gradient (if present) to slide up.
      if (gradientContainer) {
        gradientContainer.classList.remove('show-gradient');
        gradientContainer.classList.add('hide-gradient');
      }
      // Fade out the page content.
      if (pageContent) {
        pageContent.classList.remove('fade-in');
        pageContent.classList.add('fade-out');
      }

      // Wait until the animation completes before navigating.
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500); // Duration should match your CSS transition
    });
  });
});
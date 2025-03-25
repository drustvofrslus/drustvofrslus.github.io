document.addEventListener('DOMContentLoaded', function() {
    const navTrigger = document.getElementById('nav-trigger');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    // Close nav when clicking on overlay
    if (menuOverlay) {
      menuOverlay.addEventListener('click', function() {
        navTrigger.checked = false;
      });
    }
  });
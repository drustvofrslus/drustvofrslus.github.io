document.addEventListener('DOMContentLoaded', function () {
    const navTrigger = document.querySelector('input#nav-trigger');
    const body = document.body;
    const pageContent = document.querySelector('.page-content');
    const gradientContainer = document.querySelector('.gradient-container');
    const isHomePage = document.querySelector('.gradient-container.show-gradient') !== null;
  
    // Keep your original mobile navigation code
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
  
    // On page load, fade in the content
    if (pageContent) {
      pageContent.classList.add('fade-in');
    }
  
    // Handle clicks on navigation links and site title
    const links = document.querySelectorAll('.page-link, .site-title');
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetUrl = this.href;
        const isLinkToHome = targetUrl.endsWith('/') || targetUrl.includes('index.html');
        
        // First fade out the content
        if (pageContent) {
          pageContent.classList.remove('fade-in');
          pageContent.classList.add('fade-out');
        }
        
        // If on homepage (going to another page)
        if (isHomePage) {
          // Wait for content to fade out, then animate gradient
          setTimeout(function() {
            if (gradientContainer) {
              gradientContainer.classList.remove('show-gradient');
              gradientContainer.classList.add('animating');
              
              // Navigate after gradient animation
              setTimeout(function() {
                window.location.href = targetUrl;
              }, 500);
            }
          }, 500);
        } 
        // If on another page going to homepage
        else if (isLinkToHome) {
          // Just wait for content fade, then navigate
          // The homepage will handle the gradient animation when it loads
          setTimeout(function() {
            window.location.href = targetUrl;
          }, 500);
        }
        // If going between non-homepage pages
        else {
          // Just fade out and navigate
          setTimeout(function() {
            window.location.href = targetUrl;
          }, 500);
        }
      });
    });
    
    // For homepage, if it just loaded, animate the gradient in
    if (isHomePage === 1) {
      gradientContainer.classList.remove('show-gradient');
      // Force reflow
      void gradientContainer.offsetWidth;
      // Animate gradient down
      setTimeout(function() {
        gradientContainer.classList.add('show-gradient');
        gradientContainer.classList.add('animating');
      }, 10);
    }
  });
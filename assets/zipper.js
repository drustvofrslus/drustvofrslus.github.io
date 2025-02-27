document.addEventListener('DOMContentLoaded', function() {
  const zipper = document.querySelector('.zipper-slider');
  const zipperOpening = document.querySelector('.zipper-opening');
  const gradient = document.querySelector('.gradient');
  const pageContent = document.querySelector('.page-content');
  const header = document.querySelector('.site-header');
  
  // Dynamic dimensions
  const zipperHeight = 60;
  let gradientHeight;
  let maxZipperTravel;
  let totalScrollNeeded;
  
  // Animation control
  let currentZipperPos = 0;
  let targetZipperPos = 0;
  let animationRunning = false;
  let zipperComplete = false;
  let scrollAccumulator = 0;
  let initialLoad = true;

  // Update dimensions and scroll requirements
  function updateDimensions() {
    gradientHeight = gradient.offsetHeight;
    maxZipperTravel = gradientHeight - zipperHeight;
    totalScrollNeeded = gradientHeight * 0.8;
  }

  // Initial setup with layout assurance
  function initialize() {
    // Set initial element states
    zipper.style.top = '0px';
    zipperOpening.style.top = '0px';
    zipperOpening.style.height = '0px';
    document.body.style.overflow = 'hidden';
    
    // Calculate dimensions after layout
    requestAnimationFrame(() => {
      updateDimensions();
      // Handle mobile viewport resize
      window.addEventListener('resize', updateDimensions);
    });
  }

  initialize();

  // Reset state on page refresh
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) location.reload();
  });

  // Smooth animation function
  function smoothAnimation() {
    const ease = 0.08;
    const distance = targetZipperPos - currentZipperPos;
    
    if (Math.abs(distance) > 0.5) {
      currentZipperPos += distance * ease;
      currentZipperPos = Math.max(0, Math.min(currentZipperPos, maxZipperTravel));
      
      zipper.style.top = currentZipperPos + 'px';
      zipperOpening.style.height = (currentZipperPos + zipperHeight) + 'px';
      
      requestAnimationFrame(smoothAnimation);
    } else {
      animationRunning = false;
      if (currentZipperPos >= maxZipperTravel * 0.95 && !zipperComplete) {
        completeZipper();
      }
    }
  }

  function updateZipperPosition(position) {
    targetZipperPos = Math.max(0, Math.min(position, maxZipperTravel));
    
    if (!animationRunning) {
      animationRunning = true;
      requestAnimationFrame(smoothAnimation);
    }
    
    if (zipperComplete && targetZipperPos < maxZipperTravel * 0.5) {
      zipperComplete = false;
      gradient.style.height = '100vh';
      pageContent.classList.remove('fade-in');
      pageContent.classList.add('fade-out');
      document.body.style.overflow = 'hidden';
    }
  }

  // Wheel handler
  window.addEventListener('wheel', function(e) {
    if (initialLoad) {
      setTimeout(() => initialLoad = false, 100);
      return;
    }
    
    e.preventDefault();
    
    if (!zipperComplete) {
      scrollAccumulator += Math.min(Math.abs(e.deltaY), 50) * (e.deltaY > 0 ? 1 : -1);
      scrollAccumulator = Math.max(0, Math.min(scrollAccumulator, totalScrollNeeded));
    } else if (window.scrollY === 0 && e.deltaY < 0) {
      scrollAccumulator -= Math.min(Math.abs(e.deltaY), 50);
      scrollAccumulator = Math.max(0, scrollAccumulator);
    }
    
    const progress = Math.min(Math.max(scrollAccumulator / totalScrollNeeded, 0), 1);
    updateZipperPosition(progress * maxZipperTravel);
    
    if (progress >= 0.95 && !zipperComplete) {
      completeZipper();
    } else if (progress < 0.5 && zipperComplete) {
      zipperComplete = false;
      document.body.style.overflow = 'hidden';
    }
  }, { passive: false });

  // Touch handlers
  let touchStartY = 0;
  let touchPrevY = 0;
  
  window.addEventListener('touchstart', function(e) {
    if (initialLoad) {
      setTimeout(() => initialLoad = false, 500);
      return;
    }
    
    touchStartY = e.touches[0].clientY;
    touchPrevY = touchStartY;
    if (!zipperComplete) e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchmove', function(e) {
    if (initialLoad) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = touchPrevY - touchY;
    touchPrevY = touchY;
    
    if (!zipperComplete || (zipperComplete && window.scrollY === 0 && deltaY < 0)) {
      scrollAccumulator += deltaY * 2;
      scrollAccumulator = Math.max(0, Math.min(scrollAccumulator, totalScrollNeeded));
      
      const progress = Math.min(Math.max(scrollAccumulator / totalScrollNeeded, 0), 1);
      updateZipperPosition(progress * maxZipperTravel);
      
      if (progress >= 0.95 && !zipperComplete) {
        completeZipper();
      } else if (progress < 0.5 && zipperComplete) {
        zipperComplete = false;
        document.body.style.overflow = 'hidden';
        gradient.style.height = '100vh';
        pageContent.classList.remove('fade-in');
        pageContent.classList.add('fade-out');
      }
    }
  }, { passive: false });

  function completeZipper() {
    if (zipperComplete) return;
    
    zipperComplete = true;
    gradient.style.position = 'relative';
    gradient.style.zIndex = '1';
    gradient.style.height = zipperHeight * 1.5 + 'px';
    zipper.style.top = (zipperHeight * 0.5) + 'px';
    zipperOpening.style.height = '100%';
    pageContent.classList.remove('fade-out');
    pageContent.classList.add('fade-in');
    pageContent.style.marginTop = '0';
    pageContent.style.position = 'relative';
    pageContent.style.zIndex = '5';
  }

  // Debug functions
  window.completeZipperManually = completeZipper;
  window.resetZipper = function() {
    zipperComplete = false;
    scrollAccumulator = 0;
    targetZipperPos = 0;
    updateZipperPosition(0);
    document.body.style.overflow = 'hidden';
    gradient.style.height = '100vh';
    pageContent.classList.remove('fade-in');
    pageContent.classList.add('fade-out');
  };
});
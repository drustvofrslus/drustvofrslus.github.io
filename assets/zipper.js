document.addEventListener('DOMContentLoaded', function() {
  const zipper = document.querySelector('.zipper-slider');
  const zipperOpening = document.querySelector('.zipper-opening');
  const gradient = document.querySelector('.gradient');
  const pageContent = document.querySelector('.page-content');
  const header = document.querySelector('.site-header');
  
  // Get dimensions
  const gradientHeight = gradient.offsetHeight;
  const zipperHeight = 60; // Height of zipper element
  const maxZipperTravel = gradientHeight - zipperHeight;
  
  // Animation smoothing
  let currentZipperPos = 0;
  let targetZipperPos = 0;
  let animationRunning = false;
  
  // Set initial states - ensure zipper is at top on refresh
  zipper.style.top = '0px';
  zipperOpening.style.top = '0px';
  zipperOpening.style.height = '0px';
  
  // Disable initial scrolling
  document.body.style.overflow = 'hidden';
  
  // Track animation state
  let zipperComplete = false;
  let scrollAccumulator = 0;
  const totalScrollNeeded = gradientHeight * 0.8; // Reduced sensitivity for more control
  
  // Flag to control the initial state
  let initialLoad = true;
  
  // Reset state on page refresh
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      // Page was loaded from cache (browser back/forward)
      location.reload();
    }
  });
  
  // Smooth animation function
  function smoothAnimation() {
    // Calculate smooth movement with easing
    const ease = 0.08; // Lower value = smoother but slower
    const distance = targetZipperPos - currentZipperPos;
    
    if (Math.abs(distance) > 0.5) {
      currentZipperPos += distance * ease;
      
      // Update zipper position - ensure it never goes beyond bounds
      currentZipperPos = Math.max(0, Math.min(currentZipperPos, maxZipperTravel));
      zipper.style.top = currentZipperPos + 'px';
      
      // Update opening height - make sure it starts from the top
      zipperOpening.style.height = (currentZipperPos + zipperHeight) + 'px';
      
      // Continue animation
      requestAnimationFrame(smoothAnimation);
    } else {
      // Animation complete
      animationRunning = false;
      
      // Check if zipper should be complete
      if (currentZipperPos >= maxZipperTravel * 0.95 && !zipperComplete) {
        completeZipper();
      }
    }
  }
  
  // Function to start animation if not running
  function updateZipperPosition(position) {
    // Hard limit the position between 0 and maxZipperTravel
    targetZipperPos = Math.max(0, Math.min(position, maxZipperTravel));
    
    if (!animationRunning) {
      animationRunning = true;
      requestAnimationFrame(smoothAnimation);
    }
    
    // If zipper is complete but we're scrolling back up to the top
    if (zipperComplete && targetZipperPos < maxZipperTravel * 0.5) {
      zipperComplete = false;
      gradient.style.height = '100vh';
      pageContent.classList.remove('fade-in');
      pageContent.classList.add('fade-out');
      document.body.style.overflow = 'hidden';
    }
  }
  
  // Handle wheel events to control zipper
  window.addEventListener('wheel', function(e) {
    if (initialLoad) {
      // Allow a small delay before accepting scroll input
      setTimeout(() => {
        initialLoad = false;
      }, 100);
      return;
    }
    
    e.preventDefault(); // Prevent actual scrolling while zipper is in action
    
    if (!zipperComplete) {
      // Update scroll accumulator based on direction with a maximum threshold
      if (e.deltaY > 0) {
        // Scrolling down - unzip
        scrollAccumulator += Math.min(Math.abs(e.deltaY), 50); // Limit single scroll impact
        scrollAccumulator = Math.min(scrollAccumulator, totalScrollNeeded); // Prevent going beyond total
      } else {
        // Scrolling up - zip back up
        scrollAccumulator -= Math.min(Math.abs(e.deltaY), 50); // Limit single scroll impact
        scrollAccumulator = Math.max(0, scrollAccumulator); // Don't go below 0
      }
    } else {
      // If the zipper is complete and we're at the top of the content, handle zip backup
      if (window.scrollY === 0 && e.deltaY < 0) {
        scrollAccumulator -= Math.min(Math.abs(e.deltaY), 50);
        scrollAccumulator = Math.max(0, scrollAccumulator);
      }
    }
    
    // Calculate progress as a percentage (0 to 1)
    const progress = Math.min(Math.max(scrollAccumulator / totalScrollNeeded, 0), 1);
    
    // Calculate zipper position based on progress
    const zipperPosition = progress * maxZipperTravel;
    
    // Update target position for smooth animation
    updateZipperPosition(zipperPosition);
    
    // Enable/disable page scrolling based on zipper state
    if (progress >= 0.95 && !zipperComplete) {
      completeZipper();
    } else if (progress < 0.5 && zipperComplete) {
      zipperComplete = false;
      document.body.style.overflow = 'hidden';
    }
  }, { passive: false });
  
  // Touch support for mobile with two-way zipping
  let touchStartY = 0;
  let touchPrevY = 0;
  
  window.addEventListener('touchstart', function(e) {
    if (initialLoad) {
      // Allow a small delay before accepting touch input
      setTimeout(() => {
        initialLoad = false;
      }, 500);
      return;
    }
    
    touchStartY = e.touches[0].clientY;
    touchPrevY = touchStartY;
    
    if (!zipperComplete) {
      e.preventDefault();
    }
  }, { passive: false });
  
  window.addEventListener('touchmove', function(e) {
    if (initialLoad) return;
    
    if (!zipperComplete) {
      e.preventDefault();
    } else if (window.scrollY === 0) {
      // Allow re-zipping if at top of content
      e.preventDefault();
    }
    
    const touchY = e.touches[0].clientY;
    const deltaY = touchPrevY - touchY; // Positive when scrolling down, negative when up
    touchPrevY = touchY;
    
    if (!zipperComplete || (zipperComplete && window.scrollY === 0 && deltaY < 0)) {
      // Update scroll accumulator based on direction with limits
      const touchSensitivity = 2; // Adjust touch sensitivity
      scrollAccumulator += deltaY * touchSensitivity;
      scrollAccumulator = Math.max(0, Math.min(scrollAccumulator, totalScrollNeeded));
      
      // Calculate progress
      const progress = Math.min(Math.max(scrollAccumulator / totalScrollNeeded, 0), 1);
      
      // Calculate zipper position and update
      const zipperPosition = progress * maxZipperTravel;
      updateZipperPosition(zipperPosition);
      
      // Toggle zip complete state
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
  
  // Function to handle completion of zipper animation
  function completeZipper() {
    if (zipperComplete) return; // Prevent multiple executions
    
    zipperComplete = true;
    // document.body.style.overflow = 'auto'; // Re-enable scrolling
    
    // Keep gradient and zipper visible
    gradient.style.position = 'relative';
    gradient.style.zIndex = '1';
    gradient.style.height = zipperHeight * 1.5 + 'px'; // Keep just enough to show the zipper
    
    // Position zipper at the bottom of the now-shortened gradient BUT keep it visible
    zipper.style.top = (zipperHeight * 0.5) + 'px';
    
    // Make sure the zipper opening matches
    zipperOpening.style.height = '100%';
    
    // Update layout and make content visible
    pageContent.classList.remove('fade-out');
    pageContent.classList.add('fade-in');
    pageContent.style.marginTop = '0';
    pageContent.style.position = 'relative';
    pageContent.style.zIndex = '5';
    
    console.log('Zipper animation complete, showing content below zipper');
  }
  
  // Debug function
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
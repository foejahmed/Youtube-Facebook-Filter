// video speed, dim , css

// // *************Control video playback rate*************
// //*******************************************************
(function() { 
  let playbackRate = 1.0;

  const updatePlaybackRate = (delta) => {
    // Query for both standard video elements and YouTube's custom player
    const videos = document.querySelectorAll('video, .html5-main-video');
    if (videos.length === 0) return;

    playbackRate = Math.max(0.25, playbackRate + delta);
    
    videos.forEach(video => {
      // Try multiple methods to update playback rate
      try {
        // Direct property setting
        video.playbackRate = playbackRate;
        
        // YouTube player API method
        if (video.getPlayerState && typeof video.setPlaybackRate === 'function') {
          video.setPlaybackRate(playbackRate);
        }
      } catch (e) {
        console.error('Failed to update playback rate:', e);
      }
    });

    showPlaybackRate(playbackRate);
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === ',') {
      updatePlaybackRate(-0.25);
    } else if (event.key === '.') {
      updatePlaybackRate(0.25);
    }
  });
})();



// notification
function showPlaybackRate(rate) {
  // Create or update a notification overlay
  let notification = document.getElementById("playback-rate-notification");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "playback-rate-notification";
    notification.style.position = "fixed";
    notification.style.top = "4%"; // Center vertically
    notification.style.left = "50%"; // Center horizontally
    notification.style.transform = "translate(-50%, -50%)"; // Ensure perfect centering
    notification.style.color = "#d3dbe3";
    notification.style.padding = "20px 40px";
    notification.style.borderRadius = "10px";
    notification.style.zIndex = "9999";
    notification.style.fontSize = "20px"; // Bigger font size
    notification.style.textAlign = "center";
    document.body.appendChild(notification);
  }

  notification.textContent = `${rate.toFixed(2)}x`;

  // Remove the notification after 1 seconds
  clearTimeout(notification.dismissTimeout);
  notification.dismissTimeout = setTimeout(() => {
    notification.style.display = "none";
  }, 1000);

  // Ensure it's visible if reused quickly
  notification.style.display = "block";
}














// *************dim watched video thumbnails*************
//*******************************************************
function dimWatchedVideos() {
  // Select all video thumbnails
  const thumbnails = document.querySelectorAll("ytd-thumbnail");

  thumbnails.forEach((thumbnail) => {
    // Check if the video has been watched by looking for a progress bar or specific attribute
    const progressBar = thumbnail.querySelector(".ytd-thumbnail-overlay-resume-playback-renderer");

    // Add the dimmed class only if the progress bar (watched indicator) exists
    if (progressBar && !thumbnail.classList.contains("dimmed-watched")) {
      thumbnail.classList.add("dimmed-watched");
    }
  });
}


// Observe changes to the DOM for dynamically loaded content
const observer = new MutationObserver(() => {
  dimWatchedVideos();
});

// Start observing
observer.observe(document.body, { childList: true, subtree: true });

// Apply dimming styles initially when the script loads
document.addEventListener("DOMContentLoaded", dimWatchedVideos);


////********** style Dim, related section down **********
////******************************************************
(function() {
  const style = document.createElement("style");
  style.textContent = `
    .dimmed-watched img {
      filter: brightness(25%);
      transition: filter 0.1s ease;
  }

    #related {
      margin-top: 150px;
  }
  `;
  document.head.appendChild(style);
})();

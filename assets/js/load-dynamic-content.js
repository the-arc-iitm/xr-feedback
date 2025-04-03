// Load dynamic content from Firebase

// Initialize Firebase (same config as CMS)
const firebaseConfig = {
    apiKey: "AIzaSyDkOTgs1dBW2lav5hOJldvGkVPjciaqCNk",
    authDomain: "the-arc-website-956df.firebaseapp.com",
    projectId: "the-arc-website-956df",
    storageBucket: "the-arc-website-956df.firebasestorage.app",
    messagingSenderId: "458743555136",
    appId: "1:458743555136:web:cddf01d6ef439b85f1eba5",
    measurementId: "G-53TBHD6Z4B"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // Initialize Firestore
    const db = firebase.firestore();
    
    // Check if the default event exists, if not add it
    function checkAndAddDefaultEvent() {
        const defaultEventTitle = "Sound Sculpting for Science";
        
        // Check if the event already exists
        db.collection('events')
            .where('title', '==', defaultEventTitle)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    // Event doesn't exist, add it
                    const defaultEvent = {
                        title: defaultEventTitle,
                        date: "2025-03-07",
                        location: "Periyar Science and Technology Centre, Chennai, Tamil Nadu, India",
                        description: "Join us for the Sound Sculpting for Science event at the Periyar Science and Technology Centre.",
                        status: "published",
                        featured: true,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // Add to Firestore
                    db.collection('events').add(defaultEvent)
                        .then((docRef) => {
                            console.log("Default event added successfully");
                            
                            // Update the URL with the dynamic pattern
                            db.collection('events').doc(docRef.id).update({
                                url: `event-detail.html?id=${docRef.id}`
                            })
                            .then(() => {
                                console.log("Default event URL updated");
                                // Reload events
                                loadEventsContent();
                            })
                            .catch((error) => {
                                console.error("Error updating default event URL:", error);
                            });
                        })
                        .catch((error) => {
                            console.error("Error adding default event:", error);
                        });
                } else {
                    console.log("Default event already exists");
                }
            })
            .catch((error) => {
                console.error("Error checking for default event:", error);
            });
    }
    
    // Load Our Focus content
    function loadOurFocusContent() {
        const focusSection = document.getElementById('learning');
        if (!focusSection) return;
        
        db.collection('content').doc('ourFocus').get()
            .then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    updateOurFocusSection(data);
                }
            })
            .catch((error) => {
                console.error("Error loading Our Focus content:", error);
            });
    }
    
    // Update Our Focus section with data from Firebase
    function updateOurFocusSection(data) {
        // Update heading
        const focusHeading = document.getElementById('our-focus-heading');
        if (focusHeading && data.title) {
            focusHeading.textContent = data.title;
        }
        
        // Update subtitle
        const focusSubtitle = document.querySelector('.focus-section .title-text');
        if (focusSubtitle && data.subtitle) {
            focusSubtitle.textContent = data.subtitle;
        }
        
        // Update paragraphs
        const paragraphs = document.querySelectorAll('.focus-section .col-lg-6:first-child p');
        if (paragraphs.length >= 3) { // Title + 2 paragraphs
            if (data.paragraph1) {
                paragraphs[1].textContent = data.paragraph1;
            }
            if (data.paragraph2) {
                paragraphs[2].textContent = data.paragraph2;
            }
        }
        
        // Update video
        const videoLink = document.querySelector('.focus-section .about-two__video');
        if (videoLink && data.videoUrl) {
            // Get embed URL
            const embedUrl = getEmbedUrl(data.videoUrl);
            if (embedUrl) {
                videoLink.href = embedUrl;
            }
        }
        
        // Update thumbnail (if provided)
        const videoThumbnail = document.getElementById('video-thumbnail');
        if (videoThumbnail && data.thumbnailUrl) {
            videoThumbnail.src = data.thumbnailUrl;
        }
    }
    
    // Load Events from Firebase
    function loadEventsContent() {
        // First check if we have an events section
        const eventContainer = document.querySelector('.col-lg-7 .border');
        if (!eventContainer) {
            console.error("Event container not found");
            return;
        }
        
        // Get the calendar element
        const calendarElem = document.getElementById('calendar');
        if (!calendarElem) {
            console.error("Calendar element not found");
            return;
        }
        
        console.log("Loading events from Firebase...");
        
        // Get featured events (limit to the most recent 5)
        db.collection('events')
            .where('status', '==', 'published')
            .where('featured', '==', true)
            .orderBy('date', 'desc')
            .limit(5)
            .get()
            .then((querySnapshot) => {
                const events = [];
                querySnapshot.forEach((doc) => {
                    events.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log("Loaded featured events:", events.length);
                
                if (events.length > 0) {
                    updateEventsSection(events);
                } else {
                    console.log("No featured events found");
                }
                
                // Also get all events for the calendar
                return db.collection('events')
                    .where('status', '==', 'published')
                    .orderBy('date', 'desc')
                    .get();
            })
            .then((querySnapshot) => {
                if (!querySnapshot) return;
                
                const allEvents = [];
                querySnapshot.forEach((doc) => {
                    allEvents.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log("Loaded all events:", allEvents.length);
                
                if (allEvents.length > 0) {
                    // We need to enhance the calendar to show events
                    enhanceCalendarWithEvents(calendarElem, allEvents);
                } else {
                    console.log("No events found for calendar");
                }
            })
            .catch((error) => {
                console.error("Error loading events:", error);
            });
    }
    
    // Update the Events section with data from Firebase
    function updateEventsSection(events) {
        // Check if we have any events
        if (!events || events.length === 0) {
            console.log("No events to display");
            
            // Get the event container
            const eventContainer = document.querySelector('.col-lg-7 .border');
            if (!eventContainer) {
                console.error("Event container not found");
                return;
            }
            
            // Clear the loading indicator and show a message
            eventContainer.innerHTML = '<div class="text-center py-4"><p>No upcoming events found.</p></div>';
            return;
        }
        
        // Get the event container
        const eventContainer = document.querySelector('.col-lg-7 .border');
        if (!eventContainer) {
            console.error("Event container not found");
            return;
        }
        
        console.log("Updating events section with", events.length, "events");
        
        // Clear existing content (including loading indicator)
        eventContainer.innerHTML = '';
        
        // Loop through events and add them to the container
        events.forEach((event, index) => {
            // Only show the first 3 events
            if (index > 2) return;
            
            // Format the date
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            console.log("Adding event:", event.title);
            
            // Default URL fallback - if no URL, use the dynamic URL
            let eventUrl = `event-detail.html?id=${event.id}`;
            
            // If the event has a URL that doesn't already have the event-detail.html prefix, 
            // make sure we format it correctly
            if (event.url) {
                // Check if URL already has the correct format
                if (event.url.includes('event-detail.html?id=')) {
                    eventUrl = event.url;
                } else if (event.url.startsWith('http')) {
                    // External URL, use as is
                    eventUrl = event.url;
                } else {
                    // It's just a slug, construct the full URL
                    eventUrl = `event-detail.html?id=${event.id}`;
                }
            }
            
            // Create event HTML
            const eventHtml = `
                <!-- Event Item -->
                <div class="gap-4 d-flex ${index > 0 ? 'mt-4 pt-4 border-top' : ''}">
                    <div>
                        <p class="calender-event-date">${formattedDate}</p>
                    </div>
                    <div>
                        <h3 class="blog-title">
                            <a href="${eventUrl}">${event.title}</a>
                        </h3>
                        <div class="d-flex flex-wrap align-items-center">
                            <p class="mb-0"><i class="fas fa-map-marker me-2"></i>${event.location}</p>
                        </div>
                        <p>${event.description}</p>
                        <a href="${eventUrl}" class="readmore">Learn More<i class="fa-solid fa-arrow-right-long"></i></a>
                    </div>
                </div>
            `;
            
            // Add the event to the container
            eventContainer.innerHTML += eventHtml;
        });
    }
    
    // Load blog content from Firebase
    function loadBlogContent() {
        // First check if we have a blog section
        const blogCarousel = document.querySelector('.blog-section .owl-carousel');
        if (!blogCarousel) {
            console.log("Blog carousel not found");
            return;
        }
        
        console.log("Loading blog posts from Firebase...");
        
        // Get featured blog posts (limit to the most recent 6)
        db.collection('blog')
            .where('status', '==', 'published')
            .orderBy('date', 'desc')
            .limit(6)
            .get()
            .then((querySnapshot) => {
                const posts = [];
                querySnapshot.forEach((doc) => {
                    posts.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log("Loaded blog posts:", posts.length);
                
                if (posts.length > 0) {
                    updateBlogCarousel(posts, blogCarousel);
                } else {
                    console.log("No blog posts found");
                    // Clear the loading indicator and show a message
                    blogCarousel.innerHTML = '<div class="item d-flex align-items-stretch"><div class="blog-card d-flex flex-column"><div class="text-center py-4"><p>No blog posts available.</p></div></div></div>';
                }
            })
            .catch((error) => {
                console.error("Error loading blog posts:", error);
                // Clear the loading indicator and show an error message
                blogCarousel.innerHTML = '<div class="item d-flex align-items-stretch"><div class="blog-card d-flex flex-column"><div class="text-center py-4"><p>Error loading blog posts. Please try again later.</p></div></div></div>';
            });
    }
    
    // Update the Blog Carousel with posts from Firebase
    function updateBlogCarousel(posts, carousel) {
        console.log("Updating blog carousel with", posts.length, "posts");
        
        // We'll temporarily store the items here before reinitializing the carousel
        const carouselItems = [];
        
        // Loop through posts and create carousel items
        posts.forEach(post => {
            console.log("Adding blog post:", post.title);
            
            // Create blog HTML
            const blogHtml = `
                <div class="item d-flex align-items-stretch">
                    <div class="blog-card d-flex flex-column">
                        <img
                            src="${post.imageUrl || './assets/images/blog-placeholder.png'}"
                            alt="${post.title}"
                            class="img-fluid"
                        />
                        <div class="blog-card-body flex-grow-1">
                            <h3 class="blog-title">
                                <a href="${post.slug ? '/blog/' + post.slug + '.html' : '#'}">
                                    <span class="blog-title">${post.title}</span>
                                </a>
                            </h3>
                            <p class="blog-excerpt lh-sm">
                                ${post.excerpt || ''}
                            </p>
                            <a
                                href="${post.slug ? '/blog/' + post.slug + '.html' : '#'}"
                                class="text-decoration-none"
                                aria-label="Read more about ${post.title}"
                            >
                                <p class="text-blue sticky-bottom mb-0" style="width: 90.4%">
                                    Read More...
                                </p>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            carouselItems.push(blogHtml);
        });
        
        // Check if we already initialized Owl Carousel
        const isInitialized = carousel.classList.contains('owl-loaded');
        console.log("Owl carousel initialized:", isInitialized);
        
        if (isInitialized) {
            // Destroy existing carousel
            $(carousel).owlCarousel('destroy');
        }
        
        // Set the HTML content
        carousel.innerHTML = carouselItems.join('');
        console.log("Set carousel HTML with", carouselItems.length, "items");
        
        // Initialize Owl Carousel
        $(carousel).owlCarousel({
            loop: false,
            margin: 10,
            nav: true,
            autoplay: false,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
            responsive: {
                0: { items: 1 },
                600: { items: 2 },
                1000: { items: 4 }
            }
        });
        console.log("Owl carousel initialized successfully");
        
        // Fix accessibility for dots
        $(".owl-dot").each(function (index) {
            $(this).attr("aria-label", `Go to slide ${index + 1}`);
        });

        // Fix accessibility for navigation buttons
        $(".owl-prev").each(function () {
            $(this).removeAttr("role").attr("aria-label", "Previous");
        });

        $(".owl-next").each(function () {
            $(this).removeAttr("role").attr("aria-label", "Next");
        });
    }
    
    // Import existing blog posts if needed
    function importExistingBlogPosts() {
        // Sample data for existing blog posts
        const existingPosts = [
            {
                title: "A blind person's experiments with tech",
                slug: "blind-persons-experiments",
                excerpt: "In this week's story, DH journalist L Subramani describes how",
                imageUrl: "./assets/images/blog-post-1.png",
                date: "2025-02-15",
                author: "L Subramani",
                status: "published",
                featured: true
            },
            {
                title: "Increasing admission of students with disabilities at IIT",
                slug: "students-with-disabilities",
                excerpt: "Here's why students with disabilities (SWDs) seeking",
                imageUrl: "./assets/images/blog-post-2.png",
                date: "2025-02-05",
                author: "ARC Team",
                status: "published",
                featured: true
            },
            {
                title: "Making Sense of the Disability Autonomy and Collectivity Binary",
                slug: "making-sense-of-the-disability",
                excerpt: "As scholar-activists, we are aware that ableist attitudes",
                imageUrl: "./assets/images/blog-post-3.png",
                date: "2025-01-20",
                author: "Dr. Jane Smith",
                status: "published",
                featured: true
            },
            {
                title: "The metanarrative of blindness in India",
                slug: "metanarrative-of-blindness",
                excerpt: "This book explores multiple metanarratives of disability",
                imageUrl: "./assets/images/blog-post-4.png",
                date: "2025-01-10",
                author: "Dr. John Doe",
                status: "published",
                featured: true
            }
        ];
        
        // Check if we already have blog posts
        db.collection('blog').get().then((snapshot) => {
            if (snapshot.empty) {
                console.log("No existing blog posts found, importing defaults...");
                
                // No posts exist, import the existing ones
                const importPromises = existingPosts.map(post => {
                    return db.collection('blog').add({
                        ...post,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
                
                Promise.all(importPromises)
                    .then(() => {
                        console.log("Default blog posts imported successfully");
                        loadBlogContent();
                    })
                    .catch((error) => {
                        console.error("Error importing default blog posts:", error);
                    });
            } else {
                console.log("Existing blog posts found:", snapshot.size);
            }
        }).catch(error => {
            console.error("Error checking for blog posts:", error);
        });
    }
    
    // Enhance the calendar with events
    function enhanceCalendarWithEvents(calendarElem, events) {
        // Make sure we have events
        if (!events || events.length === 0) {
            console.log("No events to add to calendar");
            return;
        }
        
        console.log("Enhancing calendar with", events.length, "events");
        
        // Create a mapping of dates to events for quick lookup
        const dateToEvents = {};
        
        events.forEach(event => {
            // Parse the date string to get year, month, day
            const dateParts = event.date.split('-');
            if (dateParts.length !== 3) {
                console.error("Invalid date format:", event.date);
                return;
            }
            
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-based
            const day = parseInt(dateParts[2]);
            
            // Create a unique key for this date
            const dateKey = `${year}-${month}-${day}`;
            
            // Add the event to the mapping
            if (!dateToEvents[dateKey]) {
                dateToEvents[dateKey] = [];
            }
            dateToEvents[dateKey].push(event);
        });
        
        // Store the original calendar's dateSelected event handler
        const originalHandler = calendarElem.onDateSelected;
        
        // Listen for date selected events
        calendarElem.addEventListener(Events.DATE_SELECTED, (e) => {
            // Call the original handler if it exists
            if (originalHandler) {
                originalHandler(e);
            }
            
            // Get the selected date
            const selectedDate = e.detail.date;
            
            // Create a key for this date
            const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
            
            // Get events for this date
            const eventsForDay = dateToEvents[dateKey] || [];
            
            // Show events for this day
            if (eventsForDay.length > 0) {
                showEventsForDay(eventsForDay);
            }
        });
        
        // Highlight days with events
        const cells = calendarElem.querySelectorAll(`.${ClassNames.TABLE_CELL}`);
        cells.forEach(cell => {
            if (!cell.dataset.date) return;
            
            const month = calendarElem.querySelector(`.${ClassNames.MONTH}`).textContent;
            const year = calendarElem.querySelector(`.${ClassNames.YEAR}`).textContent;
            
            // Get the month index
            const monthIndex = MonthNames.indexOf(month);
            if (monthIndex === -1) return;
            
            // Create a key for this date
            const dateKey = `${year}-${monthIndex}-${cell.dataset.date}`;
            
            // Check if there are events for this date
            if (dateToEvents[dateKey] && dateToEvents[dateKey].length > 0) {
                // Add a marker to the cell
                cell.classList.add('has-event');
                
                // Add tooltip with event count
                const count = dateToEvents[dateKey].length;
                cell.setAttribute('title', `${count} ${count === 1 ? 'event' : 'events'}`);
                
                // Add click handler
                cell.style.cursor = 'pointer';
            }
        });
    }
    
    // Show events for a specific day
    function showEventsForDay(events) {
        // Get the event container
        const eventContainer = document.querySelector('.col-lg-7 .border');
        if (!eventContainer) {
            console.error("Event container not found");
            return;
        }
        
        console.log("Showing", events.length, "events for selected day");
        
        // Clear existing content
        eventContainer.innerHTML = '';
        
        // Add a heading
        const heading = document.createElement('h4');
        heading.classList.add('mb-3');
        heading.textContent = 'Events for this day';
        eventContainer.appendChild(heading);
        
        // Loop through events and add them to the container
        events.forEach((event, index) => {
            // Format the date
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Default URL fallback - if no URL, use the dynamic URL
            let eventUrl = `event-detail.html?id=${event.id}`;
            
            // If the event has a URL that doesn't already have the event-detail.html prefix, 
            // make sure we format it correctly
            if (event.url) {
                // Check if URL already has the correct format
                if (event.url.includes('event-detail.html?id=')) {
                    eventUrl = event.url;
                } else if (event.url.startsWith('http')) {
                    // External URL, use as is
                    eventUrl = event.url;
                } else {
                    // It's just a slug, construct the full URL
                    eventUrl = `event-detail.html?id=${event.id}`;
                }
            }
            
            // Create event HTML
            const eventDiv = document.createElement('div');
            eventDiv.className = `gap-4 d-flex ${index > 0 ? 'mt-4 pt-4 border-top' : ''}`;
            eventDiv.innerHTML = `
                <div>
                    <p class="calender-event-date">${formattedDate}</p>
                </div>
                <div>
                    <h3 class="blog-title">
                        <a href="${eventUrl}">${event.title}</a>
                    </h3>
                    <div class="d-flex flex-wrap align-items-center">
                        <p class="mb-0"><i class="fas fa-map-marker me-2"></i>${event.location}</p>
                    </div>
                    <p>${event.description}</p>
                    <a href="${eventUrl}" class="readmore">Learn More<i class="fa-solid fa-arrow-right-long"></i></a>
                </div>
            `;
            
            // Add the event to the container
            eventContainer.appendChild(eventDiv);
        });
        
        // Add back button
        const backButton = document.createElement('button');
        backButton.className = 'btn btn-outline-primary mt-4';
        backButton.innerHTML = '<i class="fas fa-arrow-left me-2"></i>Back to featured events';
        backButton.addEventListener('click', () => {
            // Reload featured events
            loadEventsContent();
        });
        
        eventContainer.appendChild(backButton);
    }
    
    // Convert YouTube URL to embed URL
    function getEmbedUrl(url) {
        if (!url) return '';
        
        // Handle different YouTube URL formats
        let videoId = '';
        
        // Regular YouTube URL (watch?v=)
        const watchPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
        const watchMatch = url.match(watchPattern);
        
        // Embed URL
        const embedPattern = /youtube\.com\/embed\/([^&\s]+)/;
        const embedMatch = url.match(embedPattern);
        
        if (watchMatch && watchMatch[1]) {
            videoId = watchMatch[1];
        } else if (embedMatch && embedMatch[1]) {
            videoId = embedMatch[1];
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        // If no valid ID found, return the original URL (might already be an embed URL)
        return url;
    }
    
    // Load content when document is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Document ready, loading content...");
        // First check if we need to add the default event
        checkAndAddDefaultEvent();
        
        // Check if we need to import blog posts
        importExistingBlogPosts();
        
        // Load content
        loadOurFocusContent();
        loadEventsContent();
        loadBlogContent();
        loadPartnershipsContent();
        loadContactInformation();
        checkForAdminUser();
    });
    
    // Check if current user is an admin and show edit links if they are
    function checkForAdminUser() {
        // Add authentication if available
        if (typeof firebase.auth !== 'undefined') {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in, check if they're an admin
                    const adminEmails = ['ed22b059@smail.iitm.ac.in'];
                    if (adminEmails.includes(user.email)) {
                        // Show admin edit links
                        document.querySelectorAll('.admin-edit-link').forEach(function(link) {
                            link.classList.remove('d-none');
                        });
                        
                        // Show admin nav items
                        document.querySelectorAll('.admin-nav-item').forEach(function(item) {
                            item.classList.remove('d-none');
                        });
                    }
                }
            });
        }
    }
    
    // Load partnerships content from Firebase
    function loadPartnershipsContent() {
        // First check if we have a partnerships section
        const partnersSection = document.querySelector('.partner-section');
        if (!partnersSection) {
            console.log("Partners section not found");
            return;
        }
        
        console.log("Loading partnerships from Firebase...");
        
        // Get categories first
        db.collection('partnerCategories')
            .orderBy('order')
            .get()
            .then((categorySnapshot) => {
                const categories = [];
                categorySnapshot.forEach((doc) => {
                    categories.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log("Loaded partner categories:", categories.length);
                
                // Now get all partners
                return db.collection('partners')
                    .where('active', '==', true)
                    .get()
                    .then((partnerSnapshot) => {
                        const partners = [];
                        partnerSnapshot.forEach((doc) => {
                            partners.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                        
                        console.log("Loaded partners:", partners.length);
                        
                        // Update the partners section
                        updatePartnersSection(categories, partners);
                        
                        // If no categories or partners, check for default partners
                        if (categories.length === 0 || partners.length === 0) {
                            importExistingPartners();
                        }
                    });
            })
            .catch((error) => {
                console.error("Error loading partners:", error);
            });
    }
    
    // Update the partnerships section with data from Firebase
    function updatePartnersSection(categories, partners) {
        // First check if we have a partnerships section
        const partnersSection = document.querySelector('.partner-section .container');
        if (!partnersSection) {
            console.error("Partners container not found");
            return;
        }
        
        console.log("Updating partners section with", categories.length, "categories and", partners.length, "partners");
        
        // Check if we need to save existing content (for first time use)
        let preserveExistingContent = partners.length === 0;
        
        // Store existing partners HTML if needed
        let existingPartnersHTML = '';
        if (preserveExistingContent) {
            // Save all the existing content except the heading
            const heading = partnersSection.querySelector('h2');
            const tempDiv = document.createElement('div');
            Array.from(partnersSection.children).forEach(child => {
                if (child.tagName !== 'H2') {
                    tempDiv.appendChild(child.cloneNode(true));
                }
            });
            existingPartnersHTML = tempDiv.innerHTML;
        }
        
        // Keep the section heading
        const heading = partnersSection.querySelector('h2');
        const headingHTML = heading ? heading.outerHTML : '<h2 class="text-center mt-md-5 mt-0 mb-md-5 mb-4 pt-md-4 pt-0 heading-blue">Collaborations &nbsp;&&nbsp; Partnerships</h2>';
        
        // Clear the container
        partnersSection.innerHTML = '';
        partnersSection.innerHTML = headingHTML;
        
        // Show edit link for admin users
        const editLink = document.createElement('a');
        editLink.href = 'cms/partners-manage.html';
        editLink.className = 'admin-edit-link d-none';
        editLink.innerHTML = '<i class="fas fa-edit"></i> Manage Partners';
        editLink.style.position = 'absolute';
        editLink.style.right = '15px';
        editLink.style.top = '15px';
        
        // Add the edit link to the section
        partnersSection.style.position = 'relative';
        partnersSection.appendChild(editLink);
        
        // If we need to preserve existing content and have no partners from Firebase
        if (preserveExistingContent) {
            console.log("Preserving existing partners content");
            partnersSection.innerHTML += existingPartnersHTML;
            return;
        }
        
        // If no categories or partners at all, show a message
        if (categories.length === 0 || partners.length === 0) {
            console.log("No categories or partners found");
            const noContentDiv = document.createElement('div');
            noContentDiv.className = 'col-12 text-center py-4';
            noContentDiv.innerHTML = '<p>No partnership information available at this time.</p>';
            partnersSection.appendChild(noContentDiv);
            return;
        }
        
        // Process each category
        let anyPartnersAdded = false;
        categories.forEach(category => {
            // Get partners for this category
            const categoryPartners = partners.filter(partner => partner.categoryId === category.id);
            
            // Only show categories with partners
            if (categoryPartners.length === 0) return;
            
            anyPartnersAdded = true;
            
            // Create category container
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'col-12 m-auto';
            
            // Add category heading
            const categoryHeading = document.createElement('h3');
            categoryHeading.className = 'partner-heading text-center my-5';
            categoryHeading.textContent = category.name;
            categoryContainer.appendChild(categoryHeading);
            
            // Add spacing
            const spacer = document.createElement('br');
            categoryContainer.appendChild(spacer);
            
            // Create row for partners
            const partnersRow = document.createElement('div');
            partnersRow.className = 'row d-flex justify-content-center align-items-stretch';
            
            // Add partners to the row
            categoryPartners.forEach(partner => {
                const partnerCol = document.createElement('div');
                partnerCol.className = 'col-md-3 col-6 d-flex justify-content-center align-items-stretch text-center';
                
                const partnerHTML = `
                    <div class="d-flex flex-column justify-content-between align-items-center h-100">
                        <a
                            href="${partner.url || '#'}"
                            target="_blank"
                            aria-label="Visit ${partner.name} Website"
                            class="d-flex flex-column align-items-center h-100"
                        >
                            <div class="flex-grow-1 d-flex align-items-center">
                                <img
                                    src="${partner.logoUrl}"
                                    alt="${partner.name} Logo"
                                    class="px-3 img-fluid"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="${partner.tooltip || partner.name}"
                                />
                            </div>
                            <p class="text-blue m-0 text-wrap">
                                ${partner.name}
                            </p>
                            ${partner.additionalInfo ? `<p class="text-muted small mb-3">${partner.additionalInfo}</p>` : '<br>'}
                        </a>
                    </div>
                `;
                
                partnerCol.innerHTML = partnerHTML;
                partnersRow.appendChild(partnerCol);
            });
            
            // Add the partners row to the category container
            categoryContainer.appendChild(partnersRow);
            
            // Add the category container to the section
            partnersSection.appendChild(categoryContainer);
        });
        
        // If no partners were added (despite having categories and partners)
        if (!anyPartnersAdded) {
            console.log("No matching partners found for categories");
            const noContentDiv = document.createElement('div');
            noContentDiv.className = 'col-12 text-center py-4';
            noContentDiv.innerHTML = '<p>No partnership information available at this time.</p>';
            partnersSection.appendChild(noContentDiv);
        }
    }
    
    // Import existing partners if needed
    function importExistingPartners() {
        console.log("Checking for existing partners to import...");
        
        // Check if we already have partners categories
        db.collection('partnerCategories').get().then((categorySnapshot) => {
            if (categorySnapshot.empty) {
                console.log("No partner categories found, adding default categories...");
                
                // Add default categories
                const defaultCategories = [
                    {
                        name: "Funding Partner", // Singular, as in the original HTML
                        description: "Organizations that provide funding support to ARC",
                        order: 1,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    {
                        name: "Friends Of ARC", // Exactly as in the original HTML
                        description: "Organizations that collaborate with ARC on various initiatives",
                        order: 2,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }
                ];
                
                // Add categories
                const categoryPromises = defaultCategories.map(category => {
                    return db.collection('partnerCategories').add(category);
                });
                
                // Wait for categories to be added
                Promise.all(categoryPromises)
                    .then((categoryRefs) => {
                        console.log("Default categories added successfully");
                        
                        // Now add default partners
                        const defaultPartners = [
                            {
                                name: "Great Eastern Foundation (GEF)",
                                categoryId: categoryRefs[0].id, // Funding Partner
                                website: "https://www.greatship.com/csr.html",
                                logoUrl: "./assets/images/GEF.png",
                                active: true,
                                featured: true,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            },
                            {
                                name: "Sightsavers",
                                categoryId: categoryRefs[1].id, // Friends Of ARC
                                website: "https://www.sightsaversindia.in",
                                logoUrl: "./assets/images/Sightsavers India.svg",
                                location: "New Delhi, India",
                                active: true,
                                featured: false,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            }
                        ];
                        
                        // Add partners
                        const partnerPromises = defaultPartners.map(partner => {
                            return db.collection('partners').add(partner);
                        });
                        
                        return Promise.all(partnerPromises);
                    })
                    .then(() => {
                        console.log("Default partners added successfully");
                        // Reload the partners section
                        setTimeout(loadPartnershipsContent, 1000);
                    })
                    .catch((error) => {
                        console.error("Error importing default partners:", error);
                    });
            } else {
                // Categories exist, check if we have partners
                db.collection('partners').get().then((partnerSnapshot) => {
                    if (partnerSnapshot.empty) {
                        console.log("No partners found but categories exist, adding default partners with existing categories...");
                        
                        // Get categories
                        const categories = [];
                        categorySnapshot.forEach((doc) => {
                            categories.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                        
                        // Find category IDs by name
                        const fundingPartnerCategory = categories.find(c => c.name === "Funding Partner"); // Singular
                        const friendsCategory = categories.find(c => c.name === "Friends Of ARC"); // Exact match
                        
                        // Add default partners
                        const defaultPartners = [];
                        
                        if (fundingPartnerCategory) {
                            defaultPartners.push({
                                name: "Great Eastern Foundation (GEF)",
                                categoryId: fundingPartnerCategory.id,
                                website: "https://www.greatship.com/csr.html",
                                logoUrl: "./assets/images/GEF.png",
                                active: true,
                                featured: true,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                        
                        if (friendsCategory) {
                            defaultPartners.push({
                                name: "Sightsavers",
                                categoryId: friendsCategory.id,
                                website: "https://www.sightsaversindia.in",
                                logoUrl: "./assets/images/Sightsavers India.svg",
                                location: "New Delhi, India",
                                active: true,
                                featured: false,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                        
                        if (defaultPartners.length > 0) {
                            // Add partners
                            const partnerPromises = defaultPartners.map(partner => {
                                return db.collection('partners').add(partner);
                            });
                            
                            Promise.all(partnerPromises)
                                .then(() => {
                                    console.log("Default partners added with existing categories");
                                    // Reload the partners section
                                    setTimeout(loadPartnershipsContent, 1000);
                                })
                                .catch((error) => {
                                    console.error("Error adding default partners:", error);
                                });
                        }
                    } else {
                        console.log("Partners already exist:", partnerSnapshot.size);
                    }
                });
            }
        });
    }
    
    // Load contact information
    function loadContactInformation() {
        console.log("Loading contact information from Firebase...");
        
        db.collection('contactInfo').doc('mainContact').get()
            .then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    updateContactSections(data);
                    console.log("Contact information loaded successfully");
                } else {
                    console.log("No contact information found in database");
                }
            })
            .catch((error) => {
                console.error("Error loading contact information:", error);
            });
    }
    
    // Update contact sections with data from Firebase
    function updateContactSections(data) {
        // Check which page we're on
        const isHomePage = document.querySelector('.contact-section.section-padding');
        const isContactPage = document.querySelector('.contact-list');
        
        console.log("Updating contact sections. isHomePage:", !!isHomePage, "isContactPage:", !!isContactPage);
        
        if (isHomePage) {
            console.log("Updating home page contact section");
            updateHomePageContact(data);
        }
        
        if (isContactPage) {
            console.log("Updating contact page information");
            updateContactPageInfo(data);
        }
    }
    
    // Update the contact section on the home page
    function updateHomePageContact(data) {
        // Update heading
        const contactHeading = document.querySelector('.contact-section .heading-blue');
        if (contactHeading && data.contactHeading) {
            // Preserve the edit link if it exists
            const editLink = contactHeading.querySelector('.admin-edit-link');
            const newText = 'Contact Us';
            
            if (editLink) {
                contactHeading.innerHTML = newText;
                contactHeading.appendChild(editLink);
            } else {
                contactHeading.textContent = newText;
            }
        }
        
        // Update email
        const emailLink = document.querySelector('.contact-section a[href^="mailto:"]');
        if (emailLink && data.email) {
            emailLink.href = `mailto:${data.email}`;
            emailLink.textContent = data.email;
        }
        
        // Update phone numbers
        const phoneLinks = document.querySelectorAll('.contact-section a[href^="tel:"]');
        if (phoneLinks.length > 0 && data.phone1) {
            phoneLinks[0].href = `tel:${data.phone1}`;
            phoneLinks[0].textContent = data.phone1;
            
            if (phoneLinks.length > 1 && data.phone2) {
                phoneLinks[1].href = `tel:${data.phone2}`;
                phoneLinks[1].textContent = data.phone2;
            }
        }
        
        // Update address
        const addressParagraph = document.querySelector('.contact-section .fa-location-dot').closest('.item').querySelector('.info p:last-child');
        if (addressParagraph && data.address) {
            addressParagraph.textContent = data.address;
        } else {
            console.log("Address paragraph not found", document.querySelector('.contact-section .fa-location-dot'));
        }
        
        // Update office hours
        const officeHoursParagraph = document.querySelector('.contact-section .fa-clock').closest('.item').querySelector('.info p:last-child');
        if (officeHoursParagraph && data.officeHours) {
            officeHoursParagraph.textContent = `Hours: ${data.officeHours}`;
        } else {
            console.log("Office hours paragraph not found", document.querySelector('.contact-section .fa-clock'));
        }
        
        // Update map iframe - use a more specific selector for index.html
        const mapIframe = document.querySelector('.contact-section .col-lg-7 iframe');
        if (mapIframe && data.mapUrl) {
            mapIframe.src = data.mapUrl;
            console.log("Updated map iframe with URL:", data.mapUrl);
        } else {
            console.log("Map iframe not found", document.querySelector('.contact-section .col-lg-7'));
        }
        
        // Update map link - use a more specific selector for the address link
        const mapLink = document.querySelector('.contact-section .fa-location-dot').closest('a');
        if (mapLink && data.mapLink) {
            mapLink.href = data.mapLink;
        } else {
            console.log("Map link not found", document.querySelector('.contact-section .fa-location-dot'));
        }
    }
    
    // Update the contact page information
    function updateContactPageInfo(data) {
        // Update heading
        const contactHeading = document.querySelector('.contact-list h2');
        if (contactHeading && data.contactHeading) {
            // Preserve the edit link if it exists
            const editLink = contactHeading.querySelector('.admin-edit-link');
            contactHeading.innerHTML = data.contactHeading;
            if (editLink) {
                contactHeading.appendChild(editLink);
            }
        }
        
        // Update description
        const contactDescription = document.querySelector('.contact-list p.text-center');
        if (contactDescription && data.contactDescription) {
            contactDescription.innerHTML = data.contactDescription.replace(/\n/g, '<br>');
        }
        
        // Update email
        const emailLink = document.querySelector('.contact-list a[href^="mailto:"]');
        if (emailLink && data.email) {
            emailLink.href = `mailto:${data.email}`;
            emailLink.textContent = data.email;
        }
        
        // Update phone numbers
        const phoneLinks = document.querySelectorAll('.contact-list a[href^="tel:"]');
        if (phoneLinks.length > 0 && data.phone1) {
            phoneLinks[0].href = `tel:${data.phone1}`;
            phoneLinks[0].textContent = data.phone1;
            
            if (phoneLinks.length > 1 && data.phone2) {
                phoneLinks[1].href = `tel:${data.phone2}`;
                phoneLinks[1].textContent = data.phone2;
            }
        }
        
        // Update address - use a more specific selector
        const addressParagraph = document.querySelector('.contact-list .fa-location-dot').closest('.contact-list__item').querySelector('.contact-list__info');
        if (addressParagraph && data.address) {
            addressParagraph.textContent = data.address;
        }
        
        // Update office hours - use a more specific selector
        const officeHoursParagraph = document.querySelector('.contact-list .fa-clock').closest('.contact-list__item').querySelector('.contact-list__info');
        if (officeHoursParagraph && data.officeHours) {
            officeHoursParagraph.innerHTML = `Hours: ${data.officeHours}`;
        }
        
        // Update map iframe
        const mapIframe = document.querySelector('.contact-section iframe, .contact-area iframe');
        if (mapIframe && data.mapUrl) {
            mapIframe.src = data.mapUrl;
            console.log("Updated map iframe with URL:", data.mapUrl);
        } else {
            console.log("Map iframe not found or no mapUrl provided");
        }
        
        // Update map link - use a more specific selector
        const mapLink = document.querySelector('.contact-list .fa-location-dot').closest('a');
        if (mapLink && data.mapLink) {
            mapLink.href = data.mapLink;
        }
    }

    // Function to load dynamic events on homepage
    function loadHomeEvents() {
        const eventsSection = document.getElementById('events-section');
        if (!eventsSection) return;
        
        const eventsContainer = eventsSection.querySelector('.row');
        if (!eventsContainer) return;
        
        const db = firebase.firestore();
        const eventsCollection = db.collection('events');
        
        // Loading indicator
        eventsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading events...</span>
                </div>
                <p class="mt-2">Loading events...</p>
            </div>
        `;
        
        // Get upcoming events, limit to 3, prioritize featured ones
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        eventsCollection
            .where('date', '>=', today.toISOString().split('T')[0])
            .orderBy('date', 'asc')
            .limit(6)
            .get()
            .then(snapshot => {
                let events = [];
                
                snapshot.forEach(doc => {
                    events.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                // Sort events: featured first, then by date
                events.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return new Date(a.date) - new Date(b.date);
                });
                
                // Limit to 3 events for display
                events = events.slice(0, 3);
                
                if (events.length === 0) {
                    // No upcoming events
                    eventsContainer.innerHTML = `
                        <div class="col-12 text-center py-4">
                            <p class="text-muted">No upcoming events at this time. Check back soon!</p>
                            <a href="events.html" class="btn btn-outline-primary mt-2">View Past Events</a>
                        </div>
                    `;
                    return;
                }
                
                // Clear container
                eventsContainer.innerHTML = '';
                
                // Add events
                events.forEach(event => {
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    
                    const eventUrl = event.url && event.url.includes('http') 
                        ? event.url 
                        : `event-detail.html?id=${event.id}`;
                        
                    const featuredBadge = event.featured 
                        ? '<span class="badge bg-primary ms-2">Featured</span>' 
                        : '';
                        
                    const eventHtml = `
                        <div class="col-lg-4 col-md-6">
                            <div class="blog-item">
                                <div class="blog-img">
                                    <img src="${event.image || './assets/images/music2.jpg'}" alt="${event.title}">
                                    <div class="blog-date">
                                        <span>${formattedDate}</span>
                                    </div>
                                </div>
                                <div class="blog-info">
                                    <h3 class="blog-title">
                                        <a href="${eventUrl}">
                                            <span class="blog-title">${event.title}</span>
                                            ${featuredBadge}
                                        </a>
                                    </h3>
                                    <div class="blog-meta">
                                        <span class="blog-meta-item">
                                            <i class="fa fa-map-marker-alt"></i>
                                            ${event.location || 'Location TBA'}
                                        </span>
                                    </div>
                                    <p>${event.description ? (event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description) : ''}</p>
                                    <a href="${eventUrl}" class="btn-more">Read More <i class="fa fa-angle-double-right"></i></a>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    eventsContainer.innerHTML += eventHtml;
                });
                
                // Add "View All Events" button if not already present
                const viewAllBtn = eventsSection.querySelector('.btn-more');
                if (!viewAllBtn) {
                    const btnContainer = document.createElement('div');
                    btnContainer.className = 'text-center mt-4';
                    btnContainer.innerHTML = '<a href="events.html" class="btn btn-more">View All Events</a>';
                    eventsSection.appendChild(btnContainer);
                }
            })
            .catch(error => {
                console.error("Error loading events:", error);
                eventsContainer.innerHTML = `
                    <div class="col-12 text-center py-4">
                        <p class="text-danger">Error loading events. Please refresh the page.</p>
                    </div>
                `;
            });
    }

    // Call this function when document is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Check if this is the homepage
        const isHomepage = document.location.pathname.endsWith('index.html') || 
                          document.location.pathname.endsWith('/') || 
                          document.location.pathname === '';
        
        if (isHomepage) {
            // Load dynamic events
            if (typeof firebase !== 'undefined') {
                loadHomeEvents();
            } else {
                // Firebase not loaded yet, wait and try again
                setTimeout(() => {
                    if (typeof firebase !== 'undefined') {
                        loadHomeEvents();
                    }
                }, 1000);
            }
        }
    });
} 
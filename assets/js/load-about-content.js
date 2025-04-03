/**
 * Load About Content from Firebase
 * 
 * This script loads the dynamic content for the about.html page from Firebase Firestore.
 * It uses real-time listeners to update content when changes occur in the database.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 About page content loader starting...');
    
    // Check if Firebase is initialized by load-dynamic-content.js
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error('⛔ Firebase not initialized. Make sure load-dynamic-content.js is loaded first.');
        
        // Add a visible error message on the page
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger m-3';
        errorDiv.innerHTML = `
            <strong>Error:</strong> Firebase connection failed. Please check your internet connection and try again.
            <p class="mb-0">If the problem persists, please contact the administrator.</p>
        `;
        document.body.prepend(errorDiv);
        return;
    }
    
    // Initialize Firestore
    const db = firebase.firestore();
    const aboutCollection = db.collection('aboutContent');
    
    console.log('✅ About page content loader initialized');
    
    // Load all content sections
    loadIntroSection();
    loadVisionMissionSection();
    loadFocusSection();
    loadTeamSection();
    
    /**
     * Load introduction section with real-time updates
     */
    function loadIntroSection() {
        console.log('Loading intro section');
        aboutCollection.doc('intro').onSnapshot(doc => {
            console.log('🔄 Real-time update received for intro section at', new Date().toLocaleTimeString());
            if (doc.exists) {
                const data = doc.data();
                console.log('Intro data loaded:', data);
                
                // Update heading
                const introHeading = document.querySelector('.about-intro-heading');
                if (introHeading && data.heading) {
                    introHeading.textContent = data.heading;
                }
                
                // Update paragraphs
                const introParagraph1 = document.querySelector('.about-intro-text');
                const introParagraph2 = document.querySelector('.about-intro-text + p');
                
                if (introParagraph1 && data.paragraph1) {
                    introParagraph1.innerHTML = data.paragraph1;
                }
                
                if (introParagraph2 && data.paragraph2) {
                    introParagraph2.innerHTML = data.paragraph2;
                }
                
                // Update video link
                const videoLink = document.querySelector('.about-two__video');
                if (videoLink && data.videoUrl) {
                    videoLink.href = data.videoUrl;
                }
                
                // Update video thumbnail
                const videoThumbnail = document.querySelector('#video-thumbnail');
                if (videoThumbnail && data.thumbnailImage) {
                    videoThumbnail.src = `assets/images/${data.thumbnailImage}`;
                }
            } else {
                console.log('No intro data found');
            }
        }, error => {
            console.error('Error loading intro content:', error);
        });
    }
    
    /**
     * Load vision & mission section with real-time updates
     */
    function loadVisionMissionSection() {
        console.log('Loading vision & mission section');
        aboutCollection.doc('visionMission').onSnapshot(doc => {
            console.log('🔄 Real-time update received for vision & mission section at', new Date().toLocaleTimeString());
            if (doc.exists) {
                const data = doc.data();
                console.log('Vision & mission data loaded:', data);
                
                // Update vision heading
                const visionHeading = document.querySelector('.vision-heading');
                if (visionHeading && data.visionHeading) {
                    visionHeading.textContent = data.visionHeading;
                }
                
                // Update vision text
                const visionText = document.querySelector('.vision-heading + p');
                if (visionText && data.visionText) {
                    visionText.innerHTML = data.visionText;
                }
                
                // Update vision image
                const visionImage = document.querySelector('.rounded-start');
                if (visionImage && data.visionImage) {
                    visionImage.src = `assets/images/${data.visionImage}`;
                }
                
                // Update mission heading
                const missionHeading = document.querySelector('.mission-heading');
                if (missionHeading && data.missionHeading) {
                    missionHeading.textContent = data.missionHeading;
                }
                
                // Update mission text
                const missionText = document.querySelector('.mission-text');
                if (missionText && data.missionText) {
                    missionText.innerHTML = data.missionText;
                }
                
                // Update mission image
                const missionImage = document.querySelector('.rounded-end');
                if (missionImage && data.missionImage) {
                    missionImage.src = `assets/images/${data.missionImage}`;
                }
            } else {
                console.log('No vision & mission data found, creating default data...');
                
                // Create default vision & mission document in Firestore
                aboutCollection.doc('visionMission').set({
                    visionHeading: 'Our Vision',
                    visionText: 'To create an inclusive world where knowledge and learning is accessible to all. By transforming all disciplines, digital systems, and immersive technologies to meet the diverse needs of individuals with disabilities, we hope to foster true equality across places of learning, cultural institutions and public spaces.',
                    visionImage: 'vision.jpg',
                    missionHeading: 'Our Mission',
                    missionText: 'At the Accessibility Research Centre (ARC), our mission is to address the gap between disability and discipline by making education, digital systems, and public spaces more accessible. Through teacher training, innovative technologies, and immersive solutions, we are working to ensure that all individuals, regardless of impairments, have equal access to knowledge and true empowerment.',
                    missionImage: 'mision.jpg',
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: 'System (Default)'
                }).then(() => {
                    console.log('Created default vision & mission content');
                }).catch(error => {
                    console.error('Error creating default content:', error);
                });
            }
        }, error => {
            console.error('Error loading vision & mission content:', error);
        });
    }
    
    /**
     * Load focus section with real-time updates
     */
    function loadFocusSection() {
        console.log('Loading focus section');
        aboutCollection.doc('focus').onSnapshot(doc => {
            console.log('🔄 Real-time update received for focus section at', new Date().toLocaleTimeString());
            if (doc.exists) {
                const data = doc.data();
                console.log('Focus data loaded:', data);
                
                // Update heading
                const focusHeading = document.querySelector('.focus-heading');
                if (focusHeading && data.heading) {
                    focusHeading.textContent = data.heading;
                }
                
                // Update subheading
                const focusSubheading = document.querySelector('.focus-subheading');
                if (focusSubheading && data.subheading) {
                    focusSubheading.textContent = data.subheading;
                }
                
                // Update intro text
                const focusIntro = document.querySelector('.focus-intro');
                if (focusIntro && data.introText) {
                    focusIntro.textContent = data.introText;
                }
                
                // Update focus areas
                if (data.areas && data.areas.length > 0) {
                    const focusAreasContainer = document.querySelector('.focus-areas-container');
                    if (focusAreasContainer) {
                        // Clear existing focus areas
                        focusAreasContainer.innerHTML = '';
                        
                        // Add each focus area
                        data.areas.forEach((area, index) => {
                            const focusCard = document.createElement('div');
                            focusCard.className = 'col-md-6 col-lg-6 mb-4';
                            
                            const iconPath = area.icon ? `assets/images/${area.icon}` : 'assets/images/course.svg';
                            
                            focusCard.innerHTML = `
                                <div class="focus-card position-relative overflow-hidden rounded p-4 bg-white shadow">
                                    <div class="focus-card-content">
                                        <div class="focus-icon mb-4">
                                            <img src="${iconPath}" alt="${area.title}" class="img-fluid focus-card-icon" width="60">
                                        </div>
                                        <h3 class="focus-card-title fw-bold text-secondary mb-3">${area.title}</h3>
                                        <p class="focus-card-description text-secondary mb-2">${area.description}</p>
                                    </div>
                                </div>
                            `;
                            
                            focusAreasContainer.appendChild(focusCard);
                        });
                    }
                }
            } else {
                console.log('No focus data found, creating default data...');
                
                // Create default focus document in Firestore
                aboutCollection.doc('focus').set({
                    heading: 'Our Focus Areas',
                    subheading: 'Working towards inclusive education and accessibility',
                    introText: 'We focus on these key areas to bridge the gap between disability and discipline in both education and public spaces.',
                    areas: [
                        {
                            title: 'Teacher Training',
                            description: 'Equipping educators with the skills and knowledge to create inclusive classrooms for students with various disabilities.',
                            icon: 'teacher-training.svg'
                        },
                        {
                            title: 'Digital Accessibility',
                            description: 'Developing accessible digital tools and platforms that make learning materials available to everyone.',
                            icon: 'digital-access.svg'
                        },
                        {
                            title: 'Immersive Technologies',
                            description: 'Creating AR/VR solutions that provide new ways of accessing and understanding knowledge.',
                            icon: 'immersive-tech.svg'
                        },
                        {
                            title: 'Public Space Accessibility',
                            description: 'Making cultural institutions and public spaces more inclusive through innovative accessibility solutions.',
                            icon: 'public-space.svg'
                        }
                    ],
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: 'System (Default)'
                }).then(() => {
                    console.log('Created default focus content');
                }).catch(error => {
                    console.error('Error creating default content:', error);
                });
            }
        }, error => {
            console.error('Error loading focus content:', error);
        });
    }
    
    /**
     * Load team section with real-time updates
     */
    function loadTeamSection() {
        console.log('Loading team section');
        aboutCollection.doc('team').onSnapshot(doc => {
            console.log('🔄 Real-time update received for team section at', new Date().toLocaleTimeString());
            if (doc.exists) {
                const data = doc.data();
                console.log('Team data loaded:', data);
                
                // Update heading
                const teamHeading = document.querySelector('.team-heading');
                if (teamHeading && data.heading) {
                    teamHeading.textContent = data.heading;
                }
                
                // Update team members
                if (data.members && data.members.length > 0) {
                    const teamContainer = document.querySelector('.team-members-container');
                    if (teamContainer) {
                        // Clear existing team members
                        teamContainer.innerHTML = '';
                        
                        // Sort by order
                        const sortedMembers = [...data.members].sort((a, b) => a.order - b.order);
                        
                        // Filter active members
                        const activeMembers = sortedMembers.filter(member => member.active !== false);
                        
                        // Add each team member
                        activeMembers.forEach(member => {
                            const teamCard = document.createElement('div');
                            teamCard.className = 'col-md-6 col-lg-4 mb-4';
                            
                            const photoPath = member.photo ? `assets/images/${member.photo}` : 'assets/images/team-placeholder.jpg';
                            
                            let socialLinks = '';
                            if (member.profileLink) {
                                socialLinks += `<a href="${member.profileLink}" target="_blank" class="me-2"><i class="fas fa-globe"></i></a>`;
                            }
                            if (member.linkedIn) {
                                socialLinks += `<a href="${member.linkedIn}" target="_blank"><i class="fab fa-linkedin"></i></a>`;
                            }
                            
                            teamCard.innerHTML = `
                                <div class="team-card position-relative overflow-hidden rounded shadow">
                                    <div class="team-member-photo">
                                        <img src="${photoPath}" alt="${member.name}" class="img-fluid w-100">
                                    </div>
                                    <div class="team-member-info p-3">
                                        <h4 class="team-member-name fw-bold mb-1">${member.name}</h4>
                                        <p class="team-member-title text-muted mb-2">${member.title}</p>
                                        <p class="team-member-description small mb-2">${member.description}</p>
                                        <div class="team-member-social mt-2">
                                            ${socialLinks}
                                        </div>
                                    </div>
                                </div>
                            `;
                            
                            teamContainer.appendChild(teamCard);
                        });
                    }
                }
            } else {
                console.log('No team data found, creating default data...');
                
                // Create default team document in Firestore
                aboutCollection.doc('team').set({
                    heading: 'Our Team',
                    members: [
                        {
                            name: 'Dr. Jane Smith',
                            title: 'Director',
                            description: 'Specializes in educational technology and inclusive learning environments.',
                            photo: 'team-1.jpg',
                            order: 1,
                            active: true,
                            profileLink: '',
                            linkedIn: ''
                        },
                        {
                            name: 'Dr. David Johnson',
                            title: 'Lead Researcher',
                            description: 'Expert in AR/VR technologies for accessibility in education.',
                            photo: 'team-2.jpg',
                            order: 2,
                            active: true,
                            profileLink: '',
                            linkedIn: ''
                        },
                        {
                            name: 'Dr. Emily Chen',
                            title: 'Accessibility Specialist',
                            description: 'Focuses on creating inclusive digital tools and platforms.',
                            photo: 'team-3.jpg',
                            order: 3,
                            active: true,
                            profileLink: '',
                            linkedIn: ''
                        }
                    ],
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: 'System (Default)'
                }).then(() => {
                    console.log('Created default team content');
                }).catch(error => {
                    console.error('Error creating default content:', error);
                });
            }
        }, error => {
            console.error('Error loading team content:', error);
        });
    }
}); 
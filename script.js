/* ─── Two Lads Dashboard & Swapper Controller ─── */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Custom Interactive Cursor Tracker
    const cursor = document.getElementById('allgood-cursor');
    const follower = document.getElementById('allgood-follower');

    if (cursor && follower) {
        let mouseX = 0, mouseY = 0;
        let ticking = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!ticking) {
                requestAnimationFrame(() => {
                    cursor.style.left = `${mouseX}px`;
                    cursor.style.top = `${mouseY}px`;
                    cursor.classList.add('cursor-active');
                    
                    follower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
                    follower.classList.add('cursor-active');
                    ticking = false;
                });
                ticking = true;
            }
        });

        document.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-active');
            follower.classList.remove('cursor-active');
        });

        // Register hover elements
        const hoverables = document.querySelectorAll('a, button, .work-row, .accordion-header, .metric-tile, .about-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (el.classList.contains('work-row')) {
                    document.body.classList.add('cursor-view-hover');
                } else {
                    document.body.classList.add('cursor-hover');
                }
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
                document.body.classList.remove('cursor-view-hover');
            });
        });
    }

    window.setupWorksHoverPreviews = function(customProjectsData) {
        const workRows = document.querySelectorAll('.work-row');
        
        // Remove existing listeners by cloning rows
        workRows.forEach(row => {
            const newRow = row.cloneNode(true);
            row.parentNode.replaceChild(newRow, row);
        });

        const freshWorkRows = document.querySelectorAll('.work-row');
        
        freshWorkRows.forEach(row => {
            const header = row.querySelector('.work-row-header');
            const video = row.querySelector('.work-dropdown-video');

            row.addEventListener('click', (e) => {
                if (e.target.closest('.work-dropdown-content')) {
                    return; // Ignore clicks inside the video/details area
                }

                e.stopPropagation();
                const isActive = row.classList.contains('active');

                // Collapse all other rows
                freshWorkRows.forEach(r => {
                    if (r !== row) {
                        r.classList.remove('active');
                        const v = r.querySelector('.work-dropdown-video');
                        if (v) v.pause();
                    }
                });

                if (isActive) {
                    row.classList.remove('active');
                    if (video) video.pause();
                } else {
                    row.classList.add('active');
                    if (video) {
                        video.play()
                            .catch(err => console.log('Autoplay blocked:', err));
                    }
                }
            });

            row.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            row.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });

        // Initialize state: open the first one by default!
        if (freshWorkRows.length > 0) {
            freshWorkRows.forEach((r, idx) => {
                if (idx === 0) {
                    r.classList.add('active');
                    const v = r.querySelector('.work-dropdown-video');
                    if (v) {
                        // Wait a tiny bit and play
                        setTimeout(() => {
                            v.play().catch(() => {});
                        }, 500);
                    }
                } else {
                    r.classList.remove('active');
                }
            });
        }
    };

    setupWorksHoverPreviews();

    // 4. Services Expandable Accordions
    const accordionRows = document.querySelectorAll('.accordion-row');
    accordionRows.forEach(row => {
        const header = row.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            const isOpen = row.classList.contains('open');
            
            // Close all
            accordionRows.forEach(r => r.classList.remove('open'));

            // Toggle clicked
            if (!isOpen) {
                row.classList.add('open');
            }
        });
    });

    // 5. Scroll Timeline Rail Fill Gauge & Step Highlight
    const timelineFill = document.getElementById('timeline-scroll-fill');
    const steps = document.querySelectorAll('.timeline-step');
    const processSection = document.getElementById('process');

    const updateTimelineOnScroll = () => {
        if (!processSection || !timelineFill) return;

        const rect = processSection.getBoundingClientRect();
        const winHeight = window.innerHeight;

        // Calculate scroll progress percentage inside the timeline section
        const sectionHeight = rect.height;
        const scrolledIntoSection = winHeight / 2 - rect.top;

        let progress = scrolledIntoSection / (sectionHeight - winHeight / 2);
        progress = Math.max(0, Math.min(1, progress));

        // Update rail height percentage
        timelineFill.style.height = `${progress * 100}%`;

        // Highlight step markers sequentially based on progress
        steps.forEach((step, idx) => {
            const stepThreshold = (idx + 0.3) / steps.length;
            if (progress >= stepThreshold) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', updateTimelineOnScroll);
    updateTimelineOnScroll();



    // 7. Sticky Bottom Navigation Bar (Appear after scrolling past hero)
    const botNav = document.getElementById('bot-nav');
    const heroSection = document.getElementById('hero');
    const navLinks = document.querySelectorAll('.bn-links a');
    const pageSections = document.querySelectorAll('section[id]');

    const checkBottomNavStatus = () => {
        if (!heroSection || !botNav) return;

        // Show bot-nav once user scrolls past 300px
        if (window.scrollY > 300) {
            botNav.classList.add('active');
        } else {
            botNav.classList.remove('active');
        }

        // Highlight active link in bot nav based on current section viewport
        let currentSectionId = '';
        pageSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= 120 && rect.bottom >= 120) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    };

    window.addEventListener('scroll', checkBottomNavStatus);
    checkBottomNavStatus();

    // 8. Contact Form Inquiry Submission
    const contactForm = document.getElementById('allgood-contact-form');

    if (contactForm) {
        const submitBtn = contactForm.querySelector('.btn-submit') || document.getElementById('btn-submit-allgood');
        if (submitBtn) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                submitBtn.disabled = true;
                const spanEl = submitBtn.querySelector('span');
                const originalText = spanEl ? spanEl.textContent : 'Submit Brief';
                if (spanEl) spanEl.textContent = 'Sending...';

                // Static website simulation of form submission
                setTimeout(() => {
                    if (spanEl) spanEl.textContent = 'Brief Received!';
                    submitBtn.style.background = 'var(--primary)';
                    submitBtn.style.color = '#0d0d0d';
                    contactForm.reset();

                    setTimeout(() => {
                        submitBtn.disabled = false;
                        if (spanEl) spanEl.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.style.color = '';
                    }, 4000);
                }, 1200);
            });
        }
    }

    // 9. Reels video hover playback, lightbox click, and dynamic watermark overlays
    function setupReelsHoverPlayback() {
        const carouselCards = document.querySelectorAll('.carousel-video-card, .reels-grid-card');
        carouselCards.forEach(card => {
            const video = card.querySelector('video');
            if (!video) return;

            // Append watermark logo
            if (!card.querySelector('.hover-logo-overlay')) {
                const logoOverlay = document.createElement('div');
                logoOverlay.className = 'hover-logo-overlay';
                logoOverlay.innerHTML = `<img src="assets/logo.png" alt="Two Lads Logo" class="hover-brand-logo">`;
                card.appendChild(logoOverlay);
            }

            // Removed card-loader-overlay as preloading is handled globally on page preloader startup.

            // Removed hover video playback as requested. Videos remain as static preview frames and play in lightbox when clicked.
        });
    }
    setupReelsHoverPlayback();

    // 10. Toggle Reels View (Carousel vs. Grid)
    const toggleReelsBtn = document.getElementById('toggle-reels-view');
    const endlessWrapper = document.querySelector('.endless-carousel-wrapper');
    const reelsGridLayout = document.querySelector('.reels-grid-layout');

    if (toggleReelsBtn && endlessWrapper && reelsGridLayout) {
        toggleReelsBtn.addEventListener('click', () => {
            const isGridView = reelsGridLayout.style.display === 'block';
            if (isGridView) {
                reelsGridLayout.style.display = 'none';
                endlessWrapper.style.display = 'flex';
                toggleReelsBtn.innerHTML = '<span>See All Reels</span> <i data-lucide="grid"></i>';
            } else {
                endlessWrapper.style.display = 'none';
                reelsGridLayout.style.display = 'block';
                toggleReelsBtn.innerHTML = '<span>Show Carousel</span> <i data-lucide="sliders"></i>';
            }
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }

    // 11. Endless Horizontal Autoplay and Drag Scroll helper
    const setupAutoAndDragScroll = (scrollContainer, autoSpeed) => {
        if (!scrollContainer) return;
        let dragActive = false;
        let dragStartX;
        let dragScrollLeft;
        let isHovered = false;

        // Hover handlers to pause auto-scroll
        scrollContainer.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        scrollContainer.addEventListener('mouseleave', () => {
            isHovered = false;
        });

        // Drag handlers
        scrollContainer.addEventListener('mousedown', (e) => {
            dragActive = true;
            scrollContainer.classList.add('dragging');
            dragStartX = e.pageX - scrollContainer.offsetLeft;
            dragScrollLeft = scrollContainer.scrollLeft;
        });

        document.addEventListener('mouseup', () => {
            if (dragActive) {
                dragActive = false;
                scrollContainer.classList.remove('dragging');
            }
        });

        scrollContainer.addEventListener('mousemove', (e) => {
            if (dragActive) {
                e.preventDefault();
                const x = e.pageX - scrollContainer.offsetLeft;
                const walk = (x - dragStartX) * 1.8;
                scrollContainer.scrollLeft = dragScrollLeft - walk;
            }
        });

        // Endless loop scroll wrapping threshold calculation
        const scrollContent = scrollContainer.querySelector('.carousel-row-scroll');
        if (!scrollContent) return;

        let halfWidth = 0;
        const calculateHalfWidth = () => {
            const cards = scrollContent.querySelectorAll('.carousel-video-card');
            if (cards.length > 0) {
                const halfLength = Math.floor(cards.length / 2);
                if (cards[halfLength]) {
                    halfWidth = cards[halfLength].offsetLeft;
                    return;
                }
            }
            halfWidth = scrollContent.scrollWidth / 2;
        };

        // Cache width initially and on resizing the window
        calculateHalfWidth();
        window.addEventListener('resize', calculateHalfWidth);

        // Wrap check on scroll event (uses cached halfWidth to prevent layout thrashing)
        let isWrapping = false;
        scrollContainer.addEventListener('scroll', () => {
            if (isWrapping) return;
            if (halfWidth <= 0) return;

            if (scrollContainer.scrollLeft >= halfWidth) {
                isWrapping = true;
                scrollContainer.scrollLeft -= halfWidth;
                isWrapping = false;
            } else if (scrollContainer.scrollLeft <= 0) {
                isWrapping = true;
                scrollContainer.scrollLeft += halfWidth;
                isWrapping = false;
            }
        });

        // Initial setup offset for rightward tracks
        if (autoSpeed < 0) {
            setTimeout(() => {
                scrollContainer.scrollLeft = halfWidth;
            }, 300);
        }

        // Frame loop
        const autoLoop = () => {
            if (!isHovered && !dragActive) {
                scrollContainer.scrollLeft += autoSpeed;
            }
            requestAnimationFrame(autoLoop);
        };
        setTimeout(autoLoop, 1000);
    };

    const leftTrack = document.querySelector('.left-track');
    const rightTrack = document.querySelector('.right-track');

    if (leftTrack) setupAutoAndDragScroll(leftTrack, 0.75);
    if (rightTrack) setupAutoAndDragScroll(rightTrack, -0.75);



    // 12. Typewriter Effect for Hero Headline (Humanized & Smooth, starts immediately)
    let typewriterPhrases = ["Build Iconic Brands.", "Edit Showreels.", "Scale Channels.", "Drive Viewership."];
    const typewriterEl = document.getElementById('typewriter-text');
    let phraseIdx = 0;
    let charIdx = typewriterEl ? typewriterEl.textContent.length : 0;
    let isDeleting = true; // Starts by deleting initial text smoothly

    const runTypewriter = () => {
        if (!typewriterEl) return;
        const currentPhrase = typewriterPhrases[phraseIdx];

        if (isDeleting) {
            typewriterEl.textContent = currentPhrase.substring(0, charIdx - 1);
            charIdx--;
        } else {
            typewriterEl.textContent = currentPhrase.substring(0, charIdx + 1);
            charIdx++;
        }

        let speed = isDeleting ? 35 : 85;

        if (!isDeleting && charIdx === currentPhrase.length) {
            isDeleting = true;
            speed = 1800; // pause before deleting
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % typewriterPhrases.length;
            speed = 400; // pause before writing next
        }

        setTimeout(runTypewriter, speed);
    };

    setTimeout(runTypewriter, 1000);

    // 12b. Scroll Reveal Observer for page-load and scroll animations
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach(el => revealObserver.observe(el));



    // 16. Upgraded Slideshow Lightbox (Orientation-Aware, Arrow Navigable, Keyboard Support)
    const lightbox = document.getElementById('video-lightbox');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxLoader = document.getElementById('lightbox-loader');
    const lightboxProgressFill = lightboxLoader ? lightboxLoader.querySelector('.lightbox-progress-fill') : null;
    const lightboxContainer = document.getElementById('lightbox-container');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let activeMediaList = [];
    let currentMediaIdx = 0;

    const openLightboxMedia = (idx) => {
        if (!lightbox || idx < 0 || idx >= activeMediaList.length) return;
        currentMediaIdx = idx;
        const item = activeMediaList[currentMediaIdx];

        // Instagram link resolver
        const el = item.element;
        const link = el ? el.getAttribute('data-link') : '';
        
        const instaDetails = document.getElementById('lightbox-insta-details');
        const linkEl = document.getElementById('lightbox-insta-link');
        
        if (instaDetails) {
            if (link) {
                instaDetails.style.display = 'block';
                if (linkEl) {
                    linkEl.href = link;
                }
            } else {
                instaDetails.style.display = 'none';
            }
        }

        if (lightboxVideo) {
            lightboxVideo.style.display = 'none';
            lightboxVideo.pause();
            lightboxVideo.src = '';
        }
        if (lightboxImage) {
            lightboxImage.style.display = 'none';
            lightboxImage.src = '';
        }

        if (lightboxContainer) {
            lightboxContainer.className = 'lightbox-container';
        }

        if (item.type === 'video') {
            if (lightboxVideo) {
                if (lightboxLoader) lightboxLoader.classList.add('active');
                if (lightboxProgressFill) lightboxProgressFill.style.width = '0%';
                
                lightboxVideo.src = item.src;
                lightboxVideo.style.display = 'block';
                lightboxVideo.load();
                
                const updateLightboxProgress = () => {
                    if (lightboxVideo.buffered.length > 0 && lightboxVideo.duration) {
                        const bufferedEnd = lightboxVideo.buffered.end(lightboxVideo.buffered.length - 1);
                        const percent = Math.min((bufferedEnd / lightboxVideo.duration) * 100, 100);
                        if (lightboxProgressFill) lightboxProgressFill.style.width = `${percent}%`;
                    }
                };

                lightboxVideo.onprogress = updateLightboxProgress;
                lightboxVideo.onloadedmetadata = updateLightboxProgress;
                
                const hideLoader = () => {
                    if (lightboxLoader) lightboxLoader.classList.remove('active');
                    if (lightboxProgressFill) lightboxProgressFill.style.width = '100%';
                };
                lightboxVideo.onplaying = hideLoader;
                lightboxVideo.oncanplay = hideLoader;
                lightboxVideo.onwaiting = () => {
                    if (lightboxLoader) lightboxLoader.classList.add('active');
                };
                
                lightboxVideo.onloadedmetadata = () => {
                    const aspect = lightboxVideo.videoWidth / lightboxVideo.videoHeight;
                    if (lightboxContainer) {
                        if (aspect < 1) {
                            lightboxContainer.classList.add('vertical');
                        } else {
                            lightboxContainer.classList.add('horizontal');
                        }
                    }
                    lightboxVideo.play().catch(err => console.log('Autoplay blocked:', err));
                };
            }
        } else {
            if (lightboxImage) {
                lightboxImage.src = item.src;
                lightboxImage.style.display = 'block';

                const tempImg = new Image();
                tempImg.src = item.src;
                tempImg.onload = () => {
                    const aspect = tempImg.naturalWidth / tempImg.naturalHeight;
                    if (lightboxContainer) {
                        if (aspect < 1) {
                            lightboxContainer.classList.add('vertical');
                        } else {
                            lightboxContainer.classList.add('horizontal');
                        }
                    }
                };
            }
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightboxModal = () => {
        if (lightbox) lightbox.classList.remove('active');
        if (lightboxVideo) {
            lightboxVideo.pause();
            lightboxVideo.src = '';
        }
        if (lightboxImage) {
            lightboxImage.src = '';
        }
        document.body.style.overflow = '';
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightboxModal();
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightboxModal();
            }
        });
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeMediaList.length > 1) {
                let newIdx = currentMediaIdx - 1;
                if (newIdx < 0) newIdx = activeMediaList.length - 1;
                openLightboxMedia(newIdx);
            }
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeMediaList.length > 1) {
                let newIdx = currentMediaIdx + 1;
                if (newIdx >= activeMediaList.length) newIdx = 0;
                openLightboxMedia(newIdx);
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeLightboxModal();
        } else if (e.key === 'ArrowLeft') {
            if (lightboxPrev) lightboxPrev.click();
        } else if (e.key === 'ArrowRight') {
            if (lightboxNext) lightboxNext.click();
        }
    });

    // Setup Event Delegation Click triggers for all cards in active gallery
    const setupLightboxTriggers = () => {
        const cardSelectors = [
            '.carousel-video-card',
            '.reels-grid-card'
        ];

        document.addEventListener('click', (e) => {
            const card = e.target.closest(cardSelectors.join(','));
            if (!card) return;

            e.preventDefault();

            const parentPanel = card.closest('.portfolio-tab-panel, .portfolio-panel, .reels-grid-layout, .carousel-row-scroll');
            if (!parentPanel) return;

            // Fetch siblings inside this container
            const siblingCards = Array.from(parentPanel.querySelectorAll(cardSelectors.join(',')));
            const uniqueCards = [];
            siblingCards.forEach(c => {
                if (!uniqueCards.includes(c)) uniqueCards.push(c);
            });

            activeMediaList = uniqueCards.map(c => {
                let type = 'image';
                let src = '';

                const videoEl = c.querySelector('video');
                const videoSrc = c.getAttribute('data-video');
                const imgEl = c.querySelector('img');
                const imgSrc = c.getAttribute('data-image') || c.getAttribute('data-src');

                if (videoSrc) {
                    type = 'video';
                    src = videoSrc;
                } else if (videoEl) {
                    type = 'video';
                    src = videoEl.getAttribute('src') || (videoEl.querySelector('source') ? videoEl.querySelector('source').getAttribute('src') : '');
                } else if (imgSrc) {
                    type = 'image';
                    src = imgSrc;
                } else if (imgEl) {
                    type = 'image';
                    src = imgEl.getAttribute('src');
                }

                return { type, src, element: c };
            }).filter(item => item.src);

            const clickedIdx = activeMediaList.findIndex(item => item.element === card);
            if (clickedIdx !== -1) {
                openLightboxMedia(clickedIdx);
            }
        });
    };

    setupLightboxTriggers();

    // 12. Load dynamic configuration
    function loadBackendConfig() {
        let config = window.websiteConfig;
        
        const applyConfig = (config) => {
            // 1. Set default preview video load (project 0)
            if (config.projects && Array.isArray(config.projects) && config.projects[0]) {
                const pVideo = document.getElementById('project-preview-video');
                const pTitle = document.getElementById('preview-project-title');
                const pDesc = document.getElementById('preview-project-desc');
                const pDeliv = document.getElementById('preview-project-deliv');

                if (pVideo) {
                    const sourceEl = pVideo.querySelector('source');
                    if (sourceEl) sourceEl.setAttribute('src', config.projects[0].videoSrc);
                    pVideo.src = config.projects[0].videoSrc;
                    pVideo.load();
                    pVideo.play().catch(err => console.log('Autoplay blocked:', err));
                }

                if (pTitle) pTitle.textContent = config.projects[0].title;
                if (pDesc) pDesc.textContent = config.projects[0].desc;
                if (pDeliv) pDeliv.textContent = config.projects[0].deliv;
            }



            // 3. Update about stats in DOM
            if (config.aboutStats) {
                const viewsEl = document.getElementById('about-views-num');
                const channelsEl = document.getElementById('about-channels-num');
                if (viewsEl && config.aboutStats.views) viewsEl.textContent = config.aboutStats.views;
                if (channelsEl && config.aboutStats.channels) channelsEl.textContent = config.aboutStats.channels;
            }

            // 4. Load branding (eyebrow, headlines, status, typewriter phrases)
            if (config.branding) {
                const eyebrow = document.getElementById('hero-eyebrow-text');
                const hl1 = document.getElementById('hero-headline-1');
                const hl2 = document.getElementById('hero-headline-2');
                const statusText = document.getElementById('nav-status-text');
                
                if (eyebrow && config.branding.eyebrow) eyebrow.textContent = config.branding.eyebrow;
                if (hl1 && config.branding.headlineRow1) hl1.textContent = config.branding.headlineRow1;
                if (hl2 && config.branding.headlineRow2) hl2.textContent = config.branding.headlineRow2;
                if (statusText && config.branding.status) statusText.textContent = config.branding.status;
                
                if (Array.isArray(config.branding.typewriterPhrases)) {
                    typewriterPhrases = config.branding.typewriterPhrases;
                }
            }

            // 4a. Load about section details
            if (config.about) {
                const aboutTitle = document.getElementById('about-title');
                const aboutDesc = document.getElementById('about-description');
                if (aboutTitle && config.about.title) aboutTitle.innerHTML = config.about.title;
                if (aboutDesc && config.about.description) aboutDesc.innerHTML = config.about.description;
            }

            // 4b. Load contact details
            if (config.contact) {
                const emailVal = document.getElementById('contact-email-val');
                const emailTxt = document.getElementById('contact-email-val-txt');
                const phone1Val = document.getElementById('contact-phone1-val');
                const phone2Val = document.getElementById('contact-phone2-val');
                const instaVal = document.getElementById('contact-insta-val');
                const instaTxt = document.getElementById('contact-insta-val-txt');
                
                if (emailVal && config.contact.email) {
                    emailVal.href = `mailto:${config.contact.email}`;
                    if (emailTxt) emailTxt.textContent = config.contact.email;
                }
                if (phone1Val && config.contact.phone1) {
                    const cleanPhone1 = config.contact.phone1.replace(/\s+/g, '');
                    phone1Val.href = `tel:${cleanPhone1}`;
                    phone1Val.textContent = config.contact.phone1;
                }
                if (phone2Val && config.contact.phone2) {
                    const cleanPhone2 = config.contact.phone2.replace(/\s+/g, '');
                    phone2Val.href = `tel:${cleanPhone2}`;
                    phone2Val.textContent = config.contact.phone2;
                }
                if (instaVal && config.contact.instagram) {
                    const cleanInsta = config.contact.instagram.replace('@', '');
                    instaVal.href = `https://instagram.com/${cleanInsta}`;
                    if (instaTxt) instaTxt.textContent = config.contact.instagram;
                }
            }

            // 5. Update ticker marquee items dynamically
            if (config.ticker && Array.isArray(config.ticker)) {
                const tracks = document.querySelectorAll('.logoloop-list');
                tracks.forEach(track => {
                    track.innerHTML = '';
                    const renderTrackItems = (items) => {
                        let html = '';
                        items.forEach(item => {
                            html += `<span class="logoloop-item">${item}</span>`;
                            html += `<span class="logoloop-item dot"></span>`;
                        });
                        return html;
                    };
                    const trackHtml = renderTrackItems(config.ticker) + renderTrackItems(config.ticker);
                    track.innerHTML = trackHtml;
                });
            }

            // 6. Update services expandable accordions dynamically
            const servicesAccordionContainer = document.querySelector('.services-accordion');
            if (servicesAccordionContainer && config.services && Array.isArray(config.services)) {
                servicesAccordionContainer.innerHTML = '';
                config.services.forEach((s, idx) => {
                    const num = String(idx + 1).padStart(2, '0');
                    const icons = ['share-2', 'video', 'user', 'compass', 'scissors', 'camera', 'activity'];
                    const iconName = icons[idx % icons.length] || 'sparkles';
                    
                    servicesAccordionContainer.innerHTML += `
                        <div class="accordion-row">
                            <button class="accordion-header">
                                <span class="accordion-num">${num}</span>
                                <h3 class="accordion-title">${s.title}</h3>
                                <div class="accordion-toggle">
                                    <i data-lucide="plus" class="toggle-plus"></i>
                                </div>
                            </button>
                            <div class="accordion-panel">
                                <div class="panel-inner">
                                    <div class="panel-desc">
                                        <p>${s.desc}</p>
                                    </div>
                                    <div class="panel-graphic">
                                        <i data-lucide="${iconName}" class="graphic-icon"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                // Re-bind click event listeners to new service accordions
                const accordionRows = document.querySelectorAll('.accordion-row');
                accordionRows.forEach(row => {
                    const header = row.querySelector('.accordion-header');
                    if (header) {
                        header.addEventListener('click', () => {
                            const isOpen = row.classList.contains('open');
                            accordionRows.forEach(r => r.classList.remove('open'));
                            if (!isOpen) {
                                row.classList.add('open');
                            }
                        });
                    }
                });
            }

            // 7. Update timeline steps dynamically
            if (config.timeline && Array.isArray(config.timeline)) {
                const steps = document.querySelectorAll('.timeline-step');
                steps.forEach((step, idx) => {
                    const tData = config.timeline[idx];
                    if (tData) {
                        const lblEl = step.querySelector('.step-lbl');
                        const titleEl = step.querySelector('.step-title');
                        const descEl = step.querySelector('.step-desc');
                        if (lblEl) lblEl.textContent = tData.lbl;
                        if (titleEl) titleEl.textContent = tData.title;
                        if (descEl) descEl.textContent = tData.desc;
                    }
                });
            }

            // 8. Update founders about cards dynamically
            if (config.founders && Array.isArray(config.founders)) {
                const cards = document.querySelectorAll('.about-card');
                cards.forEach((card, idx) => {
                    const fData = config.founders[idx];
                    if (fData) {
                        const titleEl = card.querySelector('h3');
                        const subEl = card.querySelector('p:first-of-type');
                        const descEl = card.querySelector('p:last-of-type');
                        if (titleEl) titleEl.textContent = fData.name;
                        if (subEl) subEl.textContent = fData.subrole;
                        if (descEl) descEl.textContent = fData.description;
                    }
                });
            }

            // 9. Update Reels dynamically (Row 1 & Row 2)
            // 9. Update Reels dynamically (Row 1 & Row 2)
            const row1Scroll = document.querySelector('.left-track .carousel-row-scroll');
            const row2Scroll = document.querySelector('.right-track .carousel-row-scroll');
            
            const getReelData = (r) => {
                if (typeof r === 'string') {
                    return { videoSrc: r, views: '', likes: '', instagramUrl: '' };
                }
                return {
                    videoSrc: r.videoSrc || '',
                    views: r.views || '',
                    likes: r.likes || '',
                    instagramUrl: r.instagramUrl || ''
                };
            };

            const renderReelCards = (reels) => {
                let html = '';
                const renderCard = (r) => {
                    const data = getReelData(r);
                    return `
                        <div class="carousel-video-card" data-video="${data.videoSrc}" data-link="${data.instagramUrl}">
                            <video loop muted playsinline preload="metadata">
                                <source src="${data.videoSrc}" type="video/mp4">
                            </video>
                        </div>
                    `;
                };
                if (Array.isArray(reels)) {
                    reels.forEach(r => html += renderCard(r));
                    reels.forEach(r => html += renderCard(r)); // Duplicate for continuous scrolling loop
                }
                return html;
            };
            if (row1Scroll && config.reelsRow1) row1Scroll.innerHTML = renderReelCards(config.reelsRow1);
            if (row2Scroll && config.reelsRow2) row2Scroll.innerHTML = renderReelCards(config.reelsRow2);



            // 11b. Update Founders dynamically
            const aboutGridRight = document.querySelector('.about-grid .reveal-right');
            if (aboutGridRight && Array.isArray(config.founders)) {
                aboutGridRight.innerHTML = '';
                config.founders.forEach(f => {
                    const avatarHtml = f.imageSrc
                        ? `<img src="${f.imageSrc}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; display: block;">`
                        : `<div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #ff7a00); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #ffffff;">${f.name.substring(0, 1)}</div>`;
                    
                    aboutGridRight.innerHTML += `
                        <div class="about-card">
                            <div style="display: flex; gap: 20px; align-items: center;">
                                ${avatarHtml}
                                <div>
                                    <h3 style="font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 4px;">${f.name}</h3>
                                    <p style="font-size: 12px; color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${f.subrole}</p>
                                </div>
                            </div>
                            <p style="font-size: 14px; color: var(--ink-2); margin-top: 20px; line-height: 1.6;">
                                ${f.description}
                            </p>
                        </div>
                    `;
                });
            }

            // 11c. Update Showcase Projects / Clients dynamically
            const worksList = document.querySelector('.works-list');
            if (worksList && config.projects && Array.isArray(config.projects)) {
                worksList.innerHTML = '';
                config.projects.forEach((proj, idx) => {
                    const activeClass = idx === 0 ? 'active' : '';
                    const num = String(idx + 1).padStart(2, '0');
                    const delivVal = proj.deliv || 'Creative Direction, Video Production, Editing';
                    worksList.innerHTML += `
                        <li class="work-row ${activeClass}" data-project="${idx}" data-video="${proj.videoSrc || ''}">
                            <div class="work-row-header">
                                <span class="work-num">${num}</span>
                                <div class="work-meta">
                                    <span class="work-name">${proj.title || ''}</span>
                                    <span class="work-category">${proj.category || ''}</span>
                                </div>
                                <span class="work-year">${proj.year || ''}</span>
                                <span class="work-arrow"><i data-lucide="chevron-down"></i></span>
                            </div>
                            <div class="work-dropdown-content">
                                <div class="work-dropdown-video-wrap">
                                    <video class="work-dropdown-video" loop muted playsinline preload="${idx === 0 ? 'auto' : 'metadata'}">
                                        <source src="${proj.videoSrc || ''}" type="video/mp4">
                                    </video>
                                </div>
                                <div class="work-dropdown-details">
                                    <p class="work-dropdown-desc">${proj.desc || ''}</p>
                                    <div class="work-dropdown-deliv-block">
                                        <span class="work-dropdown-lbl">Deliverables</span>
                                        <p class="work-dropdown-deliv">${delivVal}</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `;
                });
                
                // Re-bind hover listeners with dynamic client brief details
                if (typeof setupWorksHoverPreviews === 'function') {
                    setupWorksHoverPreviews(config.projects);
                }
            }

            // Re-setup hover triggers for newly populated videos
            setupReelsHoverPlayback();

            // Refresh lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        };

        if (window.websiteConfig) {
            applyConfig(window.websiteConfig);
        }
    }
    loadBackendConfig();
});


// ─── Preloader Loader Handler ───
window.addEventListener('load', () => {
    const preloader = document.getElementById('page-preloader');
    if (!preloader) return;

    const carouselVideos = Array.from(document.querySelectorAll('.carousel-video-card video')).slice(0, 3);
    let loadedCount = 0;
    const targetCount = carouselVideos.length;

    const startBackgroundPreloading = () => {
        const allVideos = document.querySelectorAll('.carousel-video-card video, .reels-grid-card video');
        allVideos.forEach(video => {
            if (video.preload !== 'auto') {
                video.preload = 'auto';
                video.load();
            }
        });
    };

    const fadeOutPreloader = () => {
        if (preloader.classList.contains('fade-out')) return;
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
            startBackgroundPreloading();
        }, 600);
    };

    if (carouselVideos.length === 0) {
        fadeOutPreloader();
        return;
    }

    const checkVideoLoaded = () => {
        loadedCount++;
        if (loadedCount >= targetCount) {
            fadeOutPreloader();
        }
    };

    carouselVideos.forEach(video => {
        video.preload = "auto";
        if (video.readyState >= 3) {
            checkVideoLoaded();
        } else {
            video.addEventListener('canplaythrough', checkVideoLoaded, { once: true });
            video.addEventListener('canplay', checkVideoLoaded, { once: true });
            video.addEventListener('error', checkVideoLoaded, { once: true });
        }
    });

    // Fallback: Snappier 3.5 seconds timeout to keep startup instant
    setTimeout(() => {
        fadeOutPreloader();
    }, 3500);
});

document.addEventListener('DOMContentLoaded', function() {
    // ==========================================================
    // === CORE CHATBOT UTILITIES (Defined at the top) ===
    // ==========================================================
    const chatWindow = document.getElementById('chat-window');
    
    // Function to scroll the chat window to the bottom
    const scrollToBottom = () => {
        if (chatWindow) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    };

    // Function to render a new message bubble (Now defined inside the scope)
    const renderMessage = (sender, message) => {
        if (!chatWindow) return;

        const messageContainer = document.createElement('div');
        messageContainer.classList.add('flex', 'mb-4', 'w-full');

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('px-4', 'py-3', 'rounded-xl', 'max-w-xs', 'md:max-w-md', 'break-words', 'shadow-md');

        // Styles based on sender
        if (sender === 'user') {
            messageContainer.classList.add('justify-end');
            messageBubble.classList.add('bg-pink-500', 'text-white', 'rounded-tr-none');
        } else { // sender === 'ai'
            messageContainer.classList.add('justify-start');
            messageBubble.classList.add('bg-gray-200', 'text-gray-800', 'rounded-tl-none');
        }

        // Set the message content (assumes message might contain safe HTML from Flask)
        messageBubble.innerHTML = message;

        messageContainer.appendChild(messageBubble);
        chatWindow.appendChild(messageContainer);
        scrollToBottom();
    };


    // === Initial Chat Welcome Message Check ===
    if (chatWindow) {
        // Clear the placeholder text if it exists and render the proper AI welcome
        if (chatWindow.children.length === 1 && chatWindow.children[0].textContent.includes('Hello. I am here to listen')) {
            chatWindow.innerHTML = '';
            renderMessage('ai', "👋 Hello. I am here to listen and help connect you with resources. How are you feeling today?");
        }
    }

    
    // ==========================================================
    // === 1. AI CHATBOT LOGIC (FIXED) ===
    // ==========================================================
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    if (chatForm && userInput) {
        chatForm.addEventListener('submit', async (e) => {
            // 🚨 CRITICAL FIX: STOP PAGE RELOAD
            e.preventDefault(); 
            
            const message = userInput.value.trim();
            if (message === '') return;

            // 1. Render User Message and Prepare UI
            renderMessage('user', message);
            
            // Disable input and show loading state
            userInput.value = '';
            userInput.disabled = true;
            const submitButton = chatForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            
            // Show spinning icon on button
            submitButton.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
            
            // Add a temporary "typing" indicator
            renderMessage('ai', '<span id="typing-indicator" class="italic text-gray-500">AI Companion is thinking...</span>');
            
            // 2. Send Message to Flask Backend (Fetch)
            try {
                const response = await fetch('/chat', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message })
                });

                const data = await response.json();
                
                // Remove typing indicator
                const typingIndicator = document.getElementById('typing-indicator');
                if (typingIndicator && typingIndicator.parentNode) {
                    typingIndicator.parentNode.remove();
                }

                if (response.ok) {
                    // Render the AI's response
                    renderMessage('ai', data.response); 
                } else {
                    renderMessage('ai', `<span class="text-red-600 font-bold">Error: ${data.error || 'Server responded with an error.'}</span>`);
                }

            } catch (error) {
                console.error('Fetch error:', error);
                // Remove typing indicator
                const typingIndicator = document.getElementById('typing-indicator');
                if (typingIndicator && typingIndicator.parentNode) {
                    typingIndicator.parentNode.remove();
                }
                renderMessage('ai', `<span class="text-red-600 font-bold">Network Error: Could not connect to the server. Please check your network.</span>`);
            } finally {
                // Re-enable input and reset button UI
                userInput.disabled = false;
                submitButton.disabled = false;
                submitButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;
                userInput.focus();
            }
        });
    }

    
    // ==========================================================
    // === 2. NAVIGATION TOGGLE LOGIC ===
    // ==========================================================
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
        });

        // Close menu when a link is clicked (for mobile)
        document.querySelectorAll('#nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (!navMenu.classList.contains('hidden')) {
                    navMenu.classList.add('hidden');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    

    // ==========================================================
    // === 3. CONTACT FORM SUBMISSION AND MODAL LOGIC ===
    // ==========================================================
    const userForm = document.getElementById('user-form');
    const modal = document.getElementById('thank-you-modal');
    const modalText = document.getElementById('modal-text');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (userForm) {
        userForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevents page reload for this form too
            const nameInput = document.getElementById('name');
            const name = nameInput.value;

            // Simple submission logic:
            if (modal && modalText) {
                modalText.textContent = `Thank you, ${name}! Your information has been submitted.`;
                modal.classList.remove('hidden');
                // You would send the data to your Flask/backend here
                console.log('User contact form submitted successfully.'); 
                userForm.reset();
            } else {
                 alert(`Thank you, ${name}. Your information has been recorded.`);
            }
        });
    }
    
    if (modalCloseBtn && modal) {
        modalCloseBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }


    // ==========================================================
    // === 4. DYNAMIC STORIES ACCORDION LOGIC ===
    // ==========================================================
    const storiesData = [
        { title: "Finding My Voice Again", content: "For a long time, I felt like a ghost in my own life..." },
        { title: "A New Beginning", content: "Leaving my past behind seemed impossible..." },
        { title: "Scars Don't Define Us", content: "I used to hide my scars, both visible and invisible..." }
    ];

    const storiesContainer = document.getElementById('stories-container');

    if (storiesContainer) {
        storiesData.forEach((story, index) => {
            const storyElement = document.createElement('div');
            storyElement.classList.add('border-b', 'border-pink-200', 'pb-4');
            storyElement.innerHTML = `
                <div class="flex justify-between items-center cursor-pointer py-2 px-4 bg-pink-100 hover:bg-pink-200 rounded-md transition-colors duration-200" role="button" aria-expanded="false" aria-controls="story-content-${index}">
                    <h3 class="font-semibold text-lg text-pink-700">${story.title}</h3>
                    <svg class="accordion-arrow h-5 w-5 text-pink-500 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div id="story-content-${index}" class="story-content hidden mt-2 px-4 py-2 text-gray-700 leading-relaxed">
                    <p>${story.content}</p>
                </div>
            `;
            storiesContainer.appendChild(storyElement);
        });

        // Accordion toggle listener
        document.querySelectorAll('#stories-container [role="button"]').forEach(button => {
            button.addEventListener('click', () => {
                const content = document.getElementById(button.getAttribute('aria-controls'));
                const arrow = button.querySelector('.accordion-arrow');
                const isExpanded = button.getAttribute('aria-expanded') === 'true';

                if (isExpanded) {
                    content.classList.add('hidden');
                    arrow.classList.remove('rotated');
                    button.setAttribute('aria-expanded', 'false');
                } else {
                    content.classList.remove('hidden');
                    arrow.classList.add('rotated'); // Assuming 'rotated' class flips the arrow 
                    button.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }


    // ==========================================================
    // === 5. EMAIL SIGN-UP MODAL LOGIC ===
    // ==========================================================
    const signupForm = document.getElementById('community-form');
    const signupModal = document.getElementById('signup-modal');
    const signupModalCloseBtn = document.getElementById('modal-close-btn-signup');

    function showSignupModal() {
        if (signupModal) {
            signupModal.classList.remove('hidden');
            signupModal.classList.add('flex');
        }
    }

    function hideSignupModal() {
        if (signupModal) {
            signupModal.classList.add('hidden');
            signupModal.classList.remove('flex');
        }
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showSignupModal();
            signupForm.reset();
        });
    }

    if (signupModalCloseBtn) {
        signupModalCloseBtn.addEventListener('click', hideSignupModal);
    }
    
    if (signupModal) {
        signupModal.addEventListener('click', (e) => {
            if (e.target === signupModal) {
                hideSignupModal();
            }
        });
    }
// 1. Dial a hotline directly (Kenya GBV Hotline)
function triggerSOS() {
  const confirmCall = confirm("Are you sure you want to contact the GBV Helpline (1195)?");
  if (confirmCall) {
    window.location.href = "tel:1195";
  }
}

//  2. Or get the user's GPS location for alert purposes
function triggerSOS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        alert(` Location captured!\nLatitude: ${pos.coords.latitude}\nLongitude: ${pos.coords.longitude}`);
        // Here, you could send the location to your Flask backend for help logging.
      },
      (err) => {
        alert("Unable to access your location. Please check permissions!");
      }
    );
  } else {
    alert("Geolocation not supported on this browser.");
  }
}


    // ==========================================================
    // === 6. ACTIVE NAV LINK HIGHLIGHTING ===
    // ==========================================================
    // Note: This feature assumes your nav links use the correct href format (e.g., href="#welcome")
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length > 0 && navLinks.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const link = document.querySelector(`.nav-link[href*="#${entry.target.id}"]`);
                if (link) {
                    if (entry.isIntersecting) {
                        navLinks.forEach(l => l.classList.remove('active')); // Remove from all
                        link.classList.add('active'); // Add to the intersecting one
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }
});
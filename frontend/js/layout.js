document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    // Toggle sidebar on mobile
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Handle section toggling for SPA-like feel
    const navLinks = document.querySelectorAll('.sidebar-nav a[data-target]');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (targetId) {
                e.preventDefault();
                
                // Update active link
                document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Show target section
                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    }
                });

                // Close sidebar on mobile after clicking a link
                if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }
        });
    });

    // Handle Chatbot click to open floating widget
    const chatbotLink = document.getElementById('sidebarChatbotBtn');
    if (chatbotLink) {
        chatbotLink.addEventListener('click', (e) => {
            e.preventDefault();
            const chatToggle = document.getElementById('chat-toggle');
            if (chatToggle) {
                chatToggle.click(); // simulate click to open the existing widget
            }
        });
    }
});

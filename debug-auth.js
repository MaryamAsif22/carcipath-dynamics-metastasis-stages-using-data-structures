console.log("DEBUG: debug-auth.js LOADED");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded fired in debug-auth.js");

    const tabContainer = document.querySelector('.auth-tabs');
    if (tabContainer) {
        console.log("DEBUG: Tab container found");
        tabContainer.addEventListener('click', (e) => {
            console.log("DEBUG: Tab container clicked");
            const tab = e.target.closest('.auth-tab');
            if (!tab) return;

            console.log("DEBUG: Tab clicked", tab.innerText);

            // Remove active classes
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => {
                f.classList.remove('active');
                f.style.display = 'none'; // Force hide
            });

            // Activate clicked tab
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const targetForm = document.getElementById(targetId);
            if (targetForm) {
                targetForm.classList.add('active');
                targetForm.style.display = 'flex'; // Force show
                console.log(`DEBUG: Switched to ${targetId}`);
            } else {
                console.error(`DEBUG: Target form ${targetId} not found`);
            }
        });
    } else {
        console.error("DEBUG: Tab container .auth-tabs NOT FOUND");
    }
});

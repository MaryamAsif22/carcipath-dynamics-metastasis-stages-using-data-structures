/**
 * organ_svgs.js
 * Inline Vector Graphics for Medical Organs.
 * Ensures icons always load without external image dependencies.
 */

const OrganSVGs = {
    // --- MAIN ORGANS ---
    'Lungs': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25,30 Q10,30 10,60 Q10,90 30,90 Q45,90 45,60 Q45,40 25,30 Z M75,30 Q90,30 90,60 Q90,90 70,90 Q55,90 55,60 Q55,40 75,30 Z" fill="%23ff9999" stroke="%23cc0000" stroke-width="2"/><path d="M48,20 L48,50 M52,20 L52,50" stroke="%23880000" stroke-width="3"/></svg>`,

    'Brain': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,50 Q20,20 50,20 Q80,20 80,50 Q80,80 50,80 Q20,80 20,50 Z" fill="%23ffcccc" stroke="%23aa5555" stroke-width="2"/><path d="M30,40 Q40,30 50,40 Q60,50 70,40 M30,60 Q40,70 50,60 Q60,50 70,60" fill="none" stroke="%23aa5555" stroke-width="2"/></svg>`,
    'Heart': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,90 Q10,50 20,30 Q30,10 50,30 Q70,10 80,30 Q90,50 50,90 Z" fill="%23cc0000" stroke="%23800000" stroke-width="2"/><path d="M30,30 L40,40 M60,30 L70,40" stroke="%23660000" stroke-width="2"/></svg>`,
    'Liver': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10,60 Q10,30 50,30 Q90,30 90,60 L80,80 Q50,70 10,60 Z" fill="%23b34d4d" stroke="%23800000" stroke-width="2"/></svg>`,
    'Breast': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23ffccaa" stroke="%23d4a373" stroke-width="2"/><circle cx="50" cy="50" r="10" fill="%23d4a373"/></svg>`,
    'Colon': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,80 Q20,20 50,20 Q80,20 80,80" fill="none" stroke="%23ffaa44" stroke-width="15" stroke-linecap="round"/><path d="M20,80 Q20,20 50,20 Q80,20 80,80" fill="none" stroke="%23cc8800" stroke-width="2" stroke-dasharray="5,5"/></svg>`,

    // --- PATHWAYS ---
    'Blood Stream': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23ffcccc" stroke="%23ff0000" stroke-width="2"/><circle cx="30" cy="50" r="10" fill="red"/><circle cx="70" cy="50" r="10" fill="red"/></svg>`,
    'Lymph Node': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23ccffcc" stroke="%2300ff00" stroke-width="2"/><path d="M20,50 L80,50 M50,20 L50,80" stroke="%23009900" stroke-width="2"/></svg>`,
    'Vena Cava': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="10" width="40" height="80" rx="10" fill="%23ccccff" stroke="%230000ff" stroke-width="2"/></svg>`,
    'Aorta': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M30,90 Q30,10 50,10 Q70,10 70,90" fill="none" stroke="%23ff0000" stroke-width="20"/></svg>`,

    // Fallback
    'default': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23dddddd" stroke="%23333333" stroke-width="2"/></svg>`
};

// EXPORT TO WINDOW
window.OrganSVGs = OrganSVGs;
console.log("OrganSVGs Loaded:", Object.keys(OrganSVGs));

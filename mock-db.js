/**
 * mock-db.js
 * 
 * Expanded dataset representing major human body systems.
 */

const MockDB = {
    initialData: {
        organs: [
            // --- ROW 1: TOP (Y=80) ---
            { id: 'Brain', x: 600, y: 60, group: 'Nervous' },
            { id: 'Trachea', x: 250, y: 60, group: 'Respiratory' },
            { id: 'Lymph Nodes (Neck)', x: 420, y: 80, group: 'Lymphatic' },

            // --- ROW 2: CHEST (Y=200-240) ---
            { id: 'Lungs', x: 100, y: 200, group: 'Respiratory' },
            { id: 'Bronchi', x: 250, y: 180, group: 'Respiratory' },
            { id: 'Aorta', x: 550, y: 200, group: 'Circulatory' },
            { id: 'Breast', x: 700, y: 220, group: 'Reproductive' },

            // --- ROW 3: CORE (Y=320-350) ---
            { id: 'Heart', x: 400, y: 320, group: 'Circulatory' },
            { id: 'Vena Cava', x: 250, y: 300, group: 'Circulatory' },
            { id: 'Lymph Nodes (Axillary)', x: 100, y: 350, group: 'Lymphatic' },
            { id: 'Liver', x: 550, y: 340, group: 'Digestive' },

            // --- ROW 4: ABDOMEN (Y=450-480) ---
            { id: 'Stomach', x: 250, y: 450, group: 'Digestive' },
            { id: 'Spleen', x: 100, y: 480, group: 'Lymphatic' },
            { id: 'Pancreas', x: 400, y: 460, group: 'Digestive' },
            { id: 'Kidneys', x: 550, y: 470, group: 'Excretory' },
            { id: 'Spinal Cord', x: 700, y: 400, group: 'Nervous' },

            // --- ROW 5: LOWER BODY (Y=580+) ---
            { id: 'Intestines', x: 300, y: 560, group: 'Digestive' },
            { id: 'Colon', x: 450, y: 600, group: 'Digestive' },
            { id: 'Prostate', x: 600, y: 580, group: 'Reproductive' },
            { id: 'Bone Marrow', x: 750, y: 550, group: 'Skeletal' }
        ],
        pathways: [
            ['Trachea', 'Bronchi'],
            ['Bronchi', 'Lungs'],
            ['Lungs', 'Heart'],

            ['Heart', 'Aorta'],
            ['Heart', 'Vena Cava'],
            ['Aorta', 'Brain'],
            ['Aorta', 'Liver'],
            ['Aorta', 'Kidneys'],
            ['Aorta', 'Stomach'],
            ['Vena Cava', 'Heart'],

            ['Stomach', 'Intestines'],
            ['Intestines', 'Colon'],
            ['Liver', 'Vena Cava'],
            ['Liver', 'Pancreas'],

            ['Lungs', 'Lymph Nodes (Neck)'],
            ['Heart', 'Lymph Nodes (Axillary)'],
            ['Stomach', 'Spleen'],
            ['Spleen', 'Lymph Nodes (Axillary)'],

            ['Kidneys', 'Bone Marrow'],
            ['Prostate', 'Bone Marrow'],
            ['Colon', 'Liver'],
            ['Breast', 'Lymph Nodes (Axillary)']
        ]
    },

    fetchGraphData: function () {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.initialData);
            }, 100);
        });
    },

    // --- REALISTIC PATHWAY GENERATOR ---
    fetchRealisticPath: async function (source, target) {
        // Return a subgraph specific to the pair
        const paths = {
            'Lungs-Brain': [
                { id: 'Lungs', type: 'organ', x: 100, y: 300 },
                { id: 'Pulmonary Vein', type: 'vessel', x: 250, y: 300 },
                { id: 'Heart', type: 'organ', x: 400, y: 300 },
                { id: 'Carotid Artery', type: 'vessel', x: 550, y: 200 },
                { id: 'Brain', type: 'target', x: 700, y: 100 }
            ],
            'Breast-Brain': [
                { id: 'Breast', type: 'organ', x: 100, y: 400 },
                { id: 'Axillary Nodes', type: 'lymph', x: 250, y: 400 },
                { id: 'Lymphatic Duct', type: 'lymph', x: 400, y: 350 },
                { id: 'Blood Stream', type: 'vessel', x: 550, y: 250 },
                { id: 'Brain', type: 'target', x: 700, y: 100 }
            ],
            'Colon-Liver': [
                { id: 'Colon', type: 'organ', x: 100, y: 500 },
                { id: 'Mesenteric Vein', type: 'vessel', x: 300, y: 500 },
                { id: 'Portal Vein', type: 'vessel', x: 500, y: 500 },
                { id: 'Liver', type: 'target', x: 700, y: 500 }
            ],
            'Prostate-Bone Marrow': [
                { id: 'Prostate', type: 'organ', x: 100, y: 500 },
                { id: 'Prostatic Venous Plexus', type: 'vessel', x: 300, y: 400 },
                { id: 'Batson Venous Plexus', type: 'vessel', x: 500, y: 300 },
                { id: 'Vertebral Veins', type: 'vessel', x: 600, y: 250 },
                { id: 'Bone Marrow', type: 'target', x: 750, y: 200 }
            ]
        };

        const key = `${source}-${target}`;
        const nodes = paths[key] || [
            { id: source, type: 'organ', x: 100, y: 300 },
            { id: 'General Circulation', type: 'vessel', x: 400, y: 300 },
            { id: target, type: 'target', x: 700, y: 300 }
        ];

        // Auto-generate edges
        const edges = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            edges.push([nodes[i].id, nodes[i + 1].id]);
        }

        return { x_nodes: nodes, x_edges: edges };
    }
};

window.MockDB = MockDB;

# 🧬 CarciPath Dynamics

CarciPath Dynamics (CarciPath Medical Suite) is a **web-based educational and simulation tool** for understanding carcinoma (cancer) metastasis pathways.  
It bridges **computer science education** with **medical simulation**, allowing users to explore cancer spread, learn data structures and algorithms, and visualize infection dynamics in real time.

---

## 🌟 Key Features

### 🔐 Authentication System
- User login, registration, and password reset
- Session management with `localStorage`

### 👩‍⚕️ Patient Management
- Create and manage patient profiles with medical data
- Store records in a mock database
- Load patients for simulation and analytics

### 🧪 Metastasis Simulation
- **BFS Algorithm**: Models infection spread through organ graphs
- **DFS Algorithm**: Alternative traversal for exploring deeper metastasis pathways
- Real-time visualization with canvas-based cell animations
- Interactive controls: start, stop, reset
- Live charts tracking infection progress
- Path highlighting with animated edges

### 📊 Analytics Dashboard
- Patient severity charts and risk assessment
- **Binary Search Tree (BST)** for patient data analysis
- Tree visualization with search path logging
- Performance comparison: linear vs BST search

### 🎓 Educational Modules
- **Stack (LIFO)**: DNA mutation accumulation and repair
- **Queue (FIFO)**: General operations
- **MaxHeap (Priority Queue)**: Organ treatment prioritization
- **Graph**: Organ connectivity and metastasis pathways
- **BFS & DFS**: Graph traversal algorithms for infection spread and educational demos
- **BST**: Patient data organization and search optimization
- Interactive modules for hands-on learning

### 🎨 Theming & UI
- Multiple themes: Light, Dark, Charcoal, Navy
- Responsive design optimized for medical/research interfaces
- Real-time theme switching

### 🤖 AI Integration
- AI toggle for mock status simulation
- Research mode for advanced exploration
- Intelligent suggestions for learning and simulation

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Frameworks/Libraries**: Chart.js, FontAwesome, Google Fonts
- **Backend/Server**: Python HTTP server (`python -m http.server 8000`)
- **Data Structures & Algorithms**: BFS, DFS, Stack, Queue, MaxHeap, Graph, BST
- **Architecture**: MVC-like (Model: data structures, View: HTML/CSS, Controller: app.js)

---

## 📂 Project Structure

- `index.html` → Main UI layout  
- `style.css` → Complete styling and theming  
- `app.js` → Core application logic and controller  
- `simulation.js` → BFS/DFS-based metastasis simulation engine  
- `data-structures.js` → Custom implementations (Stack, Queue, Heap, Graph, BST)  
- `auth-logic.js` → Authentication system  
- `mock-db.js` → Sample patient and organ pathway data  
- `script.js` → Graph-based visualization prototype  
- `assets/` → Static resources (icons, images, SVGs)

---

## 🚀 How to Run

1. Start the local server:
   ```bash
   python -m http.server 8000

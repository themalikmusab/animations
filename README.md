# 🎯 Projectile Motion Simulator

An interactive HTML5 physics simulation for education - inspired by PhET simulations.

## 🚀 Features

### Accurate Physics
- **Projectile motion equations** with real physics (not game physics)
- **Air resistance modeling** using drag force equations
- **Numerical integration** for smooth, accurate simulation
- **Multiple gravity settings** (Earth, Moon, Mars, Jupiter)

### Interactive Controls
- Adjustable initial velocity (0-30 m/s)
- Launch angle control (0-90°)
- Mass adjustment (0.1-10 kg)
- Diameter control (0.1-2 m)
- Air resistance toggle
- Vector visualization toggle
- Trajectory path display

### Real-Time Data
- Flight time
- Current range and height
- Maximum height reached
- Current velocity
- Real-time position tracking

### Visual Features
- Smooth animations at 60 FPS
- Velocity vectors (green arrows)
- Gravity vectors (blue arrows)
- Trajectory path tracing
- Grid with measurements
- Professional PhET-style UI

## 📖 How to Use

### Option 1: Open Directly
Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js
npx http-server
```

Then navigate to `http://localhost:8000`

## 🎮 Controls

### Mouse Controls
- Adjust sliders to change parameters
- Click "Fire" to launch projectile
- Use checkboxes to toggle features

### Keyboard Shortcuts
- `SPACE` - Fire projectile
- `P` - Pause/Play simulation
- `R` - Reset simulation

## 🔬 Educational Use

### Physics Concepts Demonstrated
1. **Kinematics** - Position, velocity, acceleration relationships
2. **Projectile Motion** - Parabolic trajectories
3. **Vector Components** - Horizontal and vertical motion independence
4. **Energy Conservation** - Kinetic and potential energy
5. **Air Resistance** - Drag forces and terminal velocity
6. **Gravity Variations** - Effects of different gravitational fields

### Suggested Experiments
1. Find the optimal angle for maximum range (hint: ~45° without air resistance)
2. Compare trajectories with and without air resistance
3. Observe how mass affects motion with air resistance
4. Explore motion in different gravitational environments
5. Investigate the relationship between launch angle and flight time

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas** - Hardware-accelerated rendering
- **Vanilla JavaScript** - No dependencies, pure JS
- **CSS3** - Modern responsive design

### Physics Implementation
- **No Air Resistance**: Analytical solution using kinematic equations
- **With Air Resistance**: Numerical integration using Euler method
- **Drag Force**: F_d = ½ρv²C_dA (ρ=air density, C_d=drag coefficient, A=cross-sectional area)

### Code Structure
```
animations/
├── index.html          # Main HTML structure with tabs
├── css/
│   └── style.css      # PhET-inspired styling (9.4 KB)
├── js/
│   ├── physics.js     # Physics engine with wind (7.3 KB)
│   ├── graphs.js      # Real-time graphing system (11 KB)
│   ├── tools.js       # Measurement & export tools (12 KB)
│   ├── ui.js          # Canvas rendering (9.1 KB)
│   └── main.js        # Main controller (25 KB)
├── assets/            # Ready for images
└── README.md          # This file
```

## 🎓 For Educators

This simulation can be used for:
- **Lectures** - Demonstrate concepts visually
- **Lab Activities** - Students collect data and analyze
- **Homework** - Exploration and hypothesis testing
- **Problem Solving** - Verify calculations

### Learning Objectives
Students will be able to:
- Predict projectile trajectories
- Understand vector decomposition
- Analyze the effects of air resistance
- Compare theoretical and real-world motion
- Collect and interpret experimental data

## ✅ Advanced Features (IMPLEMENTED!)

- [x] **Real-time position vs time graphs** - Multi-line graphs with auto-scaling
- [x] **Velocity vs time graphs** - Vx and Vy components visualized
- [x] **Multiple projectile comparison** - Compare up to 6 different trajectories
- [x] **Slow motion controls** - Variable speed from 0.1x to 2.0x
- [x] **Data export (CSV & JSON)** - Export flight data for analysis
- [x] **Virtual tape measure tool** - Click & drag measurement system
- [x] **Trajectory predictor overlay** - See predicted path before firing
- [x] **Wind resistance simulation** - Headwind/tailwind effects (-10 to +10 m/s)
- [x] **Target practice mode** - Game mode with scoring system
- [x] **Analysis tab** - Compare theoretical vs actual results
- [x] **Energy tracking** - Real-time KE and PE calculations
- [x] **Tab navigation** - 4 modes: Simulation, Graphs, Analysis, Target Practice

## 🚧 Future Enhancements (v2.0)

- [ ] 3D trajectory visualization
- [ ] Mobile touch support
- [ ] Sound effects for launches and hits
- [ ] Save/load simulation configurations
- [ ] Leaderboard for target practice
- [ ] More sophisticated drag models (Reynolds number)
- [ ] Spin effects (Magnus force)
- [ ] Custom background images

## 📝 License

Educational use - Free and open source

## 🙏 Acknowledgments

Inspired by the excellent PhET Interactive Simulations (University of Colorado Boulder)
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
├── index.html          # Main HTML structure
├── css/
│   └── style.css      # PhET-inspired styling
├── js/
│   ├── physics.js     # Physics engine and calculations
│   ├── ui.js          # Rendering and visualization
│   └── main.js        # Application controller
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

## 🚧 Future Enhancements (Planned)

- [ ] Real-time position vs time graphs
- [ ] Velocity vs time graphs
- [ ] Multiple projectile comparison
- [ ] Slow motion controls
- [ ] Zoom and pan functionality
- [ ] Data export (CSV)
- [ ] Virtual tape measure tool
- [ ] Angle predictor overlay
- [ ] Wind resistance simulation
- [ ] Target practice mode

## 📝 License

Educational use - Free and open source

## 🙏 Acknowledgments

Inspired by the excellent PhET Interactive Simulations (University of Colorado Boulder)
# 🧪 Testing the Projectile Motion Simulator

## Quick Start Testing

### 1. Open the Simulation

**Option A: Direct File Open**
```bash
cd /home/user/animations
# Simply double-click index.html in your file manager
# OR open with your browser directly
```

**Option B: Local Server (Recommended)**
```bash
cd /home/user/animations
python3 -m http.server 8000
# Then open: http://localhost:8000
```

### 2. Open Browser Console

**IMPORTANT:** Open the browser developer console to see debug messages!

- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I`
- **Firefox**: Press `F12` or `Ctrl+Shift+K`
- **Safari**: Press `Cmd+Option+I`

### 3. Test the Fire Button

1. **Adjust Settings** (optional):
   - Velocity: 20 m/s
   - Angle: 45°
   - Keep other defaults

2. **Click the 🚀 Fire Button**

3. **Watch the Console** - You should see:
   ```
   🚀 FIRE! Creating projectile with params: {velocity: 20, angle: 45, ...}
   ✅ Projectile created and launched: {isFlying: true, position: {...}, velocity: 20}
   ⚽ Drawing ball at: {world: {x: 0, y: 0}, screen: {...}, radius: 5, isFlying: true}
   📊 Rendering projectiles: {count: 1, currentFlying: true, ...}
   ```

4. **Watch the Canvas** - You should see:
   - 🎆 Explosion particle effect from cannon
   - ⚽ Red ball launching from bottom-left
   - 💨 Smoke trail following the ball
   - 📈 Parabolic trajectory path
   - 💥 Impact explosion when it lands

## What to Check

### ✅ Fire Button Works If:
- Console shows "🚀 FIRE! Creating projectile..."
- Console shows "✅ Projectile created and launched"
- Console shows "⚽ Drawing ball at..."
- You see a red ball moving on screen
- You see particle effects

### ❌ Fire Button Broken If:
- **Nothing in console** → Button not connected (check HTML)
- **"🚀 FIRE!" but no "✅"** → Projectile creation failed
- **"✅" but no "⚽"** → Rendering issue
- **Errors in console** → JavaScript error (send error to developer)

## Visual Features to Test

### 1. Launch Effects
- Click Fire
- Should see explosive burst from cannon
- Should see ground dust particles
- Should hear launch sound (if audio enabled)

### 2. Ball Movement
- Ball should move in parabolic arc
- Ball should have 3D appearance (shadow, highlight)
- Ball should leave motion blur trail behind it
- Fast balls should emit smoke particles

### 3. Impact
- When ball lands, should see:
  - Debris spray particles
  - Dust cloud rising
  - Ground flash effect
  - Impact sound

### 4. Graphs Tab
- Click "Graphs" tab
- Click Fire
- Should see real-time graphs:
  - Position vs Time (x and y)
  - Velocity vs Time (vx and vy)
  - Height vs Time

### 5. Target Practice
- Click "Target Practice" tab
- Click "Activate Target Mode"
- Click Fire
- Hit a target to see:
  - Golden confetti burst
  - Success sound
  - Score update
  - Target hit confetti effect

## Keyboard Shortcuts Test

Press each key and verify:
- **SPACE** → Launches projectile
- **P** → Pauses/Plays animation
- **R** → Resets simulation (clears ball)
- **~** (backtick) → Shows FPS counter in top-left

## Performance Monitor

1. Press **~** (tilde/backtick key)
2. Should see black box in top-left corner showing:
   ```
   FPS: 60
   Particles: 150
   ```
3. Press **~** again to hide it

## Common Issues & Solutions

### Issue: "Fire button does nothing"

**Solution 1: Check Console**
```
1. Open browser console (F12)
2. Click Fire button
3. Look for errors in red
4. Send screenshot of error to developer
```

**Solution 2: Clear Cache**
```
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Close and reopen browser
3. Try again
```

### Issue: "I see console messages but no ball"

**Solution: Check Render Logs**
```
Look for "⚽ Drawing ball at:" in console
- If you see it: Rendering is working, ball might be off-screen
  → Try angle=45°, velocity=15 m/s
- If you don't see it: Ball not being created properly
  → Check if isFlying=true in "✅ Projectile created" message
```

### Issue: "Ball moves but no particle effects"

**Solution: This is normal if:**
- Particle system failed to load (fallback mode)
- Browser doesn't support features
- The simulation works, just without fancy effects

**Check Console for:**
```
"Visual system update error: ..."
"Launch effect error: ..."
```

If you see these, particle effects are disabled but simulation works fine.

### Issue: "Graphs are blank"

**Solution:**
```
1. Click "Graphs" tab FIRST
2. THEN click Fire button
3. Graph should populate in real-time
4. If still blank, check console for errors
```

### Issue: "Performance is slow / laggy"

**Solution:**
```
1. Press ~ to see FPS
2. If FPS < 30:
   - Close other browser tabs
   - Disable particle effects (if option available)
   - Use smaller canvas size
3. If FPS = 60 but feels slow:
   - Adjust simulation speed slider
```

## Expected Performance

- **FPS**: 60 (solid)
- **Particles**: 0-500 depending on activity
- **Smooth ball motion**: Yes
- **No frame drops**: Correct
- **Particle effects**: Yes (or graceful fallback)

## Debug Commands (Browser Console)

You can type these in the browser console:

```javascript
// Check if app is loaded
window.app

// Check current projectile
window.app.currentProjectile

// Check if projectile is flying
window.app.currentProjectile.isFlying

// Fire projectile from console
window.app.fireProjectile()

// Check renderer
window.app.renderer.particleSystem

// Force fire even if button doesn't work
window.app.createProjectile();
window.app.currentProjectile.launch();
```

## Reporting Issues

If fire button doesn't work, include this info:

1. **Browser**: Chrome/Firefox/Safari/Edge + version
2. **Console Output**: Copy all console messages
3. **Error Messages**: Screenshot any red errors
4. **What You See**: Describe visual behavior
5. **What You Expected**: What should happen

Example Good Report:
```
Browser: Chrome 120
Issue: Fire button doesn't launch ball
Console Output:
  🚀 FIRE! Creating projectile...
  ✅ Projectile created and launched: {isFlying: true, ...}
  ⚽ Drawing ball at: {world: {x: 0, y: 0}, screen: {x: 80, y: 520}, ...}
Visual: I see particles but no ball
Expected: Should see red ball moving
```

## Success Criteria

The simulation is working correctly if:
- ✅ Fire button triggers console log "🚀 FIRE!"
- ✅ Ball appears on screen (red circle)
- ✅ Ball follows parabolic path
- ✅ Graphs show data when fired
- ✅ No red errors in console
- ✅ FPS stays at or near 60

Nice-to-have (but not required):
- 🎨 Particle effects working
- 🔊 Sound effects playing
- ⚡ Performance monitor accessible

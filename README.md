# PS5 Controller Overlay

A real-time visual overlay for monitoring PS5 controller inputs in your browser. Perfect for streaming, recording, or testing controller functionality.

## Features

✨ **Full Controller Support**
- D-Pad and all face buttons (Triangle, Circle, Square, Cross)
- Both analog sticks with visual feedback
- Shoulder buttons (L1, L2, R1, R2)
- Touchpad interaction
- Share, Options, and PS buttons
- Real-time button press logging

## How to Use

### 1. **Open in Browser**
Simply open `index.html` in your web browser (double-click the file or drag it into your browser).

### 2. **Connect Your PS5 Controller**
- **USB Cable**: Connect your PS5 controller to your computer via USB-C
- **Bluetooth**: Hold PS + Share buttons (for ~3 seconds) until the light flashes, then connect via Bluetooth settings

### 3. **Start Using It**
The overlay will automatically detect your controller and display:
- Button presses highlighted in real-time
- Analog stick movements with visual indicators
- Trigger pressure sensitivity
- Touchpad interactions
- An input log showing recent actions

## Browser Compatibility

Works on modern browsers that support the **Gamepad API**:
- ✅ Chrome 35+
- ✅ Firefox 29+
- ✅ Edge 12+
- ✅ Safari 10.1+
- ✅ Opera 22+

## Features in Detail

### Visual Feedback
- **Buttons** light up when pressed
- **Analog Sticks** move visually with input
- **Triggers** show pressure sensitivity
- **LED Indicator** shows controller is active

### Input Logging
Real-time display of:
- Button presses with names
- Stick and trigger movements
- Touchpad interactions
- Connection status

### Responsive Design
- Works on desktop, tablet, and mobile
- Automatically adjusts layout on smaller screens

## Local Setup (Optional)

If you want to run this with a live server:

1. Install **VS Code** and the **Live Server** extension
2. Right-click `index.html` → "Open with Live Server"
3. Your default browser opens automatically

## GitHub Pages Hosting

To host this online and share:

1. Go to repository **Settings** → **Pages**
2. Set source to `main` branch
3. Access at: `https://parttimegamerpc-cmyk.github.io/ps5-controller-overlay/`

## Troubleshooting

### Controller Not Detected?
- **Try USB Connection**: Bluetooth can be finicky; use a USB cable
- **Check Browser Permissions**: Grant gamepad access if prompted
- **Refresh Page**: Sometimes helps with detection
- **Update Browser**: Ensure you're using the latest version

### No Input Showing?
- Confirm controller is actually connected (check system settings)
- Try pressing a button to wake up the overlay
- Open browser DevTools (F12) → Console to check for errors

### Lag or Delay?
- This is normal with USB polling (polling every ~50ms)
- Bluetooth may add slight latency
- For streaming, this should still be smooth enough

## Files

- `index.html` - Main HTML structure
- `styles.css` - Visual styling for the controller
- `script.js` - Gamepad API implementation and logic
- `README.md` - This file

## Credits

Built using the **Gamepad API** (W3C standard for controller input in browsers).

## License

Feel free to use and modify for personal or commercial projects.

---

**Enjoy monitoring your PS5 controller! 🎮**
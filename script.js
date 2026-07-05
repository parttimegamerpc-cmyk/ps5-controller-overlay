// PS5 Controller Overlay Script
// Uses the Gamepad API to detect controller input

const gamepadIndexes = [];
const buttonNames = {
    0: 'Cross (✕)',
    1: 'Circle (◯)',
    2: 'Square (□)',
    3: 'Triangle (△)',
    4: 'L1',
    5: 'R1',
    6: 'L2',
    7: 'R2',
    8: 'Share',
    9: 'Options (⚙)',
    10: 'L3',
    11: 'R3',
    12: 'PS Button',
    13: 'Touchpad'
};

const axisNames = {
    0: 'Left Stick X',
    1: 'Left Stick Y',
    2: 'Right Stick X',
    3: 'Right Stick Y',
    4: 'L2 Analog',
    5: 'R2 Analog'
};

let inputLog = [];
const MAX_LOG_ENTRIES = 20;

// Initialize gamepad listeners
window.addEventListener('gamepadconnected', (event) => {
    console.log('Gamepad connected:', event.gamepad.id);
    addLog(`🎮 Controller connected: ${event.gamepad.id}`);
    gamepadIndexes.push(event.gamepad.index);
    startPolling();
});

window.addEventListener('gamepaddisconnected', (event) => {
    console.log('Gamepad disconnected:', event.gamepad.id);
    addLog(`❌ Controller disconnected: ${event.gamepad.id}`);
    gamepadIndexes.splice(gamepadIndexes.indexOf(event.gamepad.index), 1);
    if (gamepadIndexes.length === 0) {
        stopPolling();
    }
});

// Main polling loop
let pollInterval = null;
const previousGamepadState = {};

function startPolling() {
    if (pollInterval) return;
    pollInterval = setInterval(pollGamepads, 50);
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

function pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue;

        // Initialize state tracking
        if (!previousGamepadState[i]) {
            previousGamepadState[i] = {
                buttons: new Array(gamepad.buttons.length).fill(false),
                axes: new Array(gamepad.axes.length).fill(0)
            };
        }

        // Check buttons
        for (let j = 0; j < gamepad.buttons.length; j++) {
            const buttonPressed = gamepad.buttons[j].pressed;
            const wasPressed = previousGamepadState[i].buttons[j];

            if (buttonPressed && !wasPressed) {
                handleButtonPress(j, gamepad.id);
                updateButtonUI(j, true);
            } else if (!buttonPressed && wasPressed) {
                updateButtonUI(j, false);
            }

            previousGamepadState[i].buttons[j] = buttonPressed;
        }

        // Check analog sticks and triggers
        for (let j = 0; j < gamepad.axes.length; j++) {
            const axisValue = gamepad.axes[j];
            const threshold = 0.1;

            if (Math.abs(axisValue) > threshold) {
                updateAnalogUI(j, axisValue);
                if (Math.abs(axisValue - previousGamepadState[i].axes[j]) > 0.2) {
                    // Only log significant changes
                    addLog(`${axisNames[j]}: ${axisValue.toFixed(2)}`);
                }
            }

            previousGamepadState[i].axes[j] = axisValue;
        }
    }
}

function handleButtonPress(buttonIndex, gamepadId) {
    const buttonName = buttonNames[buttonIndex] || `Button ${buttonIndex}`;
    addLog(`🔘 ${buttonName}`);
    console.log(`Button pressed: ${buttonName}`);
}

function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    inputLog.unshift(`[${timestamp}] ${message}`);
    if (inputLog.length > MAX_LOG_ENTRIES) {
        inputLog.pop();
    }
    updateLogDisplay();
}

function updateLogDisplay() {
    const logElement = document.getElementById('input-log');
    logElement.innerHTML = inputLog.map(log => `<p>${log}</p>`).join('');
}

function updateButtonUI(buttonIndex, pressed) {
    let selector = '';

    switch (buttonIndex) {
        case 0: selector = '.cross-btn'; break;
        case 1: selector = '.circle-btn'; break;
        case 2: selector = '.square-btn'; break;
        case 3: selector = '.triangle-btn'; break;
        case 4: selector = '.l1-btn'; break;
        case 5: selector = '.r1-btn'; break;
        case 6: selector = '.l2-btn'; break;
        case 7: selector = '.r2-btn'; break;
        case 8: selector = '.options-btn'; break;
        case 9: selector = '.mic-btn'; break;
        case 10: selector = '.stick-button.left-stick'; break;
        case 11: selector = '.stick-button.right-stick'; break;
        case 12: selector = '.menu-btn'; break;
        case 13: selector = '.create-btn'; break;
        default: return;
    }

    const element = document.querySelector(selector);
    if (element) {
        if (pressed) {
            element.style.opacity = '0.7';
            element.style.transform = 'scale(0.95)';
        } else {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }
    }
}

function updateAnalogUI(axisIndex, value) {
    let stickElement = null;
    let maxX = 0;
    let maxY = 0;

    if (axisIndex === 0) {
        stickElement = document.getElementById('left-stick');
        maxX = 15;
    } else if (axisIndex === 1) {
        stickElement = document.getElementById('left-stick');
        maxY = 15;
    } else if (axisIndex === 2) {
        stickElement = document.getElementById('right-stick');
        maxX = 15;
    } else if (axisIndex === 3) {
        stickElement = document.getElementById('right-stick');
        maxY = 15;
    } else if (axisIndex === 4 || axisIndex === 5) {
        // L2 and R2 trigger analog
        const triggerElement = axisIndex === 4 ? 
            document.querySelector('.l2-btn') : 
            document.querySelector('.r2-btn');
        if (triggerElement) {
            triggerElement.style.opacity = (0.3 + Math.abs(value) * 0.7).toString();
        }
    }

    if (stickElement) {
        const inner = stickElement.querySelector('.stick-inner');
        if (inner) {
            const x = axisIndex % 2 === 0 ? value * maxX : (parseInt(inner.style.transform.match(/translateX\(([^px]+)px\)/)?.[1] || 0));
            const y = axisIndex % 2 === 1 ? value * maxY : (parseInt(inner.style.transform.match(/translateY\(([^px]+)px\)/)?.[1] || 0));
            inner.style.transform = `translate(${x}px, ${y}px)`;
        }
    }
}

// D-Pad button detection
const dpadElements = document.querySelectorAll('[data-button^="dpad"]');
dpadElements.forEach(button => {
    button.addEventListener('click', function() {
        const buttonName = this.dataset.button;
        addLog(`🔘 D-Pad: ${buttonName.replace('dpad-', '').toUpperCase()}`);
    });
});

// Face buttons
const faceButtons = document.querySelectorAll('.face-btn');
faceButtons.forEach(button => {
    button.addEventListener('click', function() {
        const buttonName = this.dataset.button;
        addLog(`🔘 ${buttonName.toUpperCase()}`);
    });
});

// Shoulder buttons
const shoulderButtons = document.querySelectorAll('.shoulder-btn');
shoulderButtons.forEach(button => {
    button.addEventListener('click', function() {
        addLog(`🔘 ${this.textContent}`);
    });
});

// Center buttons
const centerButtons = document.querySelectorAll('.center-btn');
centerButtons.forEach(button => {
    button.addEventListener('click', function() {
        addLog(`🔘 ${this.dataset.button.toUpperCase()}`);
    });
});

// Bottom buttons
const bottomButtons = document.querySelectorAll('.bottom-btn');
bottomButtons.forEach(button => {
    button.addEventListener('click', function() {
        const emoji = this.textContent;
        addLog(`🔘 ${this.dataset.button.toUpperCase()} ${emoji}`);
    });
});

// Touchpad
const touchpad = document.getElementById('touchpad');
let touchpadActive = false;

touchpad.addEventListener('mousedown', () => {
    touchpadActive = true;
    addLog('🟢 Touchpad: Active');
});

touchpad.addEventListener('mousemove', (e) => {
    if (touchpadActive) {
        const rect = touchpad.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(0);
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(0);
        touchpad.style.background = `radial-gradient(circle at ${x}% ${y}%, #3a3a3a 0%, #1a1a1a 100%)`;
    }
});

touchpad.addEventListener('mouseup', () => {
    touchpadActive = false;
    touchpad.style.background = '#2a2a2a';
    addLog('🔴 Touchpad: Inactive');
});

touchpad.addEventListener('mouseleave', () => {
    if (touchpadActive) {
        touchpadActive = false;
        touchpad.style.background = '#2a2a2a';
    }
});

// Initial message
window.addEventListener('load', () => {
    addLog('✅ Overlay loaded. Connect a PS5 controller...');
    addLog('');
    addLog('Supported:');
    addLog('• Buttons (all)');
    addLog('• Sticks (analog)');
    addLog('• Triggers (L2/R2)');
    
    // Check if gamepads are already connected
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gamepadIndexes.push(i);
            addLog(`🎮 Controller already connected: ${gamepads[i].id}`);
            startPolling();
        }
    }
});
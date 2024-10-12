import {is} from "@electron-toolkit/utils";
const Joystick = require("joystick");
const { app, globalShortcut } = require('electron');

const listeners = {};
let axisTimers = {};
let spamIntervals = {};

const AXIS_SPAM_DELAY = 1000;
const AXIS_SPAM_INTERVAL = 100;

const enableJoystick = () => {
    let joystickInstance = new Joystick(parseInt(process.env['JOYSTICK_INDEX'] || 0));

    joystickInstance.on("button", (data) => {
        if (data.value === 1) {
            if (listeners.keyDown) listeners.keyDown(data.number);
        }
    });

    joystickInstance.on("axis", (data) => {
        const axisMap = {
            0: { "-32767": "left", "32767": "right" },
            1: { "-32767": "up", "32767": "down" }
        };

        if (axisMap[data.number]) {
            const direction = axisMap[data.number][data.value];

            if (direction) {
                if (!axisTimers[direction] && !spamIntervals[direction]) {
                    if (listeners.axis) listeners.axis(direction);

                    axisTimers[direction] = setTimeout(() => {
                        startAxisSpam(direction);
                    }, AXIS_SPAM_DELAY);
                }
            } else {
                stopAxisSpam(axisMap[data.number]["-32767"]);
                stopAxisSpam(axisMap[data.number]["32767"]);
                clearAxisTimer(axisMap[data.number]["-32767"]);
                clearAxisTimer(axisMap[data.number]["32767"]);
            }
        }
    });

    joystickInstance.on("error", (error) => {
        console.error("Joystick error:", error);
    });
};

const enableKeyboardControls = () => {
    app.on('ready', () => {
        globalShortcut.register('Left', () => handleKeyPress("left"));
        globalShortcut.register('Up', () => handleKeyPress("up"));
        globalShortcut.register('Right', () => handleKeyPress("right"));
        globalShortcut.register('Down', () => handleKeyPress("down"));
        globalShortcut.register('Enter', () => {
            if (listeners.keyDown) listeners.keyDown(32);
        });

    });
};

const handleKeyPress = (direction) => {
    if (listeners.axis) listeners.axis(direction);
};

if (!is.dev || process.env['ENABLE_JOYSTICK']) {
    enableJoystick();
} else {
    enableKeyboardControls();
}

const startAxisSpam = (axis) => {
    spamIntervals[axis] = setInterval(() => {
        if (listeners.axis) listeners.axis(axis);
    }, AXIS_SPAM_INTERVAL);
};

const stopAxisSpam = (axis) => {
    if (spamIntervals[axis]) {
        clearInterval(spamIntervals[axis]);
        delete spamIntervals[axis];
    }
};

const clearAxisTimer = (axis) => {
    if (axisTimers[axis]) {
        clearTimeout(axisTimers[axis]);
        delete axisTimers[axis];
    }
};

export const onKeyDown = (callback = (number) => {}) => {
    listeners.keyDown = callback;
};

export const onAxis = (callback = (axis) => {}) => {
    listeners.axis = callback;
};

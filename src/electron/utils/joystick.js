const Joystick = require("joystick");

const joystickInstance = new Joystick(0);

const listeners = {};
let axisTimers = {};
let spamIntervals = {};

const AXIS_SPAM_DELAY = 1000;
const AXIS_SPAM_INTERVAL = 100;

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

module.exports.onKeyDown = (callback = (number) => {}) => {
    listeners.keyDown = callback;
};

module.exports.onAxis = (callback = (axis) => {}) => {
    listeners.axis = callback;
};

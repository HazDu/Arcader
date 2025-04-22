#include <Arduino.h>

int impulsCount = 0;
unsigned long lastImpulseTime = 0;
bool messageSent = false;

const unsigned long MIN_IMPULSE_INTERVAL_MS = 100;

void incomingImpuls() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastImpulseTime > MIN_IMPULSE_INTERVAL_MS) {
    impulsCount++;
    lastImpulseTime = currentMillis;
    messageSent = false;
  }
}

void setup() {
  Serial.begin(9600);
  attachInterrupt(digitalPinToInterrupt(2), incomingImpuls, CHANGE);
}

void loop() {
  if (impulsCount > 0 && !messageSent) {
    Serial.println(100073000);
    messageSent = true;
    impulsCount = 0;
  }
}

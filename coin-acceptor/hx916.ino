#include <SoftwareSerial.h>

const int coinPin = 2;
const unsigned long interval = 5000;

SoftwareSerial coinSerial(coinPin, -1);

String coinBuffer = "";
unsigned long previousMillis = 0;
bool coinDetected = false;

void setup() {
  Serial.begin(9600);
  coinSerial.begin(9600);
}

void loop() {
  unsigned long currentMillis = millis();

  if (coinSerial.available() > 0) {
    char received = coinSerial.read();

    if ((uint8_t)received == 255) return;

    if (!coinDetected) {
      Serial.println(100073000);
      coinDetected = true;
    }

    coinBuffer += String((uint8_t)received);
  }

  if (currentMillis - previousMillis >= interval) {
    if (coinDetected) {
      coinDetected = false;
      coinBuffer = "";
    }

    previousMillis = currentMillis;
  }
}

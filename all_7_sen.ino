#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "HX711.h"

// WiFi Credentials
const char* ssid = "CITNC-Staff";
const char* password = "Citnc#@2024#@";

// Backend Server URLs
const char* sensorServerUrl = "http://130.1.41.198:5000/sensor-data";
const char* fuelServerUrl = "http://130.1.41.198:5000/fuel_data";

// Temperature Sensor (DHT11)
#define DHTPIN 27
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Load Sensor (HX711)
#define LOADCELL_DOUT_PIN 14
#define LOADCELL_SCK_PIN 13
HX711 scale;
float calibration_factor = -7050.0;

// Ultrasonic Sensor (Boom Angle)
#define TRIG_PIN 5
#define ECHO_PIN 18

// Voltage Sensor (ZMPT101B)
#define ZMPT_PIN 34
const float VCC = 3.3;
const int ADC_MAX = 4095;
const float VOLTAGE_CALIBRATION_FACTOR = 0.09;  // Adjusted for accuracy

// Sound Sensor
#define SOUND_SENSOR_AO 35
#define SOUND_SENSOR_DO 15
const int SOUND_SAMPLES = 100;

// Vibration Sensor
#define VIBRATION_PIN 32
#define BUILT_IN_LED 2
const int VIBRATION_THRESHOLD = 600;

// Fuel Level Sensor (Ultrasonic)
#define FUEL_TRIG_PIN 26  
#define FUEL_ECHO_PIN 25  
#define MAX_FUEL_DISTANCE 25.0  
#define MIN_FUEL_DISTANCE 5.0  

// Operating Hours Calculation
unsigned long lastRunTime = 0;
float totalOperatingHours = 0;
const float VOLTAGE_THRESHOLD = 2.5;

// WiFi Connection Function
void connectWiFi() {
    Serial.print("🔗 Connecting to WiFi...");
    WiFi.begin(ssid, password);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ Connected!");
    } else {
        Serial.println("\n❌ WiFi Connection Failed! Restarting...");
        ESP.restart();
    }
}

// Read AC Voltage
float readACVoltage() {
    const int SAMPLES = 1000;
    float sumSquared = 0.0, offset = VCC / 2.0;
    for (int i = 0; i < SAMPLES; i++) {
        int raw = analogRead(ZMPT_PIN);
        float voltage = (raw * VCC) / ADC_MAX;
        sumSquared += pow(voltage - offset, 2);
        delayMicroseconds(50);
    }
    return sqrt(sumSquared / SAMPLES) * VOLTAGE_CALIBRATION_FACTOR * 100.0;
}

// Read Sound Level
float readSoundLevel() {
    long sum = 0;
    for (int i = 0; i < SOUND_SAMPLES; i++) {
        sum += analogRead(SOUND_SENSOR_AO);
        delayMicroseconds(400);
    }
    return (sum / SOUND_SAMPLES) * (VCC / ADC_MAX) * 100;
}

// Read Vibration Sensor
int readVibration() {
    return analogRead(VIBRATION_PIN);
}

// Measure Fuel Level Distance
float measureFuelDistance() {
    digitalWrite(FUEL_TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(FUEL_TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(FUEL_TRIG_PIN, LOW);
    
    long duration = pulseIn(FUEL_ECHO_PIN, HIGH, 50000); // 50ms timeout

    if (duration == 0) {
        Serial.println("⚠ Fuel Sensor Timeout! Retrying...");
        return -1;
    }

    float distance = (duration * 0.0343) / 2;
    
    if (distance > 200 || distance <= 0) {
        Serial.println("⚠ Invalid Fuel Sensor Reading! Check Sensor.");
        return -1;
    }

    Serial.printf("📏 Raw Fuel Sensor Distance: %.2f cm\n", distance);
    return distance;
}

// Calculate Fuel Level from Distance
float calculateFuelLevel(float distance) {
    if (distance < 0) return 0;  
    if (distance >= MAX_FUEL_DISTANCE) return 0;  
    if (distance <= MIN_FUEL_DISTANCE) return 100;  
    return 100 * (MAX_FUEL_DISTANCE - distance) / (MAX_FUEL_DISTANCE - MIN_FUEL_DISTANCE);
}

// Send Fuel Data to Server
void sendFuelData(float fuelLevel) {
    HTTPClient http;
    http.begin(fuelServerUrl);
    http.addHeader("Content-Type", "application/json");
    String jsonData = "{\"fuel_level\": " + String(fuelLevel, 2) + "}";
    int httpResponseCode = http.POST(jsonData);
    Serial.printf("⛽ Fuel Data Sent - Response Code: %d\n", httpResponseCode);
    http.end();
}

// Update Operating Hours
void updateOperatingHours(float voltage) {
    if (voltage >= VOLTAGE_THRESHOLD) { 
        unsigned long currentTime = millis();
        if (lastRunTime > 0) {
            totalOperatingHours += (currentTime - lastRunTime) / (1000.0 * 60.0 * 60.0);
        }
        lastRunTime = currentTime;
    }
}

void setup() {
    Serial.begin(115200);
    connectWiFi();

    dht.begin();
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(FUEL_TRIG_PIN, OUTPUT);
    pinMode(FUEL_ECHO_PIN, INPUT);
    pinMode(SOUND_SENSOR_DO, INPUT);
    pinMode(BUILT_IN_LED, OUTPUT);

    scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
    scale.set_scale(calibration_factor);
    scale.tare();
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("⚠ WiFi Disconnected! Reconnecting...");
        connectWiFi();
        return;
    }

    // Read Sensor Data
    float temperature = dht.readTemperature();
    float weight = scale.is_ready() ? max(0.0f, scale.get_units(5)) : -1.0;
    float fuelDistance = measureFuelDistance();
    float fuelLevel = calculateFuelLevel(fuelDistance);
    float voltage = readACVoltage();
    float soundDB = readSoundLevel();
    int vibration = readVibration();

    Serial.printf("🌡 Temp: %.1f°C | ⚖ Weight: %.2fkg | 📏 Fuel Dist: %.2f cm | ⛽ Fuel: %.2f%%\n", temperature, weight, fuelDistance, fuelLevel);
    Serial.printf("🔌 Voltage: %.1fV | 🔊 Sound: %.1f dB | 📳 Vibration: %d\n", voltage, soundDB, vibration);

    updateOperatingHours(voltage);
    Serial.printf("⏳ Operating Hours: %.2f hrs\n", totalOperatingHours);

    // Send Sensor Data to Backend
    HTTPClient http;
    http.begin(sensorServerUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"temperature\":" + String(temperature) +
                         ", \"weight\":" + String(weight) +
                         ", \"fuel_level\":" + String(fuelLevel, 2) +
                         ", \"voltage\":" + String(voltage, 1) +
                         ", \"soundLevel\":" + String(soundDB, 1) +
                         ", \"vibration\":" + String(vibration) + 
                         ", \"operatingHours\":" + String(totalOperatingHours, 2) + "}";

    int httpResponseCode = http.POST(jsonPayload);
    Serial.printf("📡 Sensor Data Sent - Response Code: %d\n", httpResponseCode);
    http.end();

    sendFuelData(fuelLevel);
    delay(2000);
}

import tkinter as tk
from tkinter import messagebox
import numpy as np
import tensorflow as tf
import paho.mqtt.client as mqtt
from flask import Flask, jsonify
from flask_socketio import SocketIO
from sklearn.preprocessing import MinMaxScaler

# Load pre-trained autoencoder model
autoencoder = tf.keras.models.load_model("autoencoder_model.h5")
scaler = MinMaxScaler()

# Flask app and SocketIO setup
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# MQTT setup
MQTT_BROKER = "mqtt.eclipseprojects.io"
MQTT_TOPIC = "crane/anomalies"
client = mqtt.Client()
client.connect(MQTT_BROKER, 1883, 60)

# Define troubleshooting rules
def troubleshoot_issue(issue):
    solutions = {
        "high_temperature": "Check coolant, reduce load, inspect cooling system.",
        "overload": "Reduce load, check weight distribution.",
        "high_vibration": "Inspect mechanical parts, check for loose connections.",
        "abnormal_power": "Check electrical wiring, inspect motor efficiency."
    }
    return solutions.get(issue, "No predefined solution. Perform manual inspection.")

# Function to show alert pop-up
def show_alert(issue, fix_steps):
    root = tk.Tk()
    root.withdraw()
    messagebox.showwarning("Anomaly Detected!", f"Issue: {issue}\nTroubleshooting: {fix_steps}")

# Function to detect anomalies and trigger alerts
def detect_anomalies_and_alert(sensor_data):
    sensor_data_scaled = scaler.transform([sensor_data])
    reconstructed = autoencoder.predict(sensor_data_scaled)
    mse = np.mean(np.power(sensor_data_scaled - reconstructed, 2))
    threshold = 0.01
    
    if mse > threshold:
        print("Anomaly Detected! Triggering alert...")
        issue_detected = ""
        if sensor_data[0] > 100:
            issue_detected = "high_temperature"
        elif sensor_data[1] > 900:
            issue_detected = "overload"
        elif sensor_data[3] > 45:
            issue_detected = "high_vibration"
        elif sensor_data[4] > 40:
            issue_detected = "abnormal_power"
        
        fix_steps = troubleshoot_issue(issue_detected)
        print(f"Detected Issue: {issue_detected}")
        print(f"Troubleshooting Steps: {fix_steps}")
        
        # Show pop-up alert
        show_alert(issue_detected, fix_steps)
        
        # Send data to React frontend via WebSockets
        socketio.emit("anomaly_alert", {"issue": issue_detected, "fix": fix_steps})
        
        # Publish MQTT message for IoT alerts
        client.publish(MQTT_TOPIC, f"Anomaly Detected: {issue_detected}, Fix: {fix_steps}")
    else:
        print("No anomaly detected. System is operating normally.")

# Flask route for testing
@app.route("/test_alert", methods=["GET"])
def test_alert():
    test_data = [105, 950, 80, 50, 45, 300, 10]
    detect_anomalies_and_alert(test_data)
    return jsonify({"message": "Test alert triggered."})

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)

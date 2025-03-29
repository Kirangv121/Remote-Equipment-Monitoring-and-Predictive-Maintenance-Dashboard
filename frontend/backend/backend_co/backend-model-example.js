// This is an example of how the backend might implement the autoencoder model
// This would be in your Node.js backend, not in the frontend

const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const csv = require("csv-parser");

// Load and preprocess data
async function loadData(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Normalize data
function normalizeData(data) {
  // Convert string values to numbers
  const numericData = data.map((row) => {
    const numericRow = {};
    Object.keys(row).forEach((key) => {
      numericRow[key] = Number.parseFloat(row[key]);
    });
    return numericRow;
  });

  // Extract features - use only sensor data, not operational_hours, maintenance, or RUL
  const features = ["sensor_1", "sensor_2", "sensor_3"];

  // Create feature arrays
  const featureArrays = numericData.map((row) =>
    features.map((feature) => row[feature])
  );

  // Calculate min and max for each feature
  const mins = [];
  const maxs = [];
  for (let i = 0; i < features.length; i++) {
    mins[i] = Math.min(...featureArrays.map((row) => row[i]));
    maxs[i] = Math.max(...featureArrays.map((row) => row[i]));
  }

  // Normalize
  const normalizedData = featureArrays.map((row) => {
    return row.map((value, i) => (value - mins[i]) / (maxs[i] - mins[i]));
  });

  return {
    normalizedData,
    features,
    mins,
    maxs,
    originalData: numericData,
  };
}

// Build autoencoder model
function buildAutoencoder(inputDim) {
  const model = tf.sequential();

  // Encoder
  model.add(
    tf.layers.dense({
      inputShape: [inputDim],
      units: 16,
      activation: "relu",
    })
  );
  model.add(
    tf.layers.dense({
      units: 8,
      activation: "relu",
    })
  );
  model.add(
    tf.layers.dense({
      units: 4,
      activation: "relu",
    })
  );

  // Decoder
  model.add(
    tf.layers.dense({
      units: 8,
      activation: "relu",
    })
  );
  model.add(
    tf.layers.dense({
      units: 16,
      activation: "relu",
    })
  );
  model.add(
    tf.layers.dense({
      units: inputDim,
      activation: "sigmoid",
    })
  );

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  return model;
}

// Train model
async function trainModel(model, data) {
  const xs = tf.tensor2d(data);

  await model.fit(xs, xs, {
    epochs: 50,
    batchSize: 16,
    validationSplit: 0.1,
    verbose: 1,
  });

  return model;
}

// Detect anomalies
function detectAnomalies(model, data, threshold) {
  const xs = tf.tensor2d(data);
  const reconstructed = model.predict(xs);

  // Calculate reconstruction error
  const reconstructionError = tf.sub(xs, reconstructed).abs().mean(1);
  const errors = reconstructionError.arraySync();

  // Flag anomalies
  const anomalies = errors.map((error) => error > threshold);

  return {
    errors,
    anomalies,
  };
}

// Calculate health scores based on anomaly scores and RUL
function calculateHealthScores(anomalyScores, rulData) {
  const maxRUL = Math.max(...rulData);

  return anomalyScores.map((score, i) => {
    const rulFactor = rulData[i] / maxRUL;
    const anomalyFactor = 1 - score; // Invert anomaly score (higher anomaly = lower health)

    // Combine factors (70% RUL, 30% anomaly score)
    const healthScore = (rulFactor * 0.7 + anomalyFactor * 0.3) * 100;

    return Math.min(100, Math.max(0, healthScore)); // Ensure between 0-100
  });
}

// Main function
async function runPredictiveMaintenance(csvFilePath) {
  try {
    // Load data
    const data = await loadData(csvFilePath);
    console.log(`Loaded ${data.length} records`);

    // Normalize data
    const { normalizedData, features, mins, maxs, originalData } =
      normalizeData(data);
    console.log(`Normalized ${features.length} features`);

    // Split data
    const trainSize = Math.floor(normalizedData.length * 0.7);
    const trainData = normalizedData.slice(0, trainSize);
    const testData = normalizedData.slice(trainSize);

    // Build and train model
    const model = buildAutoencoder(features.length);
    await trainModel(model, trainData);
    console.log("Model trained successfully");

    // Calculate threshold from training data
    const trainXs = tf.tensor2d(trainData);
    const trainReconstructed = model.predict(trainXs);
    const trainErrors = tf
      .sub(trainXs, trainReconstructed)
      .abs()
      .mean(1)
      .arraySync();
    const threshold = calculatePercentile(trainErrors, 95);
    console.log(`Anomaly threshold: ${threshold}`);

    // Detect anomalies in test data
    const { errors, anomalies } = detectAnomalies(model, testData, threshold);
    const anomalyCount = anomalies.filter(Boolean).length;
    console.log(
      `Detected ${anomalyCount} anomalies out of ${testData.length} test samples`
    );

    // Extract RUL data
    const rulData = originalData.slice(trainSize).map((row) => row.RUL);

    // Calculate health scores
    const healthScores = calculateHealthScores(errors, rulData);

    // Save model
    await model.save("file://./model");
    console.log("Model saved");

    // Generate results
    const results = testData.map((data, i) => ({
      anomalyScore: errors[i],
      isAnomaly: anomalies[i],
      healthScore: healthScores[i],
      rul: rulData[i],
    }));

    return {
      results,
      anomalyCount,
      anomalyPercentage: (anomalyCount / testData.length) * 100,
      threshold,
      averageHealthScore:
        healthScores.reduce((sum, score) => sum + score, 0) /
        healthScores.length,
      averageRUL: rulData.reduce((sum, rul) => sum + rul, 0) / rulData.length,
    };
  } catch (error) {
    console.error("Error in predictive maintenance:", error);
    throw error;
  }
}

// Helper function to calculate percentile
function calculatePercentile(array, percentile) {
  const sorted = [...array].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

// This would be exposed as an API endpoint in your backend
// Example Express route:
/*
app.get('/predictive-maintenance', async (req, res) => {
  try {
    // Get crane ID from request
    const craneId = req.query.craneId || '1';
    
    // Run predictive maintenance analysis
    const results = await runPredictiveMaintenance(`./data/crane_${craneId}_data.csv`);
    
    // Format response
    const response = {
      sensorData: results.results.map((result, i) => ({
        timestamp: new Date(Date.now() - (results.results.length - i) * 3600000).toISOString(),
        sensor_1: originalData[trainSize + i].sensor_1,
        sensor_2: originalData[trainSize + i].sensor_2,
        sensor_3: originalData[trainSize + i].sensor_3,
        operational_hours: originalData[trainSize + i].operational_hours,
        rul: result.rul
      })),
      anomalies: results.results.map((result, i) => ({
        timestamp: new Date(Date.now() - (results.results.length - i) * 3600000).toISOString(),
        score: result.anomalyScore * 100, // Scale for visualization
        isAnomaly: result.isAnomaly
      })),
      healthScores: results.results.map((result, i) => ({
        timestamp: new Date(Date.now() - (results.results.length - i) * 3600000).toISOString(),
        score: result.healthScore
      })),
      remainingUsefulLife: {
        days: Math.round(results.averageRUL / 24), // Convert hours to days
        hours: results.averageRUL
      },
      anomalyThreshold: threshold * 100, // Scale for visualization
      maintenanceRecommendations: generateRecommendations(results),
      lastUpdated: new Date().toISOString(),
      cranes: [
        { id: "1", name: "XCMG Truck Crane" },
        { id: "2", name: "POTAIN Tower Crane" },
        { id: "3", name: "GROVE Rough Terrain Crane" },
        { id: "4", name: "Liebherr Crawler Crane" }
      ]
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in predictive maintenance API:', error);
    res.status(500).json({ error: 'Failed to process predictive maintenance data' });
  }
});

// Generate maintenance recommendations based on results
function generateRecommendations(results) {
  const recommendations = [];
  
  // Check for critical RUL
  if (results.averageRUL / 24 < 30) {
    recommendations.push({
      component: "Main System",
      issue: "Approaching end of useful life",
      severity: "Critical",
      action: "Schedule complete maintenance overhaul",
      timeline: "Within 30 days"
    });
  }
  
  // Check for anomalies
  if (results.anomalyPercentage > 10) {
    recommendations.push({
      component: "Sensor System",
      issue: "Frequent anomalous readings detected",
      severity: "High",
      action: "Inspect and calibrate sensors",
      timeline: "Within 7 days"
    });
  }
  
  // Add more recommendations based on specific patterns in the data
  
  return recommendations;
}
*/

module.exports = {
  loadData,
  normalizeData,
  buildAutoencoder,
  trainModel,
  detectAnomalies,
  calculateHealthScores,
  runPredictiveMaintenance,
};

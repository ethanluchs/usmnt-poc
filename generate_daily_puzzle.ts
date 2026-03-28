// generateDailyPuzzle.ts

import * as admin from "firebase-admin";
// No need for GeoPoint from @google-cloud/firestore for this specific structure,
// as lat/lng are stored as simple numbers within a map.

// TODO: Replace with the path to your downloaded service account key JSON file
// Example: "./path/to/your-service-account-key.json"
const serviceAccount = require("../PrivateKeys/soccerguesser-3eb7e-firebase-adminsdk-fbsvc-c7ebfe036c.json");

// Initialize Firebase Admin SDK if not already initialized
// Check if an app is already initialized to prevent re-initialization errors
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "soccerguesser-3eb7e",
  });
}

const db = admin.firestore();

/**
 * Generates a document for today's daily puzzle and writes it to Firestore.
 * The document ID will be today's date in "YYYY-MM-DD" format.
 */
async function generateDailyPuzzle() {
  console.log("Generating today's daily puzzle...");

  // Get today's date in "YYYY-MM-DD" format
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = today.getDate().toString().padStart(2, '0');
  const documentId = `${year}-${month}-${day}`;

  // Sample data for the daily puzzle
  const puzzleData = {
    locations: [
      {
        lat: 34.0522,
        lng: -118.2437,
        city: "Los Angeles",
        country: "USA",
        label: "Dodger Stadium",
      },
      {
        lat: 40.7128,
        lng: -74.0060,
        city: "New York",
        country: "USA",
        label: "Statue of Liberty",
      },
      {
        lat: 51.5074,
        lng: -0.1278,
        city: "London",
        country: "UK",
        label: "Big Ben",
      },
      {
        lat: 35.6762,
        lng: 139.6503,
        city: "Tokyo",
        country: "Japan",
        label: "Shibuya Crossing",
      },
    ],
    nationality: "American", // Example nationality
    player_name: "Tarey Gettys", // Example player name
    createdAt: admin.firestore.FieldValue.serverTimestamp(), // Timestamp when created
  };

  try {
    const docRef = db.collection("dailyPuzzles").doc(documentId);
    await docRef.set(puzzleData); // Use .set() to specify the document ID

    console.log(`Daily puzzle for ${documentId} written successfully!`);
    console.log("Document content:", puzzleData);
  } catch (e) {
    console.error(`Error writing daily puzzle for ${documentId}:`, e);
  } finally {
    process.exit(); // Exit the script after completion
  }
}

// Call the main function to start the process
generateDailyPuzzle();

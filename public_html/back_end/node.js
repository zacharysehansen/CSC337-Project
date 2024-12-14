////CSC 337 Final Project: Pocket Pond
//Team: Sameeka Maroli
//Description: This code sets up an Express server that fetches the top 3 users from a MongoDB collection based on their coin count and returns the data as JSON via the /leaderboard endpoint. 
// It also periodically updates the leaderboard data ( by incrementing coins and fishCount randomly every 5 seconds).


const express = require('express');
const app = express();
app.use(express.static());

const { MongoClient } = require("mongodb");

const uri = "mongodb://64.23.229.25:27017"
const dbName = "fishtank";
const collectionName = "users";


async function getLeaderboard() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.aggregate([
      {
        $project: {
          users: {
            $objectToArray: "$users" // Convert `users` object to array for processing
          }
        }
      },
      { $unwind: "$users" },
      {
        $project: {
          username: "$users.v.username",
          coins: "$users.v.coins",
          level: "$users.v.level"
        }
      },
      { $sort: { coins: -1 } }, // Sort by coins in descending order
      { $limit: 3 } // Get top 3 users
    ]).toArray();

    //  into  JSON object
    const leaderboard = result.map(user => ({
      username: user.username,
      coins: user.coins,
      level: user.level
    }));

    console.log("Leaderboard:", leaderboard);
    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  } finally {
    await client.close();
  }
}

// // Mock leaderboard data
// let leaderboardData = getLeaderboard();

app.get('/leaderboard', (req, res) => {
    console.log("NOT ERROR: Asking for leaderboard values.")
    leaderboardData = getLeaderboard();
    res.json(leaderboardData);
});

setInterval(() => {
    leaderboardData.coins += Math.floor(Math.random() * 10);
    leaderboardData.fishCount += Math.floor(Math.random() * 2);
}, 5000);

app.listen(3000, () => {
    console.log("Server running on http://127.0.0.1:3000");
});

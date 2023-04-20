const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//GET
const convertPlayers = (eachPlayer) => {
  return { playerId: eachPlayer.player_id, playerName: eachPlayer.player_name };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT
        *
        FROM
        player_details;`;
  const players = await db.all(getPlayersQuery);
  response.send(players.map((eachPlayer) => convertPlayers(eachPlayer)));
});

//GET PLAYER

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
        SELECT
        *
        FROM
        player_details
        WHERE
        player_id=${playerId};`;
  const players = await db.get(getPlayersQuery);
  response.send(convertPlayers(players));
});

// UPDATE PLAYER

app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
        UPDATE
        player_details
        SET
         player_name='${playerName}'
        WHERE
         player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//GET MATCH

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
        SELECT
        *
        FROM
        match_details
        WHERE
        match_id=${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send({
    matchId: match.match_id,
    match: match.match,
    year: match.year,
  });
});

//GET MATCHES
const convertMatchDetailsResponse = (eachMatch) => {
  return {
    matchId: eachMatch.match_id,
    match: eachMatch.match,
    year: eachMatch.year,
  };
};

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesQuery = `
        SELECT
        *
        FROM
        player_match_score NATURAL JOIN match_details
        WHERE
        player_id=${playerId};`;
  const matches = await db.all(getMatchesQuery);
  response.send(
    matches.map((eachMatch) => convertMatchDetailsResponse(eachMatch))
  );
});

//GET PLAYERS

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
        SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
  const players = await db.all(getMatchPlayersQuery);
  response.send(players);
});

//STATS

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  const playersMatchDetails = await database.get(getMatchPlayersQuery);
  response.send(playersMatchDetails);
});
module.exports = app;

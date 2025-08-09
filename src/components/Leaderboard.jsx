import React, { useEffect, useState } from "react";
import { getScores } from "../utils/DataAccess.js";

export const Leaderboard = () => {
  const [myScores, setMyScores] = useState([]);

  const scoresTable = myScores.map(score =>
    <div className="row" key={myScores.indexOf(score)}>
      <span className="column">{score.initials}</span>
      <span className="column leaderboard-cell">{score.date}</span>
      <span className="column">{score.score}</span>
    </div>
  );

  useEffect(() => {
    var scoreArray = getScores();
    // sort with highest score at the top
    scoreArray.sort((a,b) => b.score - a.score);
    setMyScores(Array.from(scoreArray));
  }, []);
  

  return (
    <div>
      <h3>Local leaderboard</h3>
      <div className="leaderboard console-style">{scoresTable}</div>
    </div>
  );
};

export default Leaderboard;
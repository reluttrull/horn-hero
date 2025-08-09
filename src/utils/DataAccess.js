export const getScores = () => {
    var i, scoreArray = [];
    for (i in localStorage) {
      if (i.startsWith('score:')) {
        let split = i.substring(6).split(',');
        let thisScore = {"initials": split[0],"date": new Date(split[1]).toDateString(),"score": localStorage.getItem(i)};
        console.log(thisScore);
        scoreArray.push(thisScore);
      }
    }
    return scoreArray;
  }
import React, { useState } from "react";
import fingerings from '../data/fingeringChart.json'
import { LocalStorageKeys, HornTypes, Ranges, AccidentalSettings } from "../utils/GlobalKeys.js";
import { oneOctave, twoOctaves, oneOctaveAccidentalsEasy, oneOctaveAccidentalsMost, 
  oneOctaveAccidentalsAll, twoOctavesAccidentalsEasy, twoOctavesAccidentalsMost, 
  twoOctavesAccidentalsAll } from '../utils/Structures.js';

export const Study = () => {
  const [hornType, setHornType] = useState(localStorage.getItem(LocalStorageKeys.HORNTYPE));
  const [range, setRange] = useState(localStorage.getItem(LocalStorageKeys.RANGE));
  const [useAccidentals, setUseAccidentals] = useState(localStorage.getItem(LocalStorageKeys.USEACCIDENTALS));

  // show all the listed fingerings for each note
  const getAlternates = (fList) => {
    return fList.map(fing => 
      <span className="row">{fing}</span>
    )
  }

  const getHornTypeDisplay = (ht) => {
    switch (ht) {
      case HornTypes.DOUBLEHORN:
        return "Double Horn";
      case HornTypes.SINGLEBB:
        return "Single Bb Horn";
      case HornTypes.SINGLEF:
        return "Single F Horn";
      default:
        return null;
    }
  }

  // get the appropriate accidentals to add in to our list
  const getMyAccidentals = () => {
    switch (range) {
      case Ranges.ONEOCTAVE:
        switch (useAccidentals) {
          case AccidentalSettings.EASY:
            return oneOctaveAccidentalsEasy;
          case AccidentalSettings.MOST:
            return oneOctaveAccidentalsMost;
          case AccidentalSettings.ALL:
            return oneOctaveAccidentalsAll;
          default:
            return [];
        }
        break;
      case Ranges.TWOOCTAVES:
        switch (useAccidentals) {
          case AccidentalSettings.EASY:
            return twoOctavesAccidentalsEasy;
          case AccidentalSettings.MOST:
            return twoOctavesAccidentalsMost;
          case AccidentalSettings.ALL:
            return twoOctavesAccidentalsAll;
          default:
            return [];
        }
    }
  }

  // based on settings, get all the notes we need to display
  const getMyNotes = () => {
    let myRange = [];
    switch (range) {
      case Ranges.ONEOCTAVE:
        myRange = oneOctave.concat(getMyAccidentals());
        break;
      case Ranges.TWOOCTAVES:
        myRange = twoOctaves.concat(getMyAccidentals());
        break;
    }
    return fingerings.filter(f => myRange.includes(f.noteId));
  }

  // display note info
  const FingeringChart = getMyNotes().map(note =>
    <div className="row study-row" key={getMyNotes().indexOf(note)}>
      <img className="column study-flashcard" src={"/horn-hero" + note.img} />
      <span className={hornType == HornTypes.DOUBLEHORN ? "visible column study-fingerings" : "invisible column"}>{getAlternates(note.doubleFingerings)}</span>
      <span className={hornType == HornTypes.SINGLEBB ? "visible column study-fingerings" : "invisible column"}>{getAlternates(note.BbFingerings)}</span>
      <span className={hornType == HornTypes.SINGLEF ? "visible column study-fingerings" : "invisible column"}>{getAlternates(note.FFingerings)}</span>
      <span className="column study-fingerings">{note.displayName}</span>
    </div>
  );

  // throw new Error("my error info")

  return (
    <>
    <h3>{getHornTypeDisplay(hornType)} Fingering Chart</h3>
    {FingeringChart}
    </>
  );
};

export default Study;
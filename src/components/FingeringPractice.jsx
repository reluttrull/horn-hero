import React, { useEffect, useCallback, useState, useRef } from "react";
import { CountdownTimer } from './CountdownTimer.jsx';
import { LocalStorageKeys, Ranges, HornTypes, AccidentalSettings } from "../utils/GlobalKeys.js";
import { oneOctave, twoOctaves, oneOctaveAccidentalsEasy, oneOctaveAccidentalsMost, 
  oneOctaveAccidentalsAll, twoOctavesAccidentalsEasy, twoOctavesAccidentalsMost, 
  twoOctavesAccidentalsAll } from '../utils/Structures.js';
import { getScores } from "../utils/DataAccess.js";
import fingerings from '../data/fingeringChart.json';
import * as Tone from 'tone';
import { FaVolumeXmark, FaVolumeHigh } from 'react-icons/fa6';

export const FingeringPractice = () => {
  const [soundOn, setSoundOn] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timerRunning, setTimerRunning] = useState(null);
  const [score, setScore] = useState(0);
  const [initials, setInitials] = useState("");
  const [displayCard, setDisplayCard] = useState(0);
  let currentCard = useRef(0);
  // user settings
  const [hornType, setHornType] = useState(localStorage.getItem(LocalStorageKeys.HORNTYPE));
  const [range, setRange] = useState(localStorage.getItem(LocalStorageKeys.RANGE));
  const [useAccidentals, setUseAccidentals] = useState(localStorage.getItem(LocalStorageKeys.USEACCIDENTALS));

  const [pitchX, setPitchX] = useState(0);
  const [pitchY, setPitchY] = useState(0);

  let bBaseFreq = 30.87;
  let cBaseFreq = 32.70;
  let dbBaseFreq = 34.65;
  let dBaseFreq = 36.71;
  let ebBaseFreq = 38.89;
  let eBaseFreq = 41.20;
  let fBaseFreq = 43.65;
  let gbBaseFreq = 46.25;
  let gBaseFreq = 49.00;
  let abBaseFreq = 51.91;
  let aBaseFreq = 55.00;
  let bbBaseFreq = 58.27;
  let currentFreq = 0;
  
  // Create a synth instance
  const customContext = new Tone.Context({ latencyHint: "playback" });
  Tone.setContext(customContext);
  const myVol = new Tone.Volume(-10);
  const [synth, setSynth] = useState(new Tone.Synth().toDestination({ volume: myVol }));

  // horn key ids
  const ButtonNames = {
    T: "buttonT",
    ONE: "button1",
    TWO: "button2", 
    THREE: "button3",
    O: "buttonO"
  }

  // check to see if the user already has down the combination for the next card
  // (if so, we'll skip this card, so they don't get free points)
  const alreadyHaveKeysDown = (keysDown, possibleNextFingerings) => {
    let i = 0;
    while (i < possibleNextFingerings.length) {
      if (possibleNextFingerings[i].split('').every(char => keysDown.includes(char))) {
        return true;
      }
      i++;
    }
    return false;
  };

  // handle keyboard shortcuts
  const handleKeyPress = useCallback((event) => {
    if (event.key == 'x') {
      handleButtonClickOn(ButtonNames.T);
    } else if (event.key == 'd') {
      handleButtonClickOn(ButtonNames.ONE);
    } else if (event.key == 'e') {
      handleButtonClickOn(ButtonNames.TWO);
    } else if (event.key == '3') {
      handleButtonClickOn(ButtonNames.THREE);
    } else if (event.key == 'o') {
      handleButtonClickOn(ButtonNames.O);
    } else if (event.key == 'c') {
      handleClear();
    }
  }, []);

  // handle keyboard shortcuts
  const handleKeyUp = useCallback((event) => {
    if (event.key == 'x') {
      handleButtonClickOff(ButtonNames.T);
    } else if (event.key == 'd') {
      handleButtonClickOff(ButtonNames.ONE);
    } else if (event.key == 'e') {
      handleButtonClickOff(ButtonNames.TWO);
    } else if (event.key == '3') {
      handleButtonClickOff(ButtonNames.THREE);
    } else if (event.key == 'o') {
      handleButtonClickOff(ButtonNames.O);
    } else if (event.key == 'c') {
      setButtonStates({
        buttonT: false,
        button1: false,
        button2: false,
        button3: false,
        buttonO: false
      });
    }
  }, []);

  // listen for keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyUp]);

  //button logic
  const [buttonStates, setButtonStates] = useState({
    buttonT: false,
    button1: false,
    button2: false,
    button3: false,
    buttonO: false
  });

  // handle emergency clear all (probably don't need anymore)
  const handleClear = () => {
    setButtonStates({
      buttonT: false,
      button1: false,
      button2: false,
      button3: false,
      buttonO: false
    });
  }

  // set button states for just this button
  const handleButtonClickOn = (button) => {
    setButtonStates((prevState) => ({
      ...prevState,
      [button]: true,
    }));
  };

  const handleButtonClickOff = (button) => {
    setButtonStates((prevState) => ({
      ...prevState,
      [button]: false,
    }));
  };

  // returns this card's (i's) fingerings for user's horn type (ht)
  const getDefaultFingeringsForHornType = (i, ht) => {
    switch (ht) {
      case HornTypes.DOUBLEHORN:
        return fingerings[i].doubleFingerings;
      case HornTypes.SINGLEBB:
        return fingerings[i].BbFingerings;
      case HornTypes.SINGLEF:
        return fingerings[i].FFingerings;
      default:
        return null;
    }
  }

  // most of the time we get here, it's to handle correct answer and move on
  // need to refactor and split this up a bit
	const answerClick = (isCorrect, thisCombination) => {
    let oldcard = currentCard.current;
    // play audio of correct answer
    if (isCorrect && soundOn && fingerings[oldcard]) {
      const sampler = new Tone.Sampler({
        "Bb2" : "/horn-hero/samples/Bb2.mp3",
        "D3" : "/horn-hero/samples/D3.mp3",
        "F3" : "/horn-hero/samples/F3.mp3",
        "A3" : "/horn-hero/samples/A3.mp3",
        "C4" : "/horn-hero/samples/C4.mp3",
        "E4" : "/horn-hero/samples/E4.mp3",
        "G4" : "/horn-hero/samples/G4.mp3",
      }, function(){
        //sampler will repitch the closest sample
        console.log('ready and playing ' + fingerings[oldcard].soundingPitch);
        sampler.triggerAttackRelease(fingerings[oldcard].soundingPitch, "2n");
      }).toDestination();
    }
    //move on to next card
		currentCard.current = parseInt(Math.random() * fingerings.length);
    // gather user's possible notes to draw from
    // probably need to pull this out and only perform once
    let baseNotes = range == Ranges.ONEOCTAVE ? oneOctave : twoOctaves;
    let myNotes = [];
    if (useAccidentals == AccidentalSettings.EASY) {
      myNotes = baseNotes.concat((range == Ranges.ONEOCTAVE ? oneOctaveAccidentalsEasy : twoOctavesAccidentalsEasy));
    } else if (useAccidentals == AccidentalSettings.MOST) {
      myNotes = baseNotes.concat((range == Ranges.ONEOCTAVE ? oneOctaveAccidentalsMost : twoOctavesAccidentalsMost));
    } else if (useAccidentals == AccidentalSettings.ALL) {
      myNotes = baseNotes.concat((range == Ranges.ONEOCTAVE ? oneOctaveAccidentalsAll : twoOctavesAccidentalsAll));
    } else {
      myNotes = Array.from(baseNotes);
    }

    // if card is not in my list, or this fingering contained in previous fingering:
    // move on to another random card
    while (!myNotes.includes(fingerings[currentCard.current].noteId) 
      || (thisCombination && alreadyHaveKeysDown(thisCombination, 
            getDefaultFingeringsForHornType(currentCard.current, hornType)[0]))) {
      currentCard.current = parseInt(Math.random() * fingerings.length);
    }
    // we got to a card that will work
    setDisplayCard(currentCard.current);
    //make changes based on selection
		if (isCorrect && timerRunning) {
			setScore(score + 1);
		}
	};

  // this runs constantly, checking if buttons pressed match target fingerings
  const getBaseFrequency = () => {
    const { buttonT, button1, button2, button3, buttonO } = buttonStates;
    let combination = "";
    if (!buttonT && button1 && !button2 && !button3) {
      combination = "1";
      return ebBaseFreq;
    } else if (!buttonT && !button1 && button2 && !button3) {
      combination = "2";
      return eBaseFreq;
    } else if (!buttonT && !button1 && !button2 && button3) {
      combination = "3";
      return dBaseFreq;
    } else if (!buttonT && button1 && button2 && !button3) {
      combination = "12";
      return dBaseFreq;
    } else if (!buttonT && !button1 && button2 && button3) {
      combination = "23";
      return dbBaseFreq;
    } else if (!buttonT && button1 && !button2 && button3) {
      combination = "13";
      return cBaseFreq;
    } else if (!buttonT && button1 && button2 && button3) {
      combination = "123";
      return bBaseFreq;
    } else if (buttonT && !button1 && !button2 && !button3) {
      combination = "T";
      return bbBaseFreq;
    } else if (buttonT && button1 && !button2 && !button3) {
      combination = "T1";
      return abBaseFreq;
    } else if (buttonT && !button1 && button2 && !button3) {
      combination = "T2";
      return aBaseFreq;
    } else if (buttonT && !button1 && !button2 && button3) {
      combination = "T3";
      return gBaseFreq;
    } else if (buttonT && button1 && button2 && !button3) {
      combination = "T12";
      return gBaseFreq;
    } else if (buttonT && !button1 && button2 && button3) {
      combination = "T23";
      return gbBaseFreq;
    } else if (buttonT && button1 && !button2 && button3) {
      combination = "T13";
      return fBaseFreq;
    } else if (buttonT && button1 && button2 && button3) {
      combination = "T123";
      return eBaseFreq;
    } else if (buttonO) {
      combination = "0";
      return fBaseFreq;
    } else {
      combination = "nothing selected";
      return fBaseFreq;
    }
  };

  // see if timer still running (triggered from CountdownTimer)
  const handleTimerData = (data) => {
    setTimerRunning(data);
    if (!data) {
      setGameOver(true);
    }
  }

  // validate initials input as typed
  const handleInitialsChange = (e) => {
    const regex = /^[a-zA-Z]{0,3}$/; // Allow only three alpha characters
    if (regex.test(e.target.value)) {
      setInitials(e.target.value);
    }
  };

  // save score data and reset game state
  const handleSaveInitials = () => {
    localStorage.setItem('score:'+initials+','+new Date(), score);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  }
  // make sure user settings are up to date and start game
  const handleGameStart = () => {
    setHornType(localStorage.getItem(LocalStorageKeys.HORNTYPE));
    setRange(localStorage.getItem(LocalStorageKeys.RANGE));
    setUseAccidentals(localStorage.getItem(LocalStorageKeys.USEACCIDENTALS));
    setGameStarted(true);
    Tone.start();
  }

  const getHarmonicSeriesIndex = (loc) => {
    let frac = loc / 400;
    let series = Array.from({length: 16}, (e, i)=> i+1);
    for (let i = series.length; i > -1; i--) {
      if (frac < 1 / series[i]) return series[i];
    }
  }
    
	const setPitchCoordinates = (event) => {
    var br = document.getElementById("pitch-control").getBoundingClientRect();
    let x = parseInt(event.targetTouches[0].pageX - br.left || event.changedTouches[0].pageX - br.left);
    let y = parseInt(event.targetTouches[0].pageY - br.top || event.changedTouches[0].pageY - br.top);
		setPitchX(x);
    setPitchY(y);
	}

  const startNote = (event) => {
    setPitchCoordinates(event);
    currentFreq = getBaseFrequency() * getHarmonicSeriesIndex(pitchY);
    if (synth && pitchY > 0) {
      //console.log("synth play " + pitchY + ', ' + getHarmonicSeriesIndex(pitchY))
      synth.triggerAttack(currentFreq, '+0.05'); // Start playing a note
    }
  }

  const moveNote = (event) => {
    setPitchCoordinates(event);
    let thisFreq = getBaseFrequency() * getHarmonicSeriesIndex(pitchY);
    if (thisFreq != currentFreq) {
      currentFreq = thisFreq;
      synth.setNote(currentFreq);
    }
  }
  
  const endNote = (event) => {
    if (synth) {
      synth.triggerRelease(); // Start playing a note
    }
  }

  useEffect(() => {
    if (getScores()[0]) {
      // populate initials based on most recent score, if present
      setInitials(getScores()[0].initials);
    };
		answerClick(false);
  }, []);

  return (
    <div>
      <p style={{fontSize:"small"}}>{"base freq: " + getBaseFrequency() + ", y pos: " + pitchY}</p>
      <div id="valve-control">
        <div>
          <button className="key"
                  onMouseDown={() => handleButtonClickOn(ButtonNames.THREE)}
                  onTouchStart={() => handleButtonClickOn(ButtonNames.THREE)}
                  onMouseUp={() => handleButtonClickOff(ButtonNames.THREE)}
                  onTouchEnd={() => handleButtonClickOff(ButtonNames.THREE)}>
            <span>3 (3)</span>
          </button>
        </div>
        <div>
          <button className="key"
                  onMouseDown={() => handleButtonClickOn(ButtonNames.TWO)}
                  onTouchStart={() => handleButtonClickOn(ButtonNames.TWO)}
                  onMouseUp={() => handleButtonClickOff(ButtonNames.TWO)}
                  onTouchEnd={() => handleButtonClickOff(ButtonNames.TWO)}>
            <span>2 (e)</span>
          </button>
        </div>
        <div>
          <button className="key"
                  onMouseDown={() => handleButtonClickOn(ButtonNames.ONE)}
                  onTouchStart={() => handleButtonClickOn(ButtonNames.ONE)}
                  onMouseUp={() => handleButtonClickOff(ButtonNames.ONE)}
                  onTouchEnd={() => handleButtonClickOff(ButtonNames.ONE)}>
            <span>1 (d)</span>
          </button>
        </div>
        <div>
          <button className="key"
                  onMouseDown={() => handleButtonClickOn(ButtonNames.T)}
                  onTouchStart={() => handleButtonClickOn(ButtonNames.T)}
                  onMouseUp={() => handleButtonClickOff(ButtonNames.T)}
                  onTouchEnd={() => handleButtonClickOff(ButtonNames.T)}>
            <span>T (x)</span>
          </button>
        </div>
      </div>
      <div id="pitch-control" onTouchStart={startNote} onTouchMove={moveNote} 
          onTouchEnd={endNote}></div>
    </div>
  );
};

export default FingeringPractice;
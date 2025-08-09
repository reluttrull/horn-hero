import React, { useState } from "react";
import { LocalStorageKeys, Ranges, HornTypes, AccidentalSettings } from "../utils/GlobalKeys.js";

export const Settings = ({ triggerParent }) => {
  const [hornType, setHornType] = useState(localStorage.getItem(LocalStorageKeys.HORNTYPE));
  const [range, setRange] = useState(localStorage.getItem(LocalStorageKeys.RANGE));
  const [useAccidentals, setUseAccidentals] = useState(localStorage.getItem(LocalStorageKeys.USEACCIDENTALS));

  const handleHornTypeChange = (event) => {
    if (event.target.value != "...") {
      setHornType(event.target.value);
      localStorage.setItem(LocalStorageKeys.HORNTYPE, event.target.value);
    }
    if (triggerParent) {
      triggerParent();
    }
  }

  const handleRangeChange = (event) => {
    if (event.target.value != "...") {
      setRange(event.target.value);
      localStorage.setItem(LocalStorageKeys.RANGE, event.target.value);
    }
    if (triggerParent) {
      triggerParent();
    }
  }

  const handleAccidentalsChange = (event) => {
    if (event.target.value != "...") {
      setUseAccidentals(event.target.value);
      localStorage.setItem(LocalStorageKeys.USEACCIDENTALS, event.target.value);
    }
    if (triggerParent) {
      triggerParent();
    }
  }

  return (
    <div>
      <div>
        <label className="question" htmlFor="dropdown">What type of horn do you play?</label>
        <select id="hornTypeDropdown" value={hornType} onChange={handleHornTypeChange}>
          <option value="...">...</option>
          <option value={HornTypes.SINGLEBB}>Single Bb horn</option>
          <option value={HornTypes.SINGLEF}>Single F horn</option>
          <option value={HornTypes.DOUBLEHORN}>Double horn</option>
        </select>  
      </div>
      <div>
        <label className="question" htmlFor="dropdown">How wide a range do you want to practice?</label>
        <select id="rangeDropdown" value={range} onChange={handleRangeChange}>
          <option value="...">...</option>
          <option value={Ranges.ONEOCTAVE}>1 octave (C to C)</option>
          <option value={Ranges.TWOOCTAVES}>2 octaves (F to F)</option>
        </select>  
      </div>
      <div>
        <label className="question" htmlFor="dropdown">How many accidentals (♭/♯) do you want to practice?</label>
        <select id="accidentalsDropdown" value={useAccidentals} onChange={handleAccidentalsChange}>
          <option value="...">...</option>
          <option value={AccidentalSettings.NO}>none</option>
          <option value={AccidentalSettings.EASY}>only a few of the most common</option>
          <option value={AccidentalSettings.MOST}>almost all</option>
          <option value={AccidentalSettings.ALL}>all, including E♯, C♭, etc.</option>
        </select>  
      </div>
    </div>
  );
};

export default Settings;
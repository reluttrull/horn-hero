import { useEffect, useState } from 'react'
import { FaBookOpen, FaChartLine, FaGear, FaPlay, FaArrowLeft, FaArrowRight, FaSun, FaMoon } from 'react-icons/fa6';
import './App.css'
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { FingeringPractice } from './components/FingeringPractice.jsx';
import { Settings } from './components/Settings.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { Study } from './components/Study.jsx';
import { LocalStorageKeys, Themes } from './utils/GlobalKeys.js';

function App() {
  const Tabs = {
    FINGERINGPRACTICE: 'fingeringPractice',
    SETTINGS: 'settings',
    MYLEADERBOARD: 'myLeaderboard',
    GLOBALLEADERBOARD: 'globalLeaderboard',
    STUDY: 'study'
  };
  const [tab, setTab] = useState(Tabs.FINGERINGPRACTICE);

  const [hornType, setHornType] = useState(localStorage.getItem(LocalStorageKeys.HORNTYPE));
  const [range, setRange] = useState(localStorage.getItem(LocalStorageKeys.RANGE));
  const [useAccidentals, setUseAccidentals] = useState(localStorage.getItem(LocalStorageKeys.USEACCIDENTALS));
  const [theme, setTheme] = useState(localStorage.getItem(LocalStorageKeys.THEME));

  const checkFirstTime = () => {
    if (hornType && range && useAccidentals) {
      let lastLogin = localStorage.getItem('lastLogin');
      if (!lastLogin) {
        localStorage.setItem('lastLogin', new Date().toDateString());
      }
      return false;
    }
    else {
      return true;
    }
  }

  // if state changed in settings component, check if we can get rid of first-time modal
  const handleSettingsChange = () => {
    setHornType(localStorage.getItem(LocalStorageKeys.HORNTYPE));
    setRange(localStorage.getItem(LocalStorageKeys.RANGE));
    setUseAccidentals(localStorage.getItem(LocalStorageKeys.USEACCIDENTALS));
    checkFirstTime();
  };

  const toggleTheme = () => {
    if (theme == Themes.DARKMODE) {
      setTheme(Themes.LIGHTMODE);
    } else if (theme == Themes.LIGHTMODE) {
      setTheme(Themes.DARKMODE);
    }
  }

  // whenever changed, switch html body to new mode class
  useEffect(() => {
    document.body.className = (theme == Themes.DARKMODE ? "dark-mode" : "light-mode");
    localStorage.setItem(LocalStorageKeys.THEME, theme);
  }, [theme]);

  // on first render, if setting not stored, check system light/dark mode preference
  useEffect(() => {
    if (theme == null) {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)")?.matches ? 
              Themes.DARKMODE : Themes.LIGHTMODE);
      console.log('first time ' + (theme == Themes.DARKMODE ? 'dark' : 'light'));
    }
  }, []);

  return (
    <>
      <div id="tab-block">
        <button alt="play" title="Play" 
              onClick={() => {setTab(Tabs.FINGERINGPRACTICE)}}><FaPlay /></button>
        <button alt="study" title="Study" 
              onClick={() => {setTab(Tabs.STUDY)}}><FaBookOpen /></button>
        <button alt="settings" title="Settings" 
              onClick={() => {setTab(Tabs.SETTINGS)}}><FaGear /></button>
        <button alt="leaderboard" title="Leaderboard" 
              onClick={() => {setTab(Tabs.MYLEADERBOARD)}}><FaChartLine /></button>
        <button alt="light/dark theme" title="Light/Dark Theme" id="theme-toggle" 
              onClick={() => toggleTheme()}>
                {theme == Themes.DARKMODE ? <FaArrowLeft /> : <FaSun />}
                {theme == Themes.DARKMODE ? <FaMoon /> : <FaArrowRight />}
        </button>
      </div>
      {!checkFirstTime() && (
      <ErrorBoundary>
        { tab == Tabs.FINGERINGPRACTICE ? <FingeringPractice /> : <div></div>}
        { tab == Tabs.STUDY ? <Study /> : <div></div>}
        { tab == Tabs.SETTINGS ? <div><h3>Settings</h3><Settings /></div> : <div></div>}
        { tab == Tabs.MYLEADERBOARD ? <Leaderboard /> : <div></div>}
      </ErrorBoundary>)}
    </>
  )
}

export default App

import './App.css';
import { useState } from 'react';
import { useKey, useKeyPressEvent } from 'react-use';
import Cat from '../components/Cat/Cat'
import BpmForm from './BpmForm/BpmForm';
import BpmRange from './BpmRange/BpmRange';
import DarkModeBtn from './DarkModeBtn/DarkModeBtn';
import StartStop from './StartStop/StartStop'
import BeatBtn from './BeatBtn/BeatBtn';
import SoundBtn from './SoundBtn/SoundBtn';
import * as Tone from 'tone';

const posX = 0;
const posY = 0;
const width = 360;
const height = 550;
const bpmDefault = 120.0;
const bpmMin = 40;
const bpmMax = 218;

// エンベロープ（キック）
let optsMembrane = {
  pitchDecay: 0.001,
  envelope: {
    attack: 0.005,
    decay: 0.4,
    sustain: 0,
    release: 0.1
  },
  volume: 15 
}

const bass = new Tone.MembraneSynth(optsMembrane).toDestination();
const meow1 = new Audio("/norinori-cat/sound/cat-meowing-1.mp3");
const meow2 = new Audio("/norinori-cat/sound/cat-meowing-2.mp3");

function App() {
  const [bpm, setBpm] = useState({ "now": 0.01, "pre": bpmDefault });
  const [mode, setMode] = useState('light');
  const [control, setControl] = useState('stop');
  const [isMute, setIsMute] = useState(true);
  const [beat, setBeat] = useState('4');
  const [isFirst, setIsFirst] = useState(true);


  const changeBpmForm = () => {
    const bpmForm = document.getElementById("bpm-form");
    const bpmRange = document.getElementById("bpm-range");
    let prebpm = bpm["now"];
    let v = bpmForm.value;
    if (String(v).match(/^\d+$/) && v > bpmMin && v < bpmMax && v !== null && control !== 'stop') {
      setBpm(
        {
          "pre": prebpm,
          "now": Number(v)
        }
      );
    }
    bpmRange.value = String(v);
    if (control === 'stop') {
      switchPlay();
    }
  }

  const changeBpmRange = () => {
    const bpmForm = document.getElementById("bpm-form");
    const bpmRange = document.getElementById("bpm-range");
    let prebpm = bpm["now"];
    let v = bpmRange.value;
    if (v !== null && control !== 'stop') {
      setBpm(
        {
          "pre": prebpm,
          "now": Number(v)
        }
      );
    }
    bpmForm.value = String(v);
    if (control === 'stop') {
      switchPlay();
    }
  }

  const bpmToSecondsStr = (bpm, beat = 4, note = 4) => {
    let b = beat / note; // 拍数を計算する ? / 4
    return ((60 / bpm) / b).toFixed(2);
  }

  const switchPlay = () => {
    const playBtn = document.getElementById('startstop-btn');
    const soundBtn = document.getElementById('sound-btn');
    const bpmForm = document.getElementById("bpm-form");
    let vf = bpmForm.value;
    let nowbpm = bpm.now;

    if (control === 'play') {
      playBtn.innerHTML = '<img src="/norinori-cat/image/play.png" alt="play" />';
      setControl('stop');
      setBpm(
        {
          "pre": nowbpm,
          "now": 0.01
        }
      );

      soundBtn.innerHTML = '<img src="/norinori-cat/image/soundx.png" alt="fs" />';
      Tone.Transport.stop();
      setIsMute(true);
    } else if (control === 'stop') {
      playBtn.innerHTML = '<img src="/norinori-cat/image/stop.png" alt="stop" />';
      setControl('play');
      setBpm(
        {
          "pre": 0.01,
          "now": vf,
        }
      );
    }
  }

  const switchDarkMode = () => {
    const body = document.body;
    const darkBtn = document.getElementById('darkmode-btn');
    const playBtn = document.getElementById('startstop-btn');
    const soundBtn = document.getElementById('sound-btn');
    const bpmRange = document.getElementById("bpm-range");
    const catBodyLine = document.getElementById('body-line');
    const catEyeR = document.getElementById('right-eye');
    const catEyeL = document.getElementById('left-eye');
    const catMou = document.getElementById('cat-mouth');
    const codeBlk = document.querySelectorAll('.footer-ele code');

    if (mode === 'light') {
      // ボタン
      darkBtn.innerHTML = '<img src="/norinori-cat/image/moon.png" alt="moon" />';
      darkBtn.style.backgroundColor = "#fcdddb";
      playBtn.style.backgroundColor = "#fff199";
      soundBtn.style.backgroundColor = "#c0e4c9";

      bpmRange.style.color = '#fefefe';

      // 全体
      body.style.backgroundColor = "#121121";
      body.style.color = "#fefefe";
      for (let code of codeBlk) {
        code.setAttribute('style', 'background-color: #777777');
      }

      // 猫周り
      catBodyLine.setAttribute('fill', '#121211');
      catBodyLine.setAttribute('stroke', '#333333');
      catEyeR.setAttribute('fill', '#fffc2e');
      catEyeL.setAttribute('fill', '#fffc2e');
      catMou.style.display = "inherit";
      setMode('dark');
    } else if (mode === 'dark') {
      // ボタン
      darkBtn.innerHTML = '<img src="/norinori-cat/image/sun.png" alt="sun" />';
      darkBtn.style.backgroundColor = "#ffb2b2";
      playBtn.style.backgroundColor = "#ffeb58";
      soundBtn.style.backgroundColor = "#8ec29b";
      bpmRange.style.color = '#000000';
      // 全体
      body.style.backgroundColor = "#fefefe";
      body.style.color = "#121121";
      for (let code of codeBlk) {
        code.setAttribute('style', 'background-color: #ebebeb');
      }
      // 猫周り
      catBodyLine.setAttribute('fill', '#ffffff');
      catBodyLine.setAttribute('stroke', '#000000');
      catEyeR.setAttribute('fill', '#000000');
      catEyeL.setAttribute('fill', '#000000');
      catMou.style.display = "none";
      setMode('light');
    }
  }

  const notes = [
    "C3", "C4", "C3", "C4"
  ];
  let index = 0;

  const switchSound = () => {
    const soundBtn = document.getElementById('sound-btn');
    const initSound = new Audio("/norinori-cat/sound/sit.mp3");

    if (isFirst) {
      console.log('first');
      Tone.Transport.scheduleRepeat(time => {
        let note = notes[index % notes.length];
        bass.triggerAttackRelease(note, "4n", time);
        index++;
      }, "8n");
      initSound.play();
      setIsFirst(false);
      Tone.Transport.start();
    }

    if (isMute) {
      soundBtn.innerHTML = '<img src="/norinori-cat/image/soundo.png" alt="ts" />';
      setIsMute(false); // Muteを解除する
      if (bpm.now > bpmMin) {
        // 初期化時対応
        Tone.Transport.bpm.value = bpm.now;
      } else {
        Tone.Transport.bpm.value = bpmDefault;
      }
      Tone.Transport.start();
    } else {
      soundBtn.innerHTML = '<img src="/norinori-cat/image/soundx.png" alt="fs" />';
      Tone.Transport.stop();
      setIsMute(true); // Muteにする
    }
  }

  const changeBeat = e => setBeat(e.target.value);
  if (control !== 'play') {
    Tone.Transport.bpm.value = bpm.pre;
  } else {
    Tone.Transport.bpm.value = bpm.now;
  }

  const playMeow = () => {
    console.log("Meow");
    meow1.currentTime = 0;
    meow2.currentTime = 0;
    if (!isMute) {
      if (mode === 'light') {
        meow2.play();
      } else {
        meow1.play();
      }
    }
  }



  // KeyPress Event
  // Block default Key Event
  window.addEventListener(
    'keydown',
    e => {
      let code = e.code;
      switch (code) {
        case 'Space':
        case 'KeyV':
        case 'KeyB':
        case 'KeyN':
        case 'KeyM':
          e.preventDefault();
          break;
        default:
      }
    },
    true
  )
  useKey('v', () => {
    const bpmForm = document.getElementById("bpm-form");
    const bpmRange = document.getElementById("bpm-range");
    let prebpm = bpm["now"];
    if (bpmForm.value > bpmMin && bpmForm.value !== null) {
      bpmForm.value = String(Number(bpmForm.value) - 1);
      bpmRange.value = String(Number(bpmRange.value) - 1);
      setBpm(
        {
          "pre": prebpm,
          "now": Number(bpmForm.value)
        }
      );
    }
    if (control === 'stop') {
      switchPlay();
    }
  });
  useKey('m', () => {
    const bpmForm = document.getElementById("bpm-form");
    const bpmRange = document.getElementById("bpm-range");
    let prebpm = bpm["now"];
    if (bpmForm.value < bpmMax) {
      bpmForm.value = String(Number(bpmForm.value) + 1);
      bpmRange.value = String(Number(bpmRange.value) + 1);
      setBpm(
        {
          "pre": prebpm,
          "now": Number(bpmForm.value)
        }
      );
    }
    if (control === 'stop') {
      switchPlay();
    }
  });
  useKeyPressEvent('n', switchDarkMode);
  useKeyPressEvent('b', switchSound);
  useKeyPressEvent(' ', switchPlay);

  return (
    <div className="App">
      <Cat
        width={width} height={height}
        posX={posX} posY={posY}
        speed={bpmToSecondsStr(bpm.now, Number(beat))}
        onClick={playMeow}
      />
      {/* <ClickField id="click-field" /> */}
      <BpmForm
        min={bpmMin} max={bpmMax} defaultValue={bpmDefault}
        onChange={changeBpmForm}
      />
      <BeatBtn
        value={beat}
        onChange={changeBeat}
      />

      <BpmRange
        min={bpmMin} max={bpmMax} defaultValue={bpmDefault}
        onChange={changeBpmRange}
      />
      <div className="app-ele control-1">
        <SoundBtn onClick={switchSound} />
        <StartStop onClick={switchPlay} type={control} />
        <DarkModeBtn onClick={switchDarkMode} mode={mode} />
      </div>
    </div>
  );
}

export default App;

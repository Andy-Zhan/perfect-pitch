import React, { useState, useEffect, useCallback } from "react";
import { Button, Paper, Typography } from "@material-ui/core";
import Soundfont from "soundfont-player";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    alignItems: "center",
    backgroundColor: "#DFDBE5",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='46' viewBox='0 0 70 46'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpolygon points='68 44 62 44 62 46 56 46 56 44 52 44 52 46 46 46 46 44 40 44 40 46 38 46 38 44 32 44 32 46 26 46 26 44 22 44 22 46 16 46 16 44 12 44 12 46 6 46 6 44 0 44 0 42 8 42 8 28 6 28 6 0 12 0 12 28 10 28 10 42 18 42 18 28 16 28 16 0 22 0 22 28 20 28 20 42 28 42 28 28 26 28 26 0 32 0 32 28 30 28 30 42 38 42 38 0 40 0 40 42 48 42 48 28 46 28 46 0 52 0 52 28 50 28 50 42 58 42 58 28 56 28 56 0 62 0 62 28 60 28 60 42 68 42 68 0 70 0 70 46 68 46'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  paper: {
    padding: 20,
    height: 400,
    borderRadius: 20,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  actionButton: {
    margin: 10,
  },
  keys: {
    padding: 10,
  },
  lives: {
    animation: `$loseLife 1000ms ${theme.transitions.easing.easeInOut}`,
  },
  "@keyframes loseLife": {
    "0%": {
      opacity: 0,
      fontSize: 30,
    },
    "100%": {
      opacity: 1,
      fontSize: "1rem",
    },
  },
}));

const Player = () => {
  const classes = useStyles();
  const pitches = [
    "C",
    "C♯",
    "D",
    "E♭",
    "E",
    "F",
    "F♯",
    "G",
    "A♭",
    "A",
    "B♭",
    "B",
  ];
  const synthPitches = [
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];
  const blackKeys = [1, 3, 6, 8, 10];
  const [pitchSelect, setPitchSelect] = useState(
    new Array(pitches.length).fill(false)
  );
  const [pitchCorrect, setPitchCorrect] = useState(
    new Array(pitches.length).fill(false)
  );
  const [pitchPlay, setPitchPlay] = useState<Array<string>>([]);
  const [lives, setLives] = useState(3);
  const [livesAnimation, setLivesAnimation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [noteCount, setNoteCount] = useState(1);
  const [getNewChord, setGetNewChord] = useState(true);
  const [lastChord, setLastChord] = useState("");

  const restart = () => {
    clearSelect();
    setLives(3);
    setCorrectCount(0);
    setNoteCount(1);
    setGetNewChord(true);
  };

  const times = (x: number) => (f: any) => {
    if (x > 0) {
      f();
      times(x - 1)(f);
    }
  };

  const clearSelect = () => {
    setPitchSelect(new Array(pitches.length).fill(false));
  };

  const randint = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const togglePitch = (pos: number) => {
    let arr = pitchSelect.slice();
    arr[pos] = !arr[pos];
    setPitchSelect(arr);
  };

  const play = () => {
    Soundfont.instrument(new AudioContext(), "acoustic_grand_piano").then(
      (piano) => {
        pitchPlay.forEach((note) => piano.play(note));
      }
    );
  };

  const newChord = useCallback(() => {
    let toPlay: Array<string> = [];
    let keys = new Array(pitches.length).fill(false);
    let note: string;
    let key: number;

    times(noteCount)(() => {
    do {
        key = randint(0, 11);
        note = synthPitches[key].concat(randint(2, 5).toString());
    } while (toPlay.includes(note));
    toPlay.push(note);
    keys[key] = true;
    });

    setPitchCorrect(keys);
    setPitchPlay(toPlay);
  },[])

  useEffect(() => {
    if (getNewChord) {
        newChord()
        setGetNewChord(false)
    }
  }, [getNewChord, newChord]);

  useEffect(play, [pitchPlay]);

  const updateLastChord = () => {
    setLastChord(
      pitchPlay
        .sort(
          (a: string, b: string) =>
            parseInt(a.slice(-1)) - parseInt(b.slice(-1)) ||
            synthPitches.indexOf(a.slice(0, -1)) -
              synthPitches.indexOf(b.slice(0, -1))
        )
        .map((note: string) =>
          pitches[synthPitches.indexOf(note.slice(0, -1))].concat(
            note.slice(-1)
          )
        )
        .join(" - ")
    );
  };

  const check = () => {
    if (pitchSelect.every((value, index) => value === pitchCorrect[index])) {
      if (correctCount % 3 === 2) setNoteCount(c => c+1);
      setCorrectCount(c=>c+1);
      clearSelect();
      updateLastChord();
      setGetNewChord(true);
    } else {
      if (lives === 1) {
        updateLastChord();
      }
      setLives(lives - 1);
      setLivesAnimation(true);
      setTimeout(() => setLivesAnimation(false), 1000);
    }
  };

  return (
    <div className={classes.root}>
      <Paper elevation={5} className={classes.paper}>
        <Typography variant="h4" style={{ textAlign: "center", padding: 20 }}>
          Perfect Pitch Trainer
        </Typography>
        <div className={classes.keys}>
          {pitches.map((p, i) => (
            <Button
              key={i}
              style={{
                width: 15,
                backgroundColor: pitchSelect[i]
                  ? "purple"
                  : blackKeys.includes(i)
                  ? "black"
                  : "white",
                color:
                  pitchSelect[i] || blackKeys.includes(i) ? "white" : "black",
              }}
              variant={pitchSelect[i] ? "contained" : "text"}
              onClick={() => togglePitch(i)}
            >
              {p}
            </Button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={play}
            className={classes.actionButton}
          >
            Play sound
          </Button>

          {lives === 0 ? (
            <Button
              variant="contained"
              className={classes.actionButton}
              color="primary"
              onClick={restart}
            >
              Restart
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={check}
              disabled={lives === 0}
              className={classes.actionButton}
            >
              Confirm
            </Button>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            marginTop: 50,
          }}
        >
          <Typography variant="body1">Number of notes: {noteCount}</Typography>
          <Typography variant="body1" style={{ color: "green" }}>
            Correct: {correctCount}
          </Typography>
          <Typography
            variant="body1"
            style={{
              color: lives === 1 ? "red" : "grey",
              position: "relative",
              paddingRight: 15,
            }}
          >
            Lives left:{" "}
            <span
              style={{ position: "absolute", paddingLeft: 5 }}
              className={livesAnimation ? classes.lives : undefined}
            >
              {lives}
            </span>
          </Typography>
        </div>
        <Typography
          variant="body2"
          style={{ color: lives === 0 ? "red" : "green", height: 20 }}
        >
          {lastChord && `The ${lastChord.length>3?'full chord':'note'} was ${lastChord}`}
        </Typography>
      </Paper>
    </div>
  );
};

export default Player;

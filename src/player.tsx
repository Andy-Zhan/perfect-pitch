import React, { useState, useEffect, useCallback, useContext } from "react";
import { Button, Paper, Typography, IconButton, Tooltip, Fade } from "@material-ui/core";
import Soundfont from "soundfont-player";
import { makeStyles } from "@material-ui/core/styles";
import { soundContext } from "./app";
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add'
import clsx from 'clsx'

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
    padding: '80px 20px 50px 20px',
    height: 210,
    width: 500,
    borderRadius: 20,
    display: "flex",
    justifyContent: "flex-end",
    flexDirection: "column",
    position: "relative",
    transition: theme.transitions.create(["height", "width"], {easing: theme.transitions.easing.easeInOut, duration: 500}),
  },
  paperBig: {
    height: 350,
    width: 800,
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
  startScreen: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  startButton: {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: "white",
    margin: 10,
  },
  incrementButton: {
      fontSize: '1rem',
      margin: 5,
  },
  link: {
      textDecoration: 'none',
      color: 'lightpink',
      '&:hover': {
          color: 'aquamarine'
      }
  }
}));

const Player = () => {
  enum Mode {
    Survival,
    Practice,
  }

  const classes = useStyles();
  const ac = useContext(soundContext);
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
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [livesAnimation, setLivesAnimation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastIncorrect, setLastIncorrect] = useState(false)
  const [noteCount, setNoteCount] = useState(1)
  const [started, setStarted] = useState(false);
  const [lastChord, setLastChord] = useState("");
  const [mode, setMode] = useState<Mode>(Mode.Survival);
  const [updateChord, setUpdateChord] = useState(false);
  const [expand, setExpand] = useState(false);

  useEffect(()=>{if (started){
      setExpand(false)
      setTimeout(()=>setExpand(true), 600)
    }
  else {
      setExpand(false)
  }},[started])

  const restart = () => {
    clearSelect();
    setCorrectCount(0);
    setIncorrectCount(0);
    setNoteCount(1)
    setLastChord("");
    setLivesAnimation(false);
    setUpdateChord(true);
  };

  const lives = () => {
    return Math.max(3 - incorrectCount, 0);
  };

  const start = (mode: Mode) => {
    setMode(mode);
    setStarted(true);
    restart();
  };

  const toMenu = () => {
    setStarted(false);
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
    Soundfont.instrument(ac, "acoustic_grand_piano").then((piano) => {
      pitchPlay.forEach((note) => piano.play(note, ac.currentTime, { duration: 1}));
    });
  };

  const newChord = useCallback(() => {
    let toPlay: Array<string> = [];
    let keys = new Array(pitches.length).fill(false);
    let note: string;
    let key: number;
    const times = (x: number) => (f: any) => {
        if (x > 0) {
          f();
          times(x - 1)(f);
        }
      };

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
  }, [noteCount, pitches.length, synthPitches])

  useEffect(play, [pitchPlay]);

  useEffect(() => {
      if (updateChord) {
          setUpdateChord(false)
          return () => newChord()
      }
    }, [updateChord, newChord])

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
      if (mode === Mode.Survival && correctCount % 3 === 2) setNoteCount(c => c+1)
      setLastIncorrect(false)
      setCorrectCount((c) => c + 1);
      clearSelect();
      updateLastChord();
      setUpdateChord(true);
    } else {
      if (mode === Mode.Survival) {
        if (lives() === 1) {
            setLastIncorrect(true)
          updateLastChord();
        }
        setIncorrectCount((c) => c + 1);
        setLivesAnimation(true);
        setTimeout(() => setLivesAnimation(false), 1000);
      } else if (mode === Mode.Practice) {
        setLastIncorrect(true)
        setIncorrectCount((c) => c + 1);
        clearSelect();
        updateLastChord();
        setUpdateChord(true);
      }
    }
  };

  return (
    <div className={classes.root}>
      <Paper elevation={5} className={clsx(classes.paper, started && classes.paperBig)}>
          <div style={{position: "absolute", top: 50, left: "50%" }}>
        <Typography variant="h4" style={{ textAlign: "center", padding: 20, position: 'relative', left: '-50%', width: 'max-content'}}>
          Perfect Pitch Trainer
        </Typography>
        </div>
        {!started ? (<Fade in ={!expand} timeout={{enter:500, exit: 0}}>
          <div className={classes.startScreen}>
            <Typography variant="body1" style={{ textAlign: "center" }}>
              Train your ear!
            </Typography>
            <div style={{ padding: '40px 20px 0 20px' }}>
            <Tooltip title="3 lives. Difficulty increases over time.">
              <Button
                variant="contained"
                className={classes.startButton}
                disabled={started}
                onClick={() => start(Mode.Survival)}
              >
                Survival
              </Button>
              </Tooltip>
              <Tooltip title="Set the number of notes per chord.">
              <Button
                variant="contained"
                className={classes.startButton}
                disabled={started}
                onClick={() => start(Mode.Practice)}
              >
                Practice
              </Button>
              </Tooltip>
            </div>
          </div></Fade>
        ) : (
            <Fade in ={expand} timeout={{enter:500, exit: 0}}>
          <div>
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
                      pitchSelect[i] || blackKeys.includes(i)
                        ? "white"
                        : "black",
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

              {mode === Mode.Survival && lives() === 0 ? (
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
                  disabled={mode === Mode.Survival && lives() === 0}
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
              {mode === Mode.Survival?<Typography variant="body1">
                Number of notes: {noteCount}
              </Typography>:<Typography variant="body1">
                Number of notes: 
                <IconButton size='small' onClick={()=>setNoteCount(Math.max(1, noteCount-1))}><RemoveIcon className={classes.incrementButton}/></IconButton>
                    {noteCount}
                    <IconButton size='small' onClick={()=>setNoteCount(Math.min(12, noteCount+1))}><AddIcon className={classes.incrementButton}/></IconButton>
                    
              </Typography>}
              <Typography variant="body1" style={{ color: "green" }}>
                Correct: {correctCount}
              </Typography>
              {mode === Mode.Survival ? (
                <Typography
                  variant="body1"
                  style={{
                    color: lives() < 2 ? "red" : "grey",
                    position: "relative",
                    paddingRight: 15,
                  }}
                >
                  Lives left:{" "}
                  <span
                    style={{ position: "absolute", paddingLeft: 5 }}
                    className={livesAnimation ? classes.lives : undefined}
                  >
                    {lives()}
                  </span>
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  style={{
                    color: "red",
                  }}
                >
                  Incorrect: {incorrectCount}
                </Typography>
              )}
            </div>
            <Typography
              variant="body2"
              style={{ color: lastIncorrect ? "red" : "green", height: 20, position: 'absolute', left: 15, bottom: 10 }}
            >
              {lastChord &&
                `The ${
                  lastChord.length > 3 ? "full chord" : "note"
                } was ${lastChord}`}
            </Typography>
            <Button
              style={{
                position: "absolute",
                right: 8,
                bottom: 5,
                color: "lightgray",
              }}
              onClick={toMenu}
            >
              switch mode
            </Button>
          </div>
          </Fade>
        )}
      </Paper>
      <div style={{position: 'absolute', bottom: 20, right: 20, background: 'rgba(0,0,0,0.5)', color: 'white', padding: 10, borderRadius: 15}}>
      <Typography variant='body2'>Made with ❤️ by <a className={classes.link} href='https://www.youtube.com/channel/UCeYjyvmYEdEWlUkB-YYeNUw'>Andy Zhan</a></Typography>
      </div>
    </div>
  );
};

export default Player;

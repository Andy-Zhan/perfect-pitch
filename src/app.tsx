import React, { createContext } from "react";
import Player from "./player";

import { ThemeProvider } from "@material-ui/core/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import purple from "@material-ui/core/colors/purple";
import pink from "@material-ui/core/colors/pink";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: pink[500],
    },
  },
  typography: {
    fontFamily: "Montserrat",
  },
});

export const soundContext = createContext(new AudioContext());

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Player />
    </ThemeProvider>
  );
}

export default App;

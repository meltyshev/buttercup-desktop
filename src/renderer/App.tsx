import React from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { ipcRenderer as ipc } from 'electron';

ipc.send('init');

const App = () => (
  <div>
    <h1>Hello, world 7.</h1>
  </div>
);

export default hot(App);

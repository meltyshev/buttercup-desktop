import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <h1>Hello Siree</h1>
    </AppContainer>,
    document.getElementById('root')
  )
);
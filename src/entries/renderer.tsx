import * as React from 'react';
import * as ReactDOM from 'react-dom';

console.log('HELLO!');

const Index = () => {
  return <div>Hello World!</div>;
};

ReactDOM.render(<Index />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}

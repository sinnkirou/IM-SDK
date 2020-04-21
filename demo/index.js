import React from 'react';
import ReactDOM from 'react-dom';
import demo from './demo';

const render = Component => {
    ReactDOM.render(
        <Component />,
        document.getElementById('root'),
    );
};

render(demo);

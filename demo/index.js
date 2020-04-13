import React from 'react';
import ReactDOM from 'react-dom';
import './App.less';
import 'react-chat-elements/dist/main.css';
import App from './App';

const render = Component => {
    ReactDOM.render(
        <Component/>,
        document.getElementById('root'),
    );
};

render(App);

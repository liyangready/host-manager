import ReactDom from 'react-dom';
import React from 'react';
import App from './component/app.jsx';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import hostManager from './reducer/reducer.js';
import { doAddEnv, doSwitchEnv, doDelEnv, doSaveEnv, doEditEnv, test } from './action/action.js';

let store = createStore(hostManager);
ReactDom.render(
	<Provider store={store}>
    	<App />
  	</Provider>,
	document.querySelectorAll('.js-app')[0]
);

import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './styles/main.scss';
import "./styles/patternlock.css";
import GameLogic from './GameLogic';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import ReactGA from 'react-ga';
const TRACKING_ID = "G-ZEPK0MGHLE";
ReactGA.initialize(TRACKING_ID);
ReactGA.pageview(window.location.pathname + window.location.search);


function App() {
    // level: easy, medium, advanced, expert
    const [level, setLevel] = useState("easy");

    return (
				<GameLogic level={level}
                   onLevel={(l)=>setLevel(l)}
                   hintLimit={5} />
        );
}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

serviceWorkerRegistration.register();

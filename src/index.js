import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './styles/main.scss';
import "./styles/patternlock.css";
import GameLogic from './GameLogic';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { init } from './Analytics'

init()

function App() {
    const levelKey = 'level';
    // level: easy, medium, advanced, expert
    const [level, setLevel] = useState(localStorage.getItem(levelKey) || 'easy');
    React.useEffect(() => {
        localStorage.setItem(levelKey, level);
    }, [level]);

    // theme: theme-dark, ...
    const themeKey = 'theme';
    const [theme, setTheme] = useState(localStorage.getItem(themeKey) || 'theme-dark');
    React.useEffect(() => {
        localStorage.setItem(themeKey, theme);
    }, [theme]);


    return (
        <GameLogic level={level}
                   onLevel={(l)=>setLevel(l)}
                   theme={theme}
                   onTheme={(t)=>{setTheme(t);}}
                   hintLimit={5} />
        );
}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

serviceWorkerRegistration.register();

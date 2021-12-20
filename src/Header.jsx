import React, { useState } from "react";
import { iconTime, iconSettings, iconClose } from "./Svg";

const levels = {
    easy:"lahka",
    medium:"srednja",
    advanced:"tezka",
    expert:"zelo tezka",
};
const themes = {
    "theme-light": "svetle",
    "theme-dark": "temne",
};
const Header = ({theme, level, elapsed, score, onReload, onTheme}) => {
    const [toggle, setToggle] = useState(false);
    const toggleHandler = () => setToggle(!toggle);

    function modalWindow() {
        return (
            <div className="c-dialog">
              <div className="c-dialog__container">
                <button
                  onClick={ toggleHandler }
                  className="c-dialog__close"
                >
                  { iconClose() }
                </button>
                <h1>Nova igra</h1>
                <ul>
                  {Object.keys(levels).map((level) => {
                      return (
                          <li key={level}>
                            <button onClick={(e) => onReload(level)} title="Reload">
                              {levels[level]}
                            </button>
                          </li>
                      );
                  })}
                </ul>
                <h1>Nastavi barve</h1>
                <ul>
                  {["theme-dark", "theme-light"].map((new_theme) => {
                      return (
                          <li key={new_theme}>
                            <button className={`${new_theme} c-table__cell--solved`}
                                    onClick={(e) => {alert(theme + " klik "+new_theme );onTheme(new_theme);}}
                                    title="Reload">
                              {new_theme === theme ? 'X' : 'O'} &nbsp;
                              {themes[new_theme]}
                            </button> &nbsp;&nbsp;&nbsp;
                          </li>
                      );
                  })}
                </ul>
              </div>
            </div>
        );
    }
    
    const headerClass = "c-header"
    const headerItemClass = `${headerClass}__item`
    
    return (
        <>
          <header className={ headerClass }>
            <div className={`${headerItemClass} ${headerItemClass}--left`}>
              { iconTime() }
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2,'0')}
            </div>
            <div className={`${headerItemClass} ${headerItemClass}--center`}>
              {score.guess}/{score.words}
              &nbsp;
              ({levels[level]})
            </div>
            <div className={`${headerItemClass} ${headerItemClass}--right`}>
              <button className="c-btn"  onClick={ toggleHandler } >
                { iconSettings() }
              </button>
            </div>
          </header>
          { toggle && modalWindow() }
        </>
    )
};

export default Header;

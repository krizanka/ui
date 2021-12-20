import React, {useState, useEffect} from "react";
import PatternSelect from './PatternSelect';
import {iconList, iconShuffle, iconClose} from "./Svg";

function shuffle(array) {
    array = array.slice();
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function lettersToState(letters) {
    return letters.map((x) => ({l: x, used: false}));
}

const Guessbox = ({propsLetters, onGuess, renderHistory, elapsed, score}) => {
    const [letters, setLetters] = useState(lettersToState(propsLetters));
    const [value, setValue] = useState("");
		const [showScoreList, setShowScoreList] = useState(false);

    useEffect(()=>setLetters(lettersToState(propsLetters)), [propsLetters])

    function handleSubmit(val) {
        if (val.length < 3)
            return;
        onGuess(val);
        clear();
    }

    function handleShuffle() {
        setLetters(shuffle(letters));
    }
	
	function handleRenderList() {
		setShowScoreList(!showScoreList);
	}

    function handleClear() {
        clear();
    }

    function clear() {
        setLetters(letters.map(l => ({...l, used:false})));
        setValue("");
    }
		
		function renderScore() {
			return (
				<div className="c-dialog">
					<div className="c-dialog__container">
						<button
							onClick={ (e) => handleRenderList() }
							className="c-dialog__close"
						>
							{ iconClose() }
						</button>
						<h1>Točke</h1>
						<div className="o-grid o-grid__twoCol o-grid__twoCol--2_1">
							<div>Uganjene / Vse</div>
							<div className="u-text-right">{score.guess}/{score.words}</div>
							<div>Znane / Neuporabljene</div>
							<div className="u-text-right">{score.known}/{score.unused} </div>
							<div>Napacne besede</div>
							<div className="u-text-right">{score.miss}</div>
							<div>Ponovljene besede</div>
							<div className="u-text-right">{score.repeat} </div>
						</div>
						{ renderHistory() }
					</div>
				</div>
			)
		}

    return (
        <>
					<div className="c-word">
							{ value &&
									<div className="c-word__container">
											{Array.from(value).map((l,i) => (
													<span key={i}>{l}</span>
											))}
									</div>

							}
					</div>
					<div className="c-selection">
							<div className="c-selection__side c-selection__side--left">
								<button
									className="c-btn c-btn--round"
									onClick={ (e) => handleRenderList() }>
									{ iconList() }
								</button>
							</div>
							<div className="c-selection__side c-selection__side--right">
								<button
									className="c-btn c-btn--round"
									onClick={(e) => handleShuffle()}
									title="Shuffle">
									{ iconShuffle() }
								</button>
							</div>
              <React.Fragment key={JSON.stringify(letters)}>
                <PatternSelect
                  letters={letters}
                  onClear={handleClear}
                  setValue={setValue}
                  onSubmit={handleSubmit}
                />
              </React.Fragment>
					</div>
					{ showScoreList && renderScore() }
        </>
    );
};

export default Guessbox;

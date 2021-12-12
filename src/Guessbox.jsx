import React, {useState} from "react";
import PatternSelect from './PatternSelect';
import Actions from "./Actions";
import {iconList, iconShuffle} from "./Svg";

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

const Guessbox = ({propsLetters, onGuess, onReload, renderHistory, elapsed, score}) => {
    const [letters, setLetters] = useState(lettersToState(propsLetters));
    const [value, setValue] = useState("");
	const [renderList, setRenderList] = useState(false);

    React.useEffect(()=>setLetters(lettersToState(propsLetters)), [propsLetters])

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
		setRenderList(!renderList);
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
				<dialog>
					<div className="score">
						<span className="guess"> g {score.guess}/{score.words} </span>
						<span className="known"> k {score.known}/{score.unused} </span>
						<span className="miss"> m {score.miss} </span>
						<span className="repeat"> r {score.repeat} </span>
					</div>
				</dialog>
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
					<div class="c-selection">
						<React.Fragment key={JSON.stringify(letters)}>
							<button
								className="c-selection__btn c-selection__btn--left"
								onClick={ (e) => handleRenderList() }>
								{ iconList() }
							</button>
							<button
								className="c-selection__btn c-selection__btn--right"
								onClick={(e) => handleShuffle()}
								title="Shuffle">
								{ iconShuffle() }
							</button>
							<PatternSelect
								letters={letters}
								onClear={handleClear}
								setValue={setValue}
								onSubmit={handleSubmit}
							/>
						</React.Fragment>
					</div>

        
        </>
    );
};

export default Guessbox;

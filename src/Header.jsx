import React, { useState } from "react";
import { iconTime, iconSettings } from "./Svg";

const Header = ({elapsed, score, onReload}) => {
	const [toggle, setToggle] = useState(false);
	const toggleHandler = () => setToggle(!toggle);
	
	const modalWindow = <div>
		<button onClick={(e) => onReload()} title="Reload">
			Nova igra
		</button>
	</div>
	
	const headerClass = "c-header"
	const headerItemClass = `${headerClass}__item`
	
	return (
		<header className={ headerClass }>
			<div className={`${headerItemClass} ${headerItemClass}--left`}>
				{ iconTime() }
				{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2,'0')}
			</div>
			<div className={`${headerItemClass} ${headerItemClass}--center`}>
				{score.guess}/{score.words}
			</div>
			<div className={`${headerItemClass} ${headerItemClass}--right`}>
				<button className="c-btn"	onClick={ toggleHandler } >
					{ iconSettings() }
				</button>
			</div>
			{ toggle && modalWindow }
		</header>
	)
};

export default Header;

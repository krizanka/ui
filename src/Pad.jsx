import React from "react";

const Pad = ({pad, rows, cols, hintLimit, onHint, guesses, score}) => {
    function renderCell(x,y) {
				const className = "c-table__cell"
        let p = pad[[x,y]];
        let k = x;
        let l;
        let opt = {};
        if (p === undefined) {
            opt.className=`${className} ${className}--null`;
            l = " ";
        } else if (p.guess === null && (p.hint || 0) < hintLimit) {
            opt.className=`${className} ${className}--empty`;
            opt.onClick = e => onHint(x,y);
            l=" ";
        } else if (p.guess === null && (p.hint || 0) >= hintLimit) {
            opt.className=`${className}`;
            l=p.l;
        } else if (p.guess < guesses.length) {
            opt.className=`${className} ${className}--solved`;
            l=p.l;
        } else {
            opt.className=`${className} ${className}--solved ${className}--guessed`;
            l=p.l;
        }

        if (p && p.hint && p.hint >= hintLimit) {
            opt.className += ` ${className}--hint`;
        }

        return (
					<div {...opt} key={k}>
							<span>{l}</span>
					</div>
        );
    }

    function renderRow(y) {
        return (
            <div className="c-table__row" key={y}>
                {cols.map(x => renderCell(x,y))}
            </div>
        );
    }

    function renderPad() {
        return (
					<div className="c-table">
						{rows.map(y => renderRow(y))}
					</div>
        );
    }

    return (
			renderPad()
    );
};

export default Pad;

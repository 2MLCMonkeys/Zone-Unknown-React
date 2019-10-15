import React from 'react';
import logic from '../utils/logic';
import sav from '../utils/sav';
import glob from '../utils/glob';

class ModalChoice extends React.Component {

    handleClick = (index) => {

        if (sav.event.stat !== `Ship`) {

            // Local event object
            let e = {}
            e.key = sav.event.key;
            e.stat = sav.event.stat;
            e.icon = sav.event.icon;

            ////////// ITEM EVENT //////////
            if (sav.event.stat === `Health` && sav.itemCount >= 4) {
                let posChance = 0.75
                let outcomeChance = logic.rdmFloat(0, 1)
                if (outcomeChance <= posChance) {
                    e.text = sav.event.obj.choices[index].outcomes[0].text;
                    e.change = sav.event.obj.choices[index].outcomes[0].change;
                }
                else {
                    e.text = sav.event.obj.choices[index].outcomes[1].text;
                    e.change = sav.event.obj.choices[index].outcomes[1].change;
                }
            }
            else if (sav.event.stat === `Oxygen` && sav.itemCount >= 5) {
                let posChance = 0.75
                let outcomeChance = logic.rdmFloat(0, 1)
                if (outcomeChance <= posChance) {
                    e.text = sav.event.obj.choices[index].outcomes[0].text;
                    e.change = sav.event.obj.choices[index].outcomes[0].change;
                }
                else {
                    e.text = sav.event.obj.choices[index].outcomes[1].text;
                    e.change = sav.event.obj.choices[index].outcomes[1].change;
                }
            }
            else {
                let rdmOutcome = logic.rdmInt(0, sav.event.obj.choices[index].outcomes.length - 1)
                e.text = sav.event.obj.choices[index].outcomes[rdmOutcome].text;
                e.change = sav.event.obj.choices[index].outcomes[rdmOutcome].change;
            }
            ////////// ITEM EVENT //////////
            
            // Assign local event object to new global event object
            sav.event = e;

            this.props.showModalEvent();
        }
        else {
            if (index === 0) {
                if (sav.fuel >= glob.FUELrep) {

                    ////////// ITEM EVENT //////////
                    if (sav.itemCount >= 6) sav.oxygen += glob.O2gainI;
                    else sav.oxygen += glob.O2gain;
                    ////////// ITEM EVENT //////////

                    sav.fuel -= glob.FUELrep;
                    this.props.hideModals();
                }
                else {
                    sav.event = {
                        alert: `NoFuel`,
                        text: `You need at least ${glob.FUELrep} fuel to replenish your oxygen!`
                    };
                    this.props.showModalEvent();
                }
            }
            else if (index === 1) {
                if (sav.warpCount > sav.planet) {
                    if (sav.warpCount < 3) {
                        if (sav.health < glob.HPstart / 2) sav.health = glob.HPstart / 2;
                        if (sav.oxygen < glob.O2start) sav.oxygen = glob.O2start;
                        sav.planet++;
                        this.props.hideModals();
                    }
                    else if (sav.warpCount === 3) {
                        sav.event = {
                            alert: `NoUranium`,
                            text: `You still need to find uranium before you go home!`
                        };
                        this.props.showModalEvent();
                    }
                    else {
                        sav.event = {
                            alert: `Win`,
                            text: `You have survived! Have a safe journey home! You will now be returned to the home page.`
                        };
                        this.props.showModalEvent();
                    }
                }
                else {
                    sav.event = {
                        alert: `NoAdvance`,
                        text: `You need to find a warp piece before leaving the planet!`
                    };
                    this.props.showModalEvent();
                }
            }
            else if (index === 2) {
                this.props.hideModals();
            }
        }
    }

    render() {
        return (
            <div className="mChance" id="modalEventBox">
                <p className="lShade" id="modalEventText">{sav.event.obj.text}</p>
                {sav.event.obj.choices.map((item, index) => (
                    <div key={index} className="modalBtn" onClick={() => this.handleClick(index)}>
                        <p className="modalBtnText">{item.text}</p>
                    </div>
                ))
                }
            </div>
        )
    }
}

export default ModalChoice;
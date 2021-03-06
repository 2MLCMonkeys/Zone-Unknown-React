import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Game from './pages/Game';
import logic from './utils/logic';
import g from './utils/globals';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            signedIn: false,
            username: null,
            id: null,
            page: `home`
        };
        this.componentDidMount = this.componentDidMount.bind(this);
        this.changePage = this.changePage.bind(this);
        this.loadSession = this.loadSession.bind(this);
        this.loadGame = this.loadGame.bind(this);
        this.newGame = this.newGame.bind(this);
        this.saveGame = this.saveGame.bind(this);
        this.signOut = this.signOut.bind(this);
        this.signIn = this.signIn.bind(this);
        this.signUp = this.signUp.bind(this);
        this.genSav = this.genSav.bind(this);
    }

    componentDidMount() {
        logic.playTrack1();
        this.loadSession();
    }

    changePage = (str) => {
        this.setState({ page: str });
    }



    loadSession() {
        logic.sfx_tick();

        console.log(`-- LOAD SESSION ATTEMPT --`);
        axios.get(`api/users/`)
            .then(res => {
                if (res.data.user) {
                    console.log(`<< LOAD SESSION SUCCESS >>`);
                    console.log(res.data.user);
                    this.setState({ signedIn: true, username: res.data.user.username, id: res.data.user._id });
                }
                else {
                    console.log(`>> LOAD SESSION ERROR <<`);
                    console.log(`Session not found!`);
                    this.setState({ signedIn: false, username: null, id: null });
                }
            })
            .catch(error => {
                console.log(`>> LOAD SESSION ERROR <<`);
                console.log(error);
            });
    }



    loadGame = () => {
        logic.sfx_start();

        // Reset coords
        g.sav.coords = [0, 0];

        console.log(`-- LOAD GAME ATTEMPT --`);
        axios
            .get(`/api/users/${this.state.id}`)
            .then(res => {
                g.sav = JSON.parse(res.data.sav);
                console.log(`<< LOAD GAME SUCCESS >>`);
                console.log(g.sav);
                this.changePage(`game`);
            })
            .catch(error => {
                console.log('>> LOAD GAME ERROR <<');
                console.log(error);
            });
    }
    newGame = () => {
        logic.sfx_start();

        // Reset coords
        g.sav.coords = [0, 0];

        this.genSav();
        console.log(`-- NEW GAME ATTEMPT --`);
        axios
            .put(`/api/users/${this.state.id}`, {
                sav: JSON.stringify(g.sav)
            })
            .then(res => {
                console.log(`<< NEW GAME SUCCESS >>`);
                console.log(g.sav);
                this.changePage(`game`);
            })
            .catch(error => {
                console.log('>> NEW GAME ERROR <<');
                console.log(error);
            });
    }
    saveGame = () => {
        logic.sfx_start();

        // Reset coords
        g.sav.coords = [0, 0];

        console.log(`-- SAVE GAME ATTEMPT --`);
        axios
            .put(`/api/users/${this.state.id}`, {
                sav: JSON.stringify(g.sav)
            })
            .then(res => {
                console.log(`<< SAVE GAME SUCCESS >>`);
                console.log(g.sav);
            })
            .catch(error => {
                console.log('>> SAVE GAME ERROR <<');
                console.log(error);
            });
    }



    signOut = () => {
        logic.sfx_back();

        console.log(`-- SIGN OUT ATTEMPT --`);
        axios
            .post(`/api/users/logout`)
            .then(res => {
                if (res.status === 200) {
                    console.log(`<< SIGN OUT SUCCESS >>`);
                    this.setState({ signedIn: false, username: null, id: null });
                }
            })
            .catch(error => {
                console.log(`>> SIGN OUT ERROR <<`);
                console.log(error);
            });
    }
    signIn = (username, password) => {
        logic.sfx_continue();

        if (username && password) {
            console.log(`-- SIGN IN ATTEMPT --`);
            axios
                .post(`/api/users/login`, {
                    username: username,
                    password: password
                })
                .then(res => {
                    if (res.status === 200) {
                        console.log(`<< SIGN IN SUCCESS >>`);
                        this.setState({ signedIn: true, username: username, id: res.data.id });
                    }
                })
                .catch(error => {
                    console.log(`>> SIGN IN ERROR <<`);
                    console.log(error);
                    alert(`Please make sure your username & password are correct!`);
                });
        }
    }
    signUp = (username, password, confirm) => {
        logic.sfx_continue();

        if (username && password && confirm && password === confirm) {
            if (username.length >= 3 && username.length <= 25) {
                if (password.length >= 6 && password.length <= 25) {
                    this.genSav();
                    console.log(`-- SIGN UP ATTEMPT --`);
                    axios
                        .post(`/api/users/`, {
                            username: username,
                            password: password,
                            sav: JSON.stringify(g.sav)
                        })
                        .then(res => {
                            if (res.status === 200) {
                                console.log(`<< SIGN UP SUCCESS >>`);
                                this.signIn(username, password);
                            }
                        })
                        .catch(error => {
                            console.log(`>> SIGN UP ERROR <<`);
                            console.log(error);
                        });
                }
                else {
                    alert(`Please make sure your password is between 6 and 25 characters!`);
                }
            }
            else {
                alert(`Please make sure your username is between 3 and 25 characters!`);
            }
        }
        else {
            alert(`Please make sure all fields are filled and the password confirms!`);
        }
    }

    render() {
        return (
            <Router>
                <Route path="/" component={() => this.state.page === `home` ?
                    <Home fChangePage={this.changePage} fLoadGame={this.loadGame} fNewGame={this.newGame} fSignOut={this.signOut} fSignIn={this.signIn} fSignUp={this.signUp} signedIn={this.state.signedIn} username={this.state.username} /> :
                    <Game fChangePage={this.changePage} fLoadGame={this.loadGame} fSaveGame={this.saveGame} signedIn={this.state.signedIn} username={this.state.username} />} />
            </Router>
        );
    }

    genSav = () => {

        // Reset stats to default
        g.sav.health = g.glob.HPstart;
        g.sav.oxygen = g.glob.O2start;
        g.sav.fuel = g.glob.FUELstart;
        g.sav.warpCount = g.glob.WARPstart;
        g.sav.itemCount = g.glob.ITEMstart;
        g.sav.coords = [0, 0];
        g.sav.planet = g.glob.PLANETstart;

        // Looping through each planet to generate
        for (let inc = 0; inc < 3; inc++) {

            // Declaring variables we need to generate a planet
            let psHPCount, nsHPCount, psO2Count, nsO2Count;
            let dHPCount, dO2Count, fuelCount, warpCount, itemCount;
            let eventArray = [`psHP`, `nsHP`, `psO2`, `nsO2`];
            let numArray = [];

            // Setting default random & set event counts for each specific planet
            if (inc === 0) {
                psHPCount = 6;
                nsHPCount = 3;
                psO2Count = 6;
                nsO2Count = 3;
                dHPCount = 2;
                dO2Count = 2;
                fuelCount = 3;
                warpCount = 1;
                itemCount = 3;
            }
            else if (inc === 1) {
                psHPCount = 10;
                nsHPCount = 8;
                psO2Count = 10;
                nsO2Count = 8;
                dHPCount = 3;
                dO2Count = 3;
                fuelCount = 5;
                warpCount = 1;
                itemCount = 2;
            }
            else if (inc === 2) {
                psHPCount = 16;
                nsHPCount = 14;
                psO2Count = 16;
                nsO2Count = 14;
                dHPCount = 4;
                dO2Count = 4;
                fuelCount = 7;
                warpCount = 2;
                itemCount = 1;
            }
            else {
                console.log(`WTF! How did you get here?`);
            }

            // TESTING //
            // console.log(`\n`);
            // console.log(`PLANET ${inc + 1} ASSIGNED EVENTS:`);
            // console.log(`\n`);
            // TESTING //

            // Loop to edit every hex
            for (let i = 0; i < g.sav.planets[inc].hexes.length; i++) {

                // Reset hex to default
                g.sav.planets[inc].hexes[i].visited = `false`;
                g.sav.planets[inc].hexes[i].reach = `false`;
                g.sav.planets[inc].hexes[i].current = `false`;
                g.sav.planets[inc].hexes[i].event = ``;
                g.sav.planets[inc].hexes[i].class = `hex`;

                // Generate a random event for each hex
                if (i !== (g.sav.planets[inc].hexes.length - 1) / 2) {
                    let rdmEvent = eventArray[Math.floor(Math.random() * eventArray.length)];

                    if (rdmEvent === `psHP` && psHPCount > 0) {
                        g.sav.planets[inc].hexes[i].event = rdmEvent;
                        psHPCount--;
                        // console.log(`RANDOM EVENT ADDED "${rdmEvent}" to HEX${i}`);
                    }
                    else if (rdmEvent === `nsHP` && nsHPCount > 0) {
                        g.sav.planets[inc].hexes[i].event = rdmEvent;
                        nsHPCount--;
                        // console.log(`RANDOM EVENT ADDED "${rdmEvent}" to HEX${i}`);
                    }
                    else if (rdmEvent === `psO2` && psO2Count > 0) {
                        g.sav.planets[inc].hexes[i].event = rdmEvent;
                        psO2Count--;
                        // console.log(`RANDOM EVENT ADDED "${rdmEvent}" to HEX${i}`);
                    }
                    else if (rdmEvent === `nsO2` && nsO2Count > 0) {
                        g.sav.planets[inc].hexes[i].event = rdmEvent;
                        nsO2Count--;
                        // console.log(`RANDOM EVENT ADDED "${rdmEvent}" to HEX${i}`);
                    }
                    else {
                        i--;
                    }
                }
                else {
                    g.sav.planets[inc].hexes[i].event = `ship`;
                    // console.log(`SET EVENT ADDED "ship" to HEX${i}`);
                }
            }

            // Loop to generate random placements for the set events
            for (let e = 0; e < (dHPCount + dO2Count + fuelCount + warpCount + itemCount); e++) {
                let num = logic.rdmInt(0, g.sav.planets[inc].hexes.length - 1);

                if (inc === 0) {
                    if (num !== 4 && num !== 5 && num !== 8 && num !== 9 && num !== 10 && num !== 13 && num !== 14 && !numArray.includes(num)) {
                        numArray.push(num);
                    }
                    else {
                        e--;
                    }
                }
                else if (inc === 1) {
                    if (num !== 11 && num !== 12 && num !== 17 && num !== 18 && num !== 19 && num !== 24 && num !== 25 && !numArray.includes(num)) {
                        numArray.push(num);
                    }
                    else {
                        e--;
                    }
                }
                else if (inc === 2) {
                    if (num !== 21 && num !== 22 && num !== 29 && num !== 30 && num !== 31 && num !== 38 && num !== 39 && !numArray.includes(num)) {
                        numArray.push(num);
                    }
                    else {
                        e--;
                    }
                }
                else {
                    console.log(`WTF! How did you get here?`);
                }
            }

            // TESTING //
            // console.log(`\n`);
            // console.log(`PLANET ${inc + 1} OVERRIDE EVENTS:`);
            // console.log(`\n`);
            // TESTING //

            // Loop to assign set events using the random number array
            for (let f = 0; f < numArray.length; f++) {
                if (dHPCount > 0) {
                    g.sav.planets[inc].hexes[numArray[f]].event = `dHP`;
                    dHPCount--;
                    // console.log(`RANDOM EVENT ADDED "dHP" to HEX${numArray[f]}`);
                }
                else if (dO2Count > 0) {
                    g.sav.planets[inc].hexes[numArray[f]].event = `dO2`;
                    dO2Count--;
                    // console.log(`RANDOM EVENT ADDED "dO2" to HEX${numArray[f]}`);
                }
                else if (fuelCount > 0) {
                    g.sav.planets[inc].hexes[numArray[f]].event = `fuel`;
                    fuelCount--;
                    // console.log(`SET EVENT ADDED "fuel" to HEX${numArray[f]}`);
                }
                else if (warpCount > 0) {
                    g.sav.planets[inc].hexes[numArray[f]].event = `warp`;
                    warpCount--;
                    // console.log(`SET EVENT ADDED "warp" to HEX${numArray[f]}`);
                }
                else if (itemCount > 0) {
                    g.sav.planets[inc].hexes[numArray[f]].event = `item`;
                    itemCount--;
                    // console.log(`SET EVENT ADDED "item" to HEX${numArray[f]}`);
                }
            }

            // TESTING //
            // console.log(`\n`);
            // console.log(`------------------------------`);
            // TESTING //
        }

        // TESTING //
        // console.log(`\n`);
        // console.log(`--GEN SAVE--`);
        // console.log(g.sav);
        // console.log(`\n`);
        // TESTING //
    }
}

export default App;
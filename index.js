import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import aStar from './aStar';

//Square component returns an individual square
class Square extends React.Component {
	render() {
		return (
			<div
				className={
					'square ' +
					(this.props.isWall ? ' wall ' : null) +
					(this.props.isStart ? ' start ' : null) +
					(this.props.isEnd ? ' end ' : null) +
					this.props.isPath +
					this.props.isRoute
				}
				onMouseDown={() => this.props.onMouseDown()}
				onMouseUp={() => this.props.onMouseUp()}
				onMouseEnter={() => this.props.onMouseEnter()}
			></div>
		);
	}
}

//Board component creates a 2d array of Square components
//to form the board. also returns the 'help' panel
//that slides into view when the help button is pressed
class Board extends React.Component {
	renderSquare(i, j) {
		return (
			<Square
				key={[i, j]}
				isEnd={this.props.isEnd(i, j)}
				isWall={this.props.isWall(i, j)}
				isStart={this.props.isStart(i, j)}
				onMouseDown={() => this.props.onMouseDown(i, j)}
				onMouseUp={() => this.props.onMouseUp()}
				onMouseEnter={() => this.props.onMouseEnter(i, j)}
				isPath={this.props.isPath(i, j)}
				isRoute={this.props.isRoute(i, j)}
			/>
		);
	}

	render() {
		return (
			<div className='boardContainer'>
				<div className='board'>
					{[...Array(30)].map((_, i) => (
						<div key={i} className='row'>
							{[...Array(50)].map((_, j) => this.renderSquare(i, j))}
						</div>
					))}
				</div>
				<div className='help'>
					<h2>How to Use</h2>
					<ol>
						<li>
							click the 'start select' button; the next time you click on a
							square it will be set as the starting square.
						</li>
						<li>
							click the 'end select' button; the next time you click on a square
							it will be set as the ending square.
						</li>
						<li>
							To create walls, left click on a square and, while still holding
							the left mouse button down, drag the cursor over the squares you
							would like to make walls. You can remove walls in a similar
							manner.
						</li>
						<li>
							Once you have chosen the starting point, ending point, and wall
							layout, choose an algorithm from the drop down menu. Click the
							'start' button and the pathfinding algorithm will begin. You can
							observe how the algorithm searches through the squares to find a
							path to the end. Once it reaches the ending point, it will trace
							out a path back to the beginning (unless no path exist, in which
							case a message will pop up telling you so).
						</li>
						<li>
							To set up another case, click the 'reset' button to clear the
							board; repeat the previous steps to run the algorithm again.
						</li>
					</ol>
				</div>
			</div>
		);
	}
}

//Main parent component that returns a Board component,
//the buttons, and defines methods which handle the calling
//of the pathfinding algorithm, the buttons, whether a sqaure is
//a wall/start/end square
class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			walls: Array(30) //2d boolean array keeping track of
				.fill(null) //which squares are walls
				.map(() => Array(50).fill(false)),
			start: [0, 0], //start point
			end: [29, 49], //end point
			path: [], //contains nodes visited and their neighbors
			route: [], //contains final path from end->start
			mouseDown: false, //if mouseDown is true, create walls
			startSelect: false, //if startSelect is true, next square clicked is start
			endSelect: false, //if endSelect is true, next square clicked is end
			algo: 'A*', //which algorithm chosen in select drop down
		};
	}

	//determines if node is starting point
	isStart = (i, j) => {
		if (i === this.state.start[0] && j === this.state.start[1]) {
			return true;
		}
		return false;
	};

	//determines if node is ending point
	isEnd = (i, j) => {
		if (i === this.state.end[0] && j === this.state.end[1]) {
			return true;
		}
		return false;
	};

	//determines if node is currently a wall
	isWall = (i, j) => {
		return this.state.walls[i][j];
	};

	//handles wall creation/start selection/end selection
	handleMouseDown = (i, j) => {
		//if startSelect=true, set start point to clicked square
		//else-if endSelect=true, set end point to clicked square
		//else if mouseDown=true, toggle squares wall status
		if (this.state.startSelect) {
			this.setState({ start: [i, j] });
			this.setState({ startSelect: false });
		} else if (this.state.endSelect) {
			this.setState({ end: [i, j] });
			this.setState({ endSelect: false });
		} else {
			if (i === this.state.start[0] && j === this.state.start[1]) {
				return;
			}
			if (i === this.state.end[0] && j === this.state.end[1]) {
				return;
			}
			this.setState({ mouseDown: true });
			let walls = this.state.walls.slice();
			let wall = !walls[i][j];
			walls[i][j] = wall;
			this.setState({ walls: walls });
		}
	};

	//set mouseDown to false so no walls or start/end points are changed
	handleMouseUp = () => {
		this.setState({ mouseDown: false });
	};

	//if cursor passes over square while mouseDown=true, toggle wall status
	handleMouseEnter = (i, j) => {
		if (this.state.mouseDown) {
			if (i === this.state.start[0] && j === this.state.start[1]) {
				return;
			}
			if (i === this.state.end[0] && j === this.state.end[1]) {
				return;
			}
			let walls = this.state.walls.slice();
			let wall = !walls[i][j];
			walls[i][j] = wall;
			this.setState({ walls: walls });
		}
	};

	//calls pathfinding algorithm
	findPath = () => {
		//create new Astar class and intialize with walls/start/end setup
		//and algorithm to be run
		//let path = this.state.path.slice();
		let path = aStar(
			this.state.start,
			this.state.end,
			this.state.walls,
			this.state.algo
		);

		if (!path) {
			alert("the end can't be reached, please reset board and try again");
			return;
		}

		let it = 0; //iterator variable
		let interval = setInterval(() => {
			if (it < path.history.length) {
				this.setState({
					path: path.history[it],
				});
				it++;
			} else {
				clearInterval(interval);
				this.createRoute(path.nodes);
			}
		});
	};

	//start at end point and follow parent location of current square
	//until we reach the start point (pushing current square location
	//into the route state variable)
	//
	//once we reach start square, clear interval
	createRoute = (nodes) => {
		let current = nodes[this.state.end[0]][this.state.end[1]];

		let interval = setInterval(() => {
			if (
				current.x === this.state.start[1] &&
				current.y === this.state.start[0]
			) {
				clearInterval(interval);
			} else {
				this.setState((prevState) => ({
					route: [...prevState.route, { x: current.x, y: current.y }],
				}));

				current = nodes[current.parent.y][current.parent.x];
			}
		});
	};

	//as the path state variable is updated with the history array,
	//change squares to reflect whether they are visited or neighbor squares
	isPath = (i, j) => {
		if (this.state.path[0] === undefined || this.state.path === undefined) {
			return;
		}

		if (i === this.state.path[0].y && j === this.state.path[0].x) {
			return ' current ';
		}

		for (let k = 1; k < this.state.path.length; k++) {
			if (i === this.state.path[k].y && j === this.state.path[k].x) {
				return ' neighbor ';
			}
		}

		return null;
	};

	//as the current square from createRoute method is pushed into
	//the route state variable, update squares to reflect if they are
	//part of the path from end->start
	isRoute = (i, j) => {
		for (let k = 0; k < this.state.route.length; k++) {
			if (i === this.state.route[k].y && j === this.state.route[k].x) {
				return ' route ';
			}
		}
		return null;
	};

	//when reset button is clicked, clear the walls, the path, and the route
	//state variables to reset the board for another run
	resetBoard = () => {
		this.setState({
			walls: Array(30)
				.fill(null)
				.map(() => Array(50).fill(false)),
			path: [],
			route: [],
		});
	};

	//when the start select button is clicked, set startSelect state variable to
	//true so a new start point can be selected
	startSelect = () => {
		this.setState({ startSelect: true });
	};

	//when the end select button is clicked, set endSelect state variable to
	//true so a new end point can be selected
	endSelect = () => {
		this.setState({ endSelect: true });
	};

	//when the option in the select drop down is changed, change the algo
	//state variable to reflect that
	handleChange = (event) => {
		this.setState({ algo: event.target.value });
	};

	//when the help button is clicked, toggle the help window
	helpWindow = () => {
		let helpWindow = document.querySelector('.help');

		if (!helpWindow.offsetLeft) {
			helpWindow.style.left = '100%';
		} else {
			helpWindow.style.left = '0%';
		}
	};

	render() {
		return (
			<div>
				<h1 className='Title'>Pathfinding Visualizer</h1>
				<Board
					isEnd={(i, j) => this.isEnd(i, j)}
					isStart={(i, j) => this.isStart(i, j)}
					isWall={(i, j) => this.isWall(i, j)}
					onMouseDown={(i, j) => this.handleMouseDown(i, j)}
					onMouseUp={(i, j) => this.handleMouseUp()}
					onMouseEnter={(i, j) => this.handleMouseEnter(i, j)}
					isPath={(i, j) => this.isPath(i, j)}
					isRoute={(i, j) => this.isRoute(i, j)}
				></Board>

				<div className='btnContainer'>
					<button className='startBtn' onClick={() => this.findPath()}>
						start
					</button>
					<button className='resetBtn' onClick={() => this.resetBoard()}>
						reset
					</button>
					<button className='startSelectBtn' onClick={() => this.startSelect()}>
						start select
					</button>
					<button className='endSelectBtn' onClick={() => this.endSelect()}>
						end select
					</button>

					<label> Algorithm: </label>
					<select
						name='algorithm'
						value={this.state.algo}
						onChange={this.handleChange}
					>
						<option value='A*'>A*</option>
						<option value='Dijkstra'>Dijkstra</option>
					</select>
					<button className='helpBtn' onClick={() => this.helpWindow()}>
						help
					</button>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(<App />, document.getElementById('root'));

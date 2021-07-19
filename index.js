import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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
			//start and end points cant be walls
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
			//start and end points cant be walls
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
		let aStarTest = new aStar(
			this.state.start,
			this.state.end,
			this.state.walls,
			this.state.algo
		);

		//results of pathfinding algo returned to path variable
		//
		//if path from end to start exist, returns object containing two arrays:
		//---1) history array of arrays which contains all the visited nodes (and
		//      their	neighbors) from each step of the algorithm
		//---2) squares 2d array which contains objects which indicate the parent
		//			node of each node (we use this to trace from the end point to the
		//			start point)
		//
		//if no path from end to start exist, returns false. send alert that no
		//path exist and end method
		let path = aStarTest.aStar();
		if (!path) {
			alert('no path exist!!!');
			return;
		}

		//if path exist, iterate through history array and set path state
		//variable to history[it] so user can observe how the algorithm
		//visits squares to determine the best path
		//
		//when we have cycled through the whole history array, we have reached the
		//end point. Clear the interval and pass the squares array to
		//the createRoute method, which will trace path from end to start
		let it = 0; //iterator variable
		let interval = setInterval(() => {
			if (it < path.history.length) {
				this.setState({ path: path.history[it] });
				it++;
			} else {
				clearInterval(interval);
				this.createRoute(path.squares);
			}
		});
	};

	//as the path state variable is updated with the history array,
	//change squares to reflect whether they are visited or neighbor squares
	isPath = (i, j) => {
		if (this.state.path[0] === undefined || this.state.path === undefined) {
			return;
		}

		if (
			i === this.state.path[0].location.y &&
			j === this.state.path[0].location.x
		) {
			return ' current ';
		}

		for (let k = 1; k < this.state.path.length; k++) {
			if (
				i === this.state.path[k].location.y &&
				j === this.state.path[k].location.x
			) {
				return ' neighbor ';
			}
		}

		return null;
	};

	//start at end point and follow parent location of current square
	//until we reach the start point (pushing current square location
	//into the route state variable)
	//
	//once we reach start square, clear interval
	createRoute = (squares) => {
		let current = squares[this.state.end[0]][this.state.end[1]];

		let interval = setInterval(() => {
			if (
				current.location.x === this.state.start[1] &&
				current.location.y === this.state.start[0]
			) {
				clearInterval(interval);
			} else {
				this.setState((prevState) => ({
					route: [
						...prevState.route,
						{ x: current.location.x, y: current.location.y },
					],
				}));

				current = squares[current.parent.y][current.parent.x];
			}
		});
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

//binary heap class used in the A* algorithm
class binaryHeap {
	constructor() {
		this.binaryHeap = []; //binary heap repesented as 1d array
	}

	//return length of binary heap
	size() {
		return this.binaryHeap.length;
	}

	//returns true if node is contained in binaryheap
	contains(node) {
		let x = node.location.x;
		let y = node.location.y;

		for (let i = 0; i < this.binaryHeap.length; i++) {
			if (
				x !== this.binaryHeap[i].location.x ||
				y !== this.binaryHeap[i].location.y
			) {
				continue;
			}
			return true;
		}
		return false;
	}

	//returns true if first node in binary heap is
	//the end point (algorithm has found path from start->end)
	//
	//returns false if first node in heap isnt
	//end point (continue searching for path)
	//
	//returns undefined if binary heap is empty (no path from start->end exist)
	isEnd(end) {
		if (this.size() === 0) return undefined;

		let x = this.binaryHeap[0].location.x;
		let y = this.binaryHeap[0].location.y;

		if (x === end.x && y === end.y) return true;
		else return false;
	}

	//insert node into end of heap, then return if heap only
	//contains that node, else filter the node up to the correct spot
	//in the heap
	insertNode(node) {
		this.binaryHeap.push(node);

		if (this.binaryHeap.length === 1) {
			return this.binaryHeap;
		} else {
			this.filterUp(this.binaryHeap.length - 1);
		}
	}

	//remove node from heap
	removeNode(node) {
		let x = node.location.x;
		let y = node.location.y;
		let index;

		//find index of node in binary minheap
		for (let i = 0; i < this.binaryHeap.length; i++) {
			if (
				x === this.binaryHeap[i].location.x &&
				y === this.binaryHeap[i].location.y
			) {
				index = i;
			}
		}

		//replace node to be removed with last node in minheap
		if (index < this.binaryHeap.length - 1) {
			this.binaryHeap[index] = this.binaryHeap[this.binaryHeap.length - 1];
			this.binaryHeap.splice(this.binaryHeap.length - 1);
		}

		let parent = Math.floor((index - 1) / 2);

		//if node to be removed is root, or parent has lower f value filter down
		//else, filter up
		if (index === 0 || this.binaryHeap[parent].f < node.f) {
			this.filterDown(index);
		} else {
			this.filterUp(index);
		}
	}

	//filter node at position i down the heap
	filterDown(i) {
		let current = i;

		//while current node has atlest one child node
		while (2 * current + 1 <= this.binaryHeap.length - 1) {
			let left = 2 * current + 1;
			let right = 2 * current + 2;

			let fCurrent = this.binaryHeap[current].f;
			let fLeft = this.binaryHeap[left].f;

			//if current node has two child nodes
			if (right <= this.binaryHeap.length - 1) {
				let fRight = this.binaryHeap[right].f;

				//if current has lowest f value, then node in correct position, break
				//the loop
				if (fCurrent < fLeft && fCurrent < fRight) {
					break;
				} else {
					//else, swap current node with smallest of its children
					if (fLeft < fRight) {
						[this.binaryHeap[current], this.binaryHeap[left]] = [
							this.binaryHeap[left],
							this.binaryHeap[current],
						];

						current = left;
					} else {
						[this.binaryHeap[current], this.binaryHeap[right]] = [
							this.binaryHeap[right],
							this.binaryHeap[current],
						];

						current = right;
					}
				}
			} else {
				//else current node only has one child node

				//if current node f value is lower than child then node in correct
				//position, break loop
				if (fCurrent < fLeft) {
					break;
				} else {
					//else, swap current node with left child
					[this.binaryHeap[current], this.binaryHeap[left]] = [
						this.binaryHeap[left],
						this.binaryHeap[current],
					];

					current = left;
				}
			}
		}
	}

	//filter node at position i up the heap
	filterUp(i) {
		let current = i;

		//while current position isnt root of heap
		while (current) {
			let parent = Math.floor((current - 1) / 2);
			let fCurrent = this.binaryHeap[current].f;
			let fParent = this.binaryHeap[parent].f;

			//if current node < parent node, swap nodes
			if (fCurrent < fParent) {
				[this.binaryHeap[current], this.binaryHeap[parent]] = [
					this.binaryHeap[parent],
					this.binaryHeap[current],
				];

				current = parent;
			} else {
				//else node in correct position, so break loop
				break;
			}
		}
	}
}

//A* & Dijkstra algorithm class (by setting the A* heuristic to zero
//we effectively end up with Dijkstra algorithm)
class aStar {
	//after the start button is clicked, the start position, end position,
	//and walls are sent to the A* constructor before the algorithm is run
	constructor(start, end, walls, algo) {
		this.start = {
			x: start[1],
			y: start[0],
		};
		this.end = {
			x: end[1],
			y: end[0],
		};
		this.walls = walls;
		this.algo = algo;

		//squares is a 2d array where each square is represented by
		//an object containing useful info for each square
		this.squares = Array(30)
			.fill(null)
			.map(() => Array(50).fill(null));

		//each square contains the location, the g value (distance from
		//start to square, initialized as Infinity), the f value (g + heuristic
		//initialized as Infinity), parent location, and whether square is a wall
		for (let k = 0; k < this.squares.length; k++) {
			for (let l = 0; l < this.squares[k].length; l++) {
				this.squares[k][l] = {
					location: {
						x: l,
						y: k,
					},
					g: Infinity,
					f: Infinity,
					parent: null,
					isWall: this.walls[k][l],
				};
			}
		}

		//initialize start square g and f value
		this.squares[this.start.y][this.start.x].g = 0;
		this.squares[this.start.y][this.start.x].f = this.heuristic(
			this.start.y,
			this.start.x
		);
	}

	//heuristic used by A* algorithm to determine which squares to visit
	//next, heuristic is zero if Dijkstra algorithm is chosen
	heuristic(i, j) {
		let dy = Math.abs(i - this.end.y);
		let dx = Math.abs(j - this.end.x);

		//heuristic is diagonal distance if A*, else zero for Dijkstra
		if (this.algo === 'A*') {
			return dy + dx + (Math.sqrt(2) - 2) * Math.min(dx, dy);
		} else if (this.algo === 'Dijkstra') {
			return 0;
		}
	}

	//movement cost from current to neighbor, 1 for up/down & left/right
	//or sqrt(2) for diagonal movement
	movementCost(current, neighbor) {
		return Math.sqrt(
			Math.pow(current.location.x - neighbor.location.x, 2) +
				Math.pow(current.location.y - neighbor.location.y, 2)
		);
	}

	//actual A*/Dijkstra algorithm
	aStar() {
		//create new open set and insert starting square
		let openSet = new binaryHeap();
		openSet.insertNode(this.squares[this.start.y][this.start.x]);

		//create new closed set
		let closedSet = new binaryHeap();

		//initialize history array to contain squares visited by
		//algo while searching for end point
		let history = [];

		//while first element in heap isnt the end
		while (!openSet.isEnd(this.end)) {
			//set first square in heap as current, remove from openSet and add to
			//closedSet
			let current = openSet.binaryHeap[0];
			openSet.removeNode(current);
			closedSet.insertNode(current);

			//item is temp array which we will push current node
			//and its neighbors into before pushing entire array into
			//the history array
			let item = [];
			item.push(current);

			//double for-loop cycles through the neighbors of current
			for (let i = -1; i < 2; i++) {
				//prevent trying to access neighbor that doesnt exist
				if (
					current.location.y + i < 0 ||
					current.location.y + i > this.squares.length - 1
				) {
					continue;
				}

				for (let j = -1; j < 2; j++) {
					//prevent trying to access neighbor that doesnt exist
					if (
						current.location.x + j < 0 ||
						current.location.x + j >
							this.squares[current.location.y + i].length - 1
					) {
						continue;
					}
					//skip case where i=j=0 (i.e. case where neighbor=current)
					if (i === 0 && j === 0) continue;

					let neighbor =
						this.squares[current.location.y + i][current.location.x + j];

					//if the neighbor is a wall, skip
					if (neighbor.isWall === true) continue;

					//calculate cost to move from current to this neighbor
					let cost = current.g + this.movementCost(current, neighbor);

					//if neighbor is is open set and cost is less than current
					//value, remove from open set. this path to neighbor
					//is better than previous one
					if (openSet.contains(neighbor) && cost < neighbor.g) {
						openSet.removeNode(neighbor);
					}

					//if neighbor in closed set and cost is less, remove from
					//closed set
					if (closedSet.contains(neighbor) && cost < neighbor.g) {
						closedSet.removeNode(neighbor);
					}

					//if neighbor isnt in either open or closed sets, set
					//g value of neighbor to cost, calculate neighbor f value,
					// update neighbor parent to current, and add to open set
					if (
						openSet.contains(neighbor) === false &&
						closedSet.contains(neighbor) === false
					) {
						neighbor.g = cost;
						neighbor.f =
							neighbor.g +
							this.heuristic(neighbor.location.y, neighbor.location.x);
						neighbor.parent = {
							x: current.location.x,
							y: current.location.y,
						};
						openSet.insertNode(neighbor);
					}

					//push neighbor into item
					item.push(neighbor);
				}
			}

			//push item into history
			history.push(item);

			//if the open set becomes empty and we havent reached
			//the end point, then no path from start->end exist so
			//return false
			if (openSet.isEnd(this.end) === undefined) return false;
		}

		//push end square into history since while loop stops once we reach the end
		let end = [this.squares[this.end.y][this.end.x]];
		history.push(end);

		return { history: history, squares: this.squares };
	}
}

// ========================================

ReactDOM.render(<App />, document.getElementById('root'));

var astar;
(function (astar) {
    (function (GraphNodeType) {
        GraphNodeType[GraphNodeType["WALL"] = 0] = "WALL";
        GraphNodeType[GraphNodeType["OPEN"] = 1] = "OPEN";
    })(astar.GraphNodeType || (astar.GraphNodeType = {}));
    var GraphNodeType = astar.GraphNodeType;

    var Graph = (function () {
        function Graph(grid) {
            this.elements = grid;
            var nodes = [];
            var row, rowLength, len = grid.length;
            for (var x = 0; x < len; ++x) {
                row = grid[x];
                rowLength = row.length;
                nodes[x] = new Array(rowLength);
                for (var y = 0; y < rowLength; ++y) {
                    nodes[x][y] = new GraphNode(x, y, row[y]);
                }
            }
            this.nodes = nodes;
        }
        Graph.prototype.toString = function () {
            var graphString = "\n";
            var nodes = this.nodes;
            var rowDebug, row, y, l;
            for (var x = 0, len = nodes.length; x < len;) {
                rowDebug = "";
                row = nodes[x++];
                for (y = 0, l = row.length; y < l;) {
                    rowDebug += row[y++].type + " ";
                }
                graphString = graphString + rowDebug + "\n";
            }
            return graphString;
        };
        return Graph;
    })();
    astar.Graph = Graph;

    var GraphNode = (function () {
        function GraphNode(x, y, type) {
            this.data = {};
            this.x = x;
            this.y = y;
            this.pos = { x: x, y: y };
            this.type = type;
        }
        GraphNode.prototype.toString = function () {
            return "[" + this.x + " " + this.y + "]";
        };

        GraphNode.prototype.isWall = function () {
            return this.type == GraphNodeType.WALL;
        };
        return GraphNode;
    })();
    astar.GraphNode = GraphNode;

    var BinaryHeap = (function () {
        function BinaryHeap(scoreFunction) {
            this.content = [];
            this.scoreFunction = scoreFunction;
        }
        BinaryHeap.prototype.push = function (node) {
            this.content.push(node);

            this.sinkDown(this.content.length - 1);
        };

        BinaryHeap.prototype.pop = function () {
            var result = this.content[0];

            var end = this.content.pop();

            if (this.content.length > 0) {
                this.content[0] = end;
                this.bubbleUp(0);
            }
            return result;
        };

        BinaryHeap.prototype.remove = function (node) {
            var i = this.content.indexOf(node);

            var end = this.content.pop();
            if (i !== this.content.length - 1) {
                this.content[i] = end;
                if (this.scoreFunction(end) < this.scoreFunction(node))
                    this.sinkDown(i);
else
                    this.bubbleUp(i);
            }
        };

        BinaryHeap.prototype.size = function () {
            return this.content.length;
        };

        BinaryHeap.prototype.rescoreElement = function (node) {
            this.sinkDown(this.content.indexOf(node));
        };

        BinaryHeap.prototype.sinkDown = function (n) {
            var element = this.content[n];

            while (n > 0) {
                var parentN = ((n + 1) >> 1) - 1, parent = this.content[parentN];

                if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                    this.content[parentN] = element;
                    this.content[n] = parent;

                    n = parentN;
                } else {
                    break;
                }
            }
        };

        BinaryHeap.prototype.bubbleUp = function (n) {
            var length = this.content.length, element = this.content[n], elemScore = this.scoreFunction(element);

            while (true) {
                var child2N = (n + 1) << 1, child1N = child2N - 1;

                var swap = null;

                if (child1N < length) {
                    var child1 = this.content[child1N], child1Score = this.scoreFunction(child1);

                    if (child1Score < elemScore)
                        swap = child1N;
                }

                if (child2N < length) {
                    var child2 = this.content[child2N], child2Score = this.scoreFunction(child2);
                    if (child2Score < (swap === null ? elemScore : child1Score))
                        swap = child2N;
                }

                if (swap !== null) {
                    this.content[n] = this.content[swap];
                    this.content[swap] = element;
                    n = swap;
                } else {
                    break;
                }
            }
        };
        return BinaryHeap;
    })();
    astar.BinaryHeap = BinaryHeap;

    var AStar = (function () {
        function AStar(grid, disablePoints, enableCost) {
            this.grid = [];
            for (var x = 0, xl = grid.length; x < xl; x++) {
                this.grid[x] = [];
                for (var y = 0, yl = grid[x].length; y < yl; y++) {
                    var cost = (typeof grid[x][y] == "number") ? grid[x][y] : grid[x][y].type;
                    if (cost > 1 && !enableCost)
                        cost = 1;
                    this.grid[x][y] = {
                        org: grid[x][y],
                        f: 0,
                        g: 0,
                        h: 0,
                        cost: cost,
                        visited: false,
                        closed: false,
                        pos: {
                            x: x,
                            y: y
                        },
                        parent: null
                    };
                }
            }
            if (disablePoints !== undefined) {
                for (var i = 0; i < disablePoints.length; i++)
                    this.grid[disablePoints[i].x][disablePoints[i].y].cost = 0;
            }
        }
        AStar.prototype.heap = function () {
            return new BinaryHeap(function (node) {
                return node.f;
            });
        };

        AStar.prototype._find = function (org) {
            for (var x = 0; x < this.grid.length; x++)
                for (var y = 0; y < this.grid[x].length; y++)
                    if (this.grid[x][y].org == org)
                        return this.grid[x][y];
        };

        AStar.prototype._search = function (start, end, diagonal, heuristic) {
            heuristic = heuristic || this.manhattan;
            diagonal = !!diagonal;

            var openHeap = this.heap();

            var _start, _end;
            if (start.x !== undefined && start.y !== undefined)
                _start = this.grid[start.x][start.y];
else
                _start = this._find(start);

            if (end.x !== undefined && end.y !== undefined)
                _end = this.grid[end.x][end.y];
else
                _end = this._find(end);

            if (AStar.NO_CHECK_START_POINT == false && _start.cost <= 0)
                return [];

            openHeap.push(_start);

            while (openHeap.size() > 0) {
                var currentNode = openHeap.pop();

                if (currentNode === _end) {
                    var curr = currentNode;
                    var ret = [];
                    while (curr.parent) {
                        ret.push(curr);
                        curr = curr.parent;
                    }
                    return ret.reverse();
                }

                currentNode.closed = true;

                var neighbors = this.neighbors(currentNode, diagonal);

                for (var i = 0, il = neighbors.length; i < il; i++) {
                    var neighbor = neighbors[i];

                    if (neighbor.closed || neighbor.cost <= 0) {
                        continue;
                    }

                    var gScore = currentNode.g + neighbor.cost;
                    var beenVisited = neighbor.visited;

                    if (!beenVisited || gScore < neighbor.g) {
                        neighbor.visited = true;
                        neighbor.parent = currentNode;
                        neighbor.h = neighbor.h || heuristic(neighbor.pos, _end.pos);
                        neighbor.g = gScore;
                        neighbor.f = neighbor.g + neighbor.h;

                        if (!beenVisited) {
                            openHeap.push(neighbor);
                        } else {
                            openHeap.rescoreElement(neighbor);
                        }
                    }
                }
            }

            return [];
        };

        AStar.search = function (grid, start, end, disablePoints, diagonal, heuristic) {
            var astar = new AStar(grid, disablePoints);
            return astar._search(start, end, diagonal, heuristic);
        };

        AStar.prototype.manhattan = function (pos0, pos1) {
            var d1 = Math.abs(pos1.x - pos0.x);
            var d2 = Math.abs(pos1.y - pos0.y);
            return d1 + d2;
        };

        AStar.prototype.neighbors = function (node, diagonals) {
            var grid = this.grid;
            var ret = [];
            var x = node.pos.x;
            var y = node.pos.y;

            if (grid[x - 1] && grid[x - 1][y]) {
                ret.push(grid[x - 1][y]);
            }

            if (grid[x + 1] && grid[x + 1][y]) {
                ret.push(grid[x + 1][y]);
            }

            if (grid[x] && grid[x][y - 1]) {
                ret.push(grid[x][y - 1]);
            }

            if (grid[x] && grid[x][y + 1]) {
                ret.push(grid[x][y + 1]);
            }

            if (diagonals) {
                if (grid[x - 1] && grid[x - 1][y - 1]) {
                    ret.push(grid[x - 1][y - 1]);
                }

                if (grid[x + 1] && grid[x + 1][y - 1]) {
                    ret.push(grid[x + 1][y - 1]);
                }

                if (grid[x - 1] && grid[x - 1][y + 1]) {
                    ret.push(grid[x - 1][y + 1]);
                }

                if (grid[x + 1] && grid[x + 1][y + 1]) {
                    ret.push(grid[x + 1][y + 1]);
                }
            }

            return ret;
        };
        AStar.NO_CHECK_START_POINT = false;
        return AStar;
    })();
    astar.AStar = AStar;
})(astar || (astar = {}));

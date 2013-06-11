declare module astar {
    interface Position {
        x: number;
        y: number;
    }
    enum GraphNodeType {
        WALL,
        OPEN,
    }
    class Graph {
        public nodes: GraphNode[][];
        public elements: number[][];
        constructor(grid: number[][]);
        public toString(): string;
    }
    class GraphNode {
        public x: number;
        public y: number;
        public type: GraphNodeType;
        public data: any;
        public pos: Position;
        constructor(x: number, y: number, type: GraphNodeType);
        public toString(): string;
        public isWall(): boolean;
    }
    class BinaryHeap {
        public content: any[];
        public scoreFunction: (node: any) => number;
        constructor(scoreFunction: (node: any) => number);
        public push(node: any): void;
        public pop();
        public remove(node: any): void;
        public size(): number;
        public rescoreElement(node: any): void;
        public sinkDown(n: number): void;
        public bubbleUp(n: number): void;
    }
    interface AStarData {
        f: number;
        g: number;
        h: number;
        cost: number;
        visited: boolean;
        closed: boolean;
        parent: AStarData;
        pos: Position;
        org: any;
    }
    class AStar {
        static NO_CHECK_START_POINT: boolean;
        public grid: AStarData[][];
        constructor(grid: any[][], disablePoints?: Position[], enableCost?: boolean);
        public heap(): BinaryHeap;
        public _find(org: any): AStarData;
        public _search(start: any, end: any, diagonal?: boolean, heuristic?: Function): any[];
        static search(grid: any[][], start: any, end: any, disablePoints?: Position[], diagonal?: boolean, heuristic?: Function): any[];
        public manhattan(pos0: Position, pos1: Position): number;
        public neighbors(node: AStarData, diagonals?: boolean): AStarData[];
    }
}

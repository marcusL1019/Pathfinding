# Pathfinding
A*/Dijkstra pathfinding implemented in React.

UI implemented in React allows users to create/destroy walls which the algorithm will navigate around, choose the start and end points, and select which pathfinding algorithm to use (A* or Dijkstra).

The pathfinding algorithms are their own class which is invoked when the user hits the 'start' button. The pathfinding algorithms make use of a Binary Heap object to allow for quick lookup in the open set.

## TODO

* click epic to show stories
* enterNode should be not teh suck
* reducer needs to set state.nodes to collection of epic's, plus linked people

------------
How to filter entire collection of nodes by some filter set.

encapsulate code in an action file, set action.nodes=allNodes.filterByEpic(epicName) and action.type=LOAD_EPIC, then reducer just passes action.nodes along.



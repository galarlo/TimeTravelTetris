import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// fake data generator
const getItems = count =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k}`,
    content: `item ${k}`
  }));

// a little function to help us with reordering the result
export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = (isDraggingOver, itemsLength) => ({
  background: isDraggingOver ? "lightblue" : "",
  display: "flex",
  padding: grid,
  // width: itemsLength * 68.44 + 16
  width: "100%"
});

export default class HorizontalDraggableList extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   items: getItems(50)
    // };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.props.items,
      result.source.index,
      result.destination.index
    );

    this.props.onReorder(result.source.index, result.destination.index)
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <div style={{overflow: "scroll", height: "100%"}}>
        <div style={{display: "inline-block"}}>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable" direction="horizontal" style={{width: "100% !important"}}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver, this.props.items.length)}
                  {...provided.droppableProps}
                >
                  {this.props.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          {item.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    );
  }
}

// // Put the thing into the DOM!
// ReactDOM.render(<App />, document.getElementById("root"));
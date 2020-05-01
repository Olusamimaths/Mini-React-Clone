/**
 const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
const container = document.getElementById("root")
ReactDOM.render(element, container)

similar to
const element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
)
 */

const Didact = {
    createElement,
    render,
}

// an element is an object with type, props and children keys, our function has to create that object
/**
 * Babel converts JSX to valid js by
 * replacing the code between the tags with a call to createElement, passing the tag name, the props
 * and the children as parameters
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object" ? child : createTextElement(child)
      )
    }
  };
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        }
    }
}

/**
 * 
 * @param {object} element - the element object as transpiled by babel
 * @param {HTMLElement} container - the root component
 */
function render(element, container) {
  // creat the HTML element
  const dom = 
    element.type == "TEXT_NODE" 
      ? document.createTextNode("") // this is the call to the document not didatic
      : document.createElement(element.type)
    
    // assign the props to the element
    const isProperty = key => key != "children"
    Object.keys(element.props)
      .filter(isProperty)
      .forEach(name => {
        dom[name] = element.props[name]
      })
  // recusively render each child too
  element.props.children.forEach(child => render(child, dom))
  
  container.appendChild(dom)
}


/** @jsx Didact.createElement */
const element = (
    <div id="foo">
        <a>bar</a>
        <b/>
    </div>
)
/**
 * Babel will call 
 * Didact.createElement('div', {id: 'foo'}, {'a', null, 'bar'}, {'b', null, null})
 */
const container = document.getElementById('root')
Didact.render(element, container)
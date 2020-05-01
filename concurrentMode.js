/**
 * Problem : call to recursive call in render method might block the JavaScript thread
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
    element.type == "TEXT_ELEMENT" 
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

let nextUnitOfWork = null

function workLoop(deadline) {
    let shouldYield = false
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = perfomUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }

    /**
     * requestIdleCallback is like setTimeout but instead of us telling it when to run
     * the browser will run the callback when the main thread is idle
     * it gives us a deadline parameter - which we can use to check how much time we 
     * have until the browser takes control again
     */
    requestIdleCallback(workLoop)    
}

requestIdleCallback(workLoop)

function perfomUnitOfWork(nextUnitOfWork) {

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
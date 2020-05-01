/**
 * Problem : adding a new node to the DOM each time we work on it
 * the browser could interupt the work before rendering finishes and the 
 * user will see an incomplete UI
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
function createDom(fiber) {
  // creat the HTML element
  const dom = 
    fiber.type == "TEXT_ELEMENT" 
      ? document.createTextNode("") // this is the call to the document not didatic
      : document.createElement(fiber.type)
    
    // assign the props to the element
    const isProperty = key => key != "children"
    Object.keys(fiber.props)
      .filter(isProperty)
      .forEach(name => {
        dom[name] = fiber.props[name]
      })
  // recusively render each child too
  
  return dom;
}

function comitRoot() {
    commitWork(wipRoot.child)
    wipRoot = null
}
/**
 * 
 * @param {object} fiber 
 * recursively append all the nodes to the dom
 */
function commitWork(fiber) {
    if(!fiber) return
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
    }
    nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let wipRoot = null

function workLoop(deadline) {
    let shouldYield = false
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = perfomUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }

    if(!nextUnitOfWork && wipRoot) comitRoot()

    /**
     * requestIdleCallback is like setTimeout but instead of us telling it when to run
     * the browser will run the callback when the main thread is idle
     * it gives us a deadline parameter - which we can use to check how much time we 
     * have until the browser takes control again
     */
    requestIdleCallback(workLoop)    
}

requestIdleCallback(workLoop)

function perfomUnitOfWork(fiber) {
    // add dom node
    if(!fiber.dom) fiber.dom = createDom(fiber)
    
    
    // create new fibers for each child
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null

    while(index < elements.length) {
        const element = elements[index]

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }
        // add it to the fiber tree
        if(index == 0) {
            // first child
            fiber.child = newFiber
        }
        else {
            // sibling
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber
        index++
    }
    // return next unit of work
    if(fiber.child) return fiber.child
    let nextFiber = fiber
    while(nextFiber) {
        if(nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }

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
/*
  Listens for clicks on buttons with `[data-add-to-cart]`
  and adds the product to the cart.

  Manages state of the cart by refreshing the content using section rendering API
*/
class DynamicCart extends HTMLElement {
  constructor() {
    super()
    this.section = this.getAttribute('section')
    this.buttons = document.querySelectorAll('[data-add-to-cart]')
    this.removes = this.querySelectorAll('[data-remove]')
    this.quantities = this.querySelectorAll('[data-quantity]')
  }

  connectedCallback() {
    this.handleAdd = this.add.bind(this)
    this.buttons.forEach(button => button.addEventListener('click', this.handleAdd))
    this.removes.forEach(remove => remove.addEventListener('click', this.remove.bind(this)))
    this.quantities.forEach(quantity => quantity.addEventListener('change', this.update.bind(this)))
  }

  disconnectedCallback() {
    // removes generic event listeners when element is removed/replaced
    this.buttons.forEach(button => button.removeEventListener('click', this.handleAdd))
  }

  add(e) {
    // adds an item to the cart from a button
    const button = e.target.closest('[data-add-to-cart]')
    const variant = parseInt(button.getAttribute('data-variant-id'))
    const body = {
      items: [{
        id: variant,
        quantity: 1
      }],
      sections: `${this.getAttribute('section')}`
    }
    fetch(window.Shopify.routes.root + 'cart/add.js', prepareBody(body))
      .then(response => response.json())
      .then(this.replace.bind(this))
      .catch((error) => {
        console.error('Error:', error)
      })
  }

  remove(e) {
    // follows remove link from cart item and updates the cart display
    e.preventDefault()
    this.freeze()
    const link = e.target.closest('a')
    fetch(link.href)
      .then(this.getCart.bind(this))
      .then(this.replace.bind(this))
  }

  update(e) {
    // responds to changes in quantity in the cart
    const input = e.target.closest('[data-quantity]')
    const body = { updates: { }, sections: `${this.getAttribute('section')}` }
    body.updates[input.getAttribute('data-key')] = parseInt(input.value)

    this.freeze()

    fetch(window.Shopify.routes.root + 'cart/update.js', prepareBody(body))
      .then(response => response.json())
      .then(this.replace.bind(this))
      .catch((error) => {
        console.error('Error:', error)
      })
  }

  getCart() {
    // fetches the cart from the Shopify Section Rendering API and prepares it for the replace function
    return fetch(window.Shopify.routes.root + `?sections=${this.getAttribute('section')}`)
      .then(response => response.json())
      .then(json => {
        return { sections: json }
      })
  }

  replace(e) {
    // replace our section markup with fresh markup from the Cart API response
    const section = e.sections[this.getAttribute('section')]
    const refreshedState = new DOMParser().parseFromString(section, 'text/html').querySelector('dynamic-cart')
    this.replaceWith(refreshedState)
    return e
  }

  freeze() {
    // fades out our section while it loads and prevents clicks
    this.classList.add('opacity-50', 'pointer-events-none')
  }

  thaw() {
    // removes the opacity and re-enables clicks
    this.classList.remove('opacity-50', 'pointer-events-none')
  }
}

customElements.define('dynamic-cart', DynamicCart)

function prepareBody(body) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

class QuantityButtons extends HTMLElement {
  constructor() {
    super()
    this.increment = this.querySelector('[data-increment]')
    this.decrement = this.querySelector('[data-decrement]')
    this.input = this.querySelector('[data-quantity]')
  }

  connectedCallback() {
    this.increment.addEventListener('click', this.incrementQuantity.bind(this))
    this.decrement.addEventListener('click', this.decrementQuantity.bind(this))
  }

  incrementQuantity() {
    this.input.value++
    this.input.dispatchEvent(new Event('change'))
  }

  decrementQuantity() {
    if (this.input.value === this.input.min) return
    this.input.value--
    this.input.dispatchEvent(new Event('change'))
  }
}

customElements.define('quantity-buttons', QuantityButtons)

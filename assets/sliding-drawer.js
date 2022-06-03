class SlidingDrawer extends HTMLElement {
  constructor() {
    super()
    this.buttons = document.querySelectorAll(`button[aria-controls="${this.id}"]`)
    this.handleOutside = this.clickOutside.bind(this)
  }

  get isOpen() {
    return this.getAttribute('aria-expanded') === 'true'
  }

  connectedCallback() {
    this.buttons.forEach(button => button.addEventListener('click', this.toggle.bind(this)))
    document.addEventListener('keyup', this.escapeKey.bind(this))
  }

  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  open() {
    this.setAttribute('aria-expanded', 'true')
    document.addEventListener('click', this.handleOutside)
  }

  close() {
    this.setAttribute('aria-expanded', 'false')
    document.removeEventListener('click', this.handleOutside)
  }

  escapeKey(e) {
    if (e.key !== 'Escape') return
    if (this.isOpen) this.close()
  }

  clickOutside(e) {
    if (e.target.closest(`button[aria-controls="${this.id}"]`) || this.contains(e.target)) return
    this.close()
  }
}

customElements.define('sliding-drawer', SlidingDrawer)

const data = [
  {
    id: 'city',
    url: './images/city.png',
    rect: { x: 30, y: 150, w: 887, h: 516 },
  },
  {
    id: 'beach',
    url: './images/beach.jpg',
    rect: { x: -250, y: 210, w: 887, h: 456 },
  },
  {
    id: 'mountain',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rect: { x: 30, y: 150, w: 887, h: 516 },
  },
  {
    id: 'canyon',
    url: 'https://images.unsplash.com/photo-1443632864897-14973fa006cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rect: { x: -250, y: 150, w: 887, h: 516 },
  },
  {
    id: 'forest',
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2348&q=80',
    rect: { x: -250, y: 150, w: 887, h: 516 },
  },
  {
    id: 'space',
    url: 'https://images.unsplash.com/photo-1570284613060-766c33850e00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rect: { x: -250, y: 150, w: 887, h: 516 },
  }
];

export default class Outside {

  constructor(root, windowMask) {
    this.root = root;
    this.windowMask = windowMask;
    this.select(data[0].id);
  }

  select(id) {
    const item = data.find(i => i.id === id);
    if (!item) {
      console.warn('Outside not found:', id);
      return;
    }

    // remove previous
    if (this.outside) {
      this.outside.remove();
    }

    const { url, rect } = item;
    const { x, y, w, h } = rect;
    this.outside = this.root.image(url, x, y, w, h);
    this.outside.attr({ mask: this.windowMask });
    this.outside.insertAfter(this.root.select('#room-brightness_1_'));
  }
}
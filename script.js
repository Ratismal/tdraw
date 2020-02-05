const SCALE = 4;

class Drawer {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.canvas.height = this.canvas.scrollHeight;
    this.canvas.width = this.canvas.scrollWidth;

    this.ctx = canvas.getContext("2d");
    this.ctx.scale(SCALE, SCALE);
    this.setColor('red');
    this.ctx.lineWidth = 1;

    this.mouseDown = false;

    this.canvas.addEventListener('mousedown', this.mouseDownListener.bind(this));
    document.addEventListener('mouseup', this.mouseUpListener.bind(this));
    document.addEventListener('mousemove', this.mouseMoveListener.bind(this));

    this.lastCoord = [0, 0];

    try {
      this.pages = JSON.parse(localStorage.data);
    } catch {
      this.pages = [];
    }
    this.pageIndex = 0;
    this.setPage(0);

    // if (this.pages.length === 0) this.pages.push([]);
    // this.setPage(0);

    this.dirty = false;

    this._saveInterval = setInterval(this.saveInterval.bind(this), 1000);

    this.bindClick('#button_red', this.setColor.bind(this, 'red'));
    this.bindClick('#button_green', this.setColor.bind(this, 'green'));
    this.bindClick('#button_blue', this.setColor.bind(this, 'blue'));
  }

  bindClick(selector, callback) {
    let el = document.querySelector(selector);
    el.addEventListener('click', callback);
  }

  // getData() {
  //   return this.ctx.getImageData(0, 0, this.canvas.scrollWidth, this.canvas.scrollHeight);
  // }

  setPage(i) {
    this.pageIndex = i;
    if (this.pages[i]) {
      var img = new Image();
      let ctx = this.ctx;
      let canvas = this.canvas;
      console.log(this.pages[i]);
      img.onload = function () {
        let w = canvas.scrollWidth;
        let h = canvas.scrollHeight;
        ctx.drawImage(this, 0, 0, w, h, 0, 0, w / SCALE, h / SCALE);
        console.log(this);
        document.body.appendChild(img);
      }
      img.src = this.pages[i];
    }
    // if (!this.pages[i]) this.pages[i] = [];
    // this.history = this.pages[i];
    // console.log(this.history);
    // for (const p of this.history) {
    //   this.stroke(p);
    // }
  }

  saveInterval() {
    if (!this.mouseDown && this.dirty) {
      this.pages[this.pageIndex] = this.canvas.toDataURL();
      this.dirty = false;
      console.log('Saving...');
      localStorage.data = JSON.stringify(this.pages);
    }
  }

  setColor(color) {
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  mouseDownListener(e) {
    console.log('Mouse down on canvas', e);
    this.mouseDown = true;
    this.lastCoord = [e.screenX, e.screenY];
  }

  mouseUpListener(e) {
    if (this.mouseDown) {
      console.log('Mouse up');
      this.mouseDown = false;
      this.mouseMoveListener(e);
    }
  }

  stroke(first, last) {
    let p;
    if (first.length === 4) p = first;
    else if (last) {
      p = [first[0], first[1], last[0], last[1]].map(p => p / SCALE);
      // this.history.push(p);
      this.dirty = true;
    } else {
      throw new Error('Invalid stroke parameters');
    }
    this.ctx.moveTo(p[0], p[1]);
    this.ctx.lineTo(p[2], p[3]);
    this.ctx.stroke();
  }

  mouseMoveListener(e) {
    if (this.mouseDown) {
      console.log('mouse moving', e);
      const newCoord = [e.screenX, e.screenY];
      this.stroke(this.lastCoord, newCoord);
      this.lastCoord = newCoord;
    }
  }
}


void function () {
  window.drawer = new Drawer();
}();
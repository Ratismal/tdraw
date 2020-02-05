<template>
  <main>
    <canvas id="canvas" ref="canvas" @mousedown.prevent="boundMouseDown" />
  </main>
</template>

<script>
import { Colors, Sizes, Tools, CanvasActions, CanvasEvents } from '@/assets/constants';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      boundMouseUp: this.mouseUp.bind(this),
      boundMouseMove: this.mouseMove.bind(this),
      boundHandleAction: this.handleAction.bind(this),
      boundResizeHandler: this.resizeHandler.bind(this),
      resizeDebounce: null,
      canvas: null,
      ctx: null,
      scale: 1,
      mouseDown: false,
      lastCoord: [0, 0],
      history: [],
      currentAction: {},
      poppedHistory: [],
      locked: false,
      tool: Tools.BRUSH,
      color: Colors.RED,
      size: Sizes.MEDIUM
    }
  },
  computed: {
    ...mapState({
      props: state => ({
        tool: state.canvas.tool, 
        color: state.canvas.color, 
        size: state.canvas.size
      })
    })
  },
  watch: {
    props: {
      deep: true,
      handler() {
        this.updateProps();
      }
    }
  },
  mounted() {
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('resize', this.boundResizeHandler);
    this.$root.$on('canvasAction', this.boundHandleAction);
    this.canvas = this.$refs.canvas;
    this.resizeCanvas();
    this.ctx = this.canvas.getContext("2d");

    this.ctx.scale(this.scale, this.scale);
    this.setColor(Colors.RED);
    this.ctx.lineWidth = Sizes.MEDIUM;

    const page = this.$store.getters['save/currentPage'];
    this.loadPage(page);
    
  },
  destroyed() {
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('resize', this.boundResizeHandler);
    this.$root.$off('canvasAction', this.boundHandleAction);
  },
  methods: {
    updateProps() {
      this.setColor(this.props.color);
      this.setTool(this.props.tool);
      this.setSize(this.props.size);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
    },
    resizeCanvas() {
      this.canvas.width = document.body.scrollWidth;
      this.canvas.height = document.body.scrollHeight;
    },
    resizeHandler() {
      if (this.resizeDebounce) clearTimeout(this.resizeDebounce);
      this.resizeDebounce = setTimeout(() => {
        this.resizeCanvas();
        this.redraw();
      }, 100);
    },
    loadPage(page) {
      if (!page) page = this.$store.getters['save/currentPage'];
      this.history = page;
      this.redraw();
    },
    redraw() {
      this.locked = true;
      let start = Date.now();
      this.clear();
      let i = 0;
      for (const entry of this.history) {
        this.setColor(entry.color);
        this.setSize(entry.size);
        this.setTool(entry.tool);
        this.ctx.beginPath();
        let needsStroke = false;
        for (const action of entry.actions) {
          i++;
          // console.log(action.t, action.x, action.y);
          const to = [action.x, action.y];
          switch (action.t) {
            case CanvasActions.CIRCLE: {
              if (needsStroke) {
                this.ctx.stroke();
                needsStroke = false;
              }
              this.circle(to);
              break;
            }
            case CanvasActions.MOVE: {
              this.move(to);
              break;
            }
            case CanvasActions.STROKE: {
              needsStroke = true;
              this.stroke(to, true);
              break;
            }
          }
          this.lastCoord = to;
        }
        if (needsStroke) {
          this.ctx.stroke();
          needsStroke = false;
        }
        this.ctx.closePath();
      }
      let diff = Math.round((Date.now() - start) * 100) / 100;
      console.log('Redraw Duration: %dms\n%i operations were performed.', diff, i);
      this.$store.commit('canvas/setDiagnostics', {
        operations: i,
        time: diff
      });
      this.updateProps();
      this.locked = false;
    },
    boundMouseDown(e) {
      e.preventDefault();
      this.mouseDown = true;
      this.lastCoord = [e.clientX, e.clientY];
      // let adjacent = this.lastCoord.map(c => c - 1);
      this.addHistory();
      this.ctx.beginPath();
      this.circle(this.lastCoord);
      this.move(this.lastCoord);
    },
    mouseUp(e) {
      e.preventDefault();
      if (this.mouseDown) {
        this.mouseDown = false;
        this.ctx.moveTo(...this.lastCoord);
        this.circle(this.lastCoord);
        this.ctx.closePath();
        this.$store.commit('save/savePageState', this.history);
        // console.log(this.history);
      }
    },
    mouseMove(e) {
      e.preventDefault();
      if (this.mouseDown) {
        // console.log('mouse moving', e);
        const newCoord = [e.clientX, e.clientY];
        // this.stroke(this.lastCoord, newCoord);
        this.stroke(newCoord);
        this.lastCoord = newCoord;
      }
    },
    addHistory() {
      if (this.locked) return;
      this.currentAction = {
        tool: this.tool,
        color: this.color,
        size: this.size,
        actions: []
      };
      this.history.push(this.currentAction);
      this.poppedHistory = [];
    },
    addAction(to, type, extra = {}) {
      if (this.locked) return;
      const action = {
        x: to[0],
        y: to[1],
        t: type,
        ...extra
      };
      this.currentAction.actions.push(action);
    },
    setColor(color) {
      this.ctx.fillStyle = color;
      this.ctx.strokeStyle = color;
      this.color = color;
    },
    setSize(size) {
      this.ctx.lineWidth = size;
      this.size = size;
    },
    setTool(tool) {
      switch (tool) {
        case Tools.BRUSH: {
          this.ctx.globalCompositeOperation = "source-over";
          break;
        }
        case Tools.ERASER: {
          this.ctx.globalCompositeOperation = "destination-out";
        }
      }
      this.tool = tool;
    },
    move(to) {
      this.addAction(to, CanvasActions.MOVE);
      this.ctx.moveTo(...to);
    },
    circle(to) {
      this.addAction(to, CanvasActions.CIRCLE);
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.arc(to[0], to[1], this.ctx.lineWidth / 2, 2 * Math.PI, false);
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.beginPath();
    },
    stroke(to, prevent = false) {
      // let p;
      // if (first.length === 4) p = first;
      // else if (last) {
      //   p = [first[0], first[1], last[0], last[1]].map(p => p / this.scale);
      //   // this.history.push(p);
      //   this.dirty = true;
      // } else {
      //   throw new Error('Invalid stroke parameters');
      // }
      // console.log('stroking %i,%i', ...to);
      // this.ctx.moveTo(p[0], p[1]);
      // this.ctx.lineTo(p[2], p[3]);
      // this.ctx.stroke();
      this.addAction(to, CanvasActions.STROKE);
      this.ctx.lineTo(...to);
      if (!prevent)
        this.ctx.stroke();
    },
    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    handleAction(action) {
      switch (action.code) {
        case CanvasEvents.TOOLSET: {
          this.setColor(action.data.color);
          this.setSize(action.data.size);
          this.setTool(action.data.tool);
          break;
        }
        case CanvasEvents.CLEAR: {
          this.clear();
          this.history = [];
          this.addHistory();
          this.$store.commit('save/savePageState', this.history);
          break;
        }
        case CanvasEvents.UNDO: {
          if (this.history.length > 0) {
            this.poppedHistory.push(this.history.pop());
            this.redraw();
          }
          break;
        }
        case CanvasEvents.REDO: {
          if (this.poppedHistory.length > 0) {
            this.history.push(this.poppedHistory.pop());
            this.redraw();
          }
          break;
        }
        case CanvasEvents.SET_PAGE: {
          this.loadPage();
          break;
        }
      }
    }
  }
}
</script>


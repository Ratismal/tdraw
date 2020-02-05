<template>
  <footer class="toolbar">
    <div class="button-bar">
      <button :class="{button:true, tool:true, selected: tool === tools.ERASER}" @click.prevent="setTool(tools.ERASER)">
        eraser
      </button>
      <button :class="{button:true, tool:true, selected: tool === tools.BRUSH}" @click.prevent="setTool(tools.BRUSH)">
        brush
      </button>
      <button
        v-for="(c, k) of colors"
        :key="k"
        :class="{button:true, color:true, selected: color === c}"
        :style="{'background-color': c}"
        @click.prevent="setColor(c)"
      />
      <button
        v-for="(s, k) of sizes"
        :key="k"
        :class="{button:true, size:true, selected: size === s}"
        class="button size"
        @click.prevent="setSize(s)"
      >
        <div class="size-icon" :style="{width: s + 'px', height: s + 'px'}" />
      </button>
      
      <button class="button extra" @click.prevent="clearDrawing">
        clear all
      </button>
      <button class="button extra" @click.prevent="undo">
        undo
      </button>
      <button class="button extra" @click.prevent="redo">
        redo
      </button>
      <button
        v-for="page of pages"
        :key="page"
        :class="{button:true, extra:true, selected: page === currentPage }"

        @click.prevent="setPage(page)"
      >
        P{{ page + 1 }}
      </button>

      <div class="diagnostics">
        Redraw Time: {{ diagnostics.time }}ms<br>
        Operations: {{ diagnostics.operations }}
      </div>
    </div>
  </footer>
</template>

<script>
import { Colors, Sizes, Tools, CanvasEvents } from '@/assets/constants';
import { mapState} from 'vuex';

export default {
  data() {
    return {
      colors: Colors,
      sizes: Sizes,
      tools: Tools,
      pages: [0, 1, 2],
      boundKeyListener: this.handleKey.bind(this),
      map: [
        { code: 'KeyZ', ctrlKey: true, shiftKey: false, func: this.undo.bind(this) },
        { code: 'KeyZ', ctrlKey: true, shiftKey: true, func: this.redo.bind(this) },
        { code: 'KeyB', ctrlKey: false, shiftKey: false, func: this.setTool.bind(this, Tools.BRUSH) },
        { code: 'KeyE', ctrlKey: false, shiftKey: false, func: this.setTool.bind(this, Tools.ERASER) },
        { code: 'Digit1', ctrlKey: false, shiftKey: false, func: this.setSize.bind(this, Sizes.SMALL) },
        { code: 'Digit2', ctrlKey: false, shiftKey: false, func: this.setSize.bind(this, Sizes.MEDIUM) },
        { code: 'Digit3', ctrlKey: false, shiftKey: false, func: this.setSize.bind(this, Sizes.LARGE) },
        { code: 'Digit4', ctrlKey: false, shiftKey: false, func: this.setSize.bind(this, Sizes.XLARGE) },
        { code: 'Digit5', ctrlKey: false, shiftKey: false, func: this.setSize.bind(this, Sizes.XXLARGE) },
        { code: 'Digit6', ctrlKey: false, shiftKey: false, func: this.setSize.bind(this, Sizes.XXXLARGE) },
        { code: 'Digit1', ctrlKey: false, shiftKey: true, func: this.setColor.bind(this, Colors.RED) },
        { code: 'Digit2', ctrlKey: false, shiftKey: true, func: this.setColor.bind(this, Colors.GREEN) },
        { code: 'Digit3', ctrlKey: false, shiftKey: true, func: this.setColor.bind(this, Colors.BLUE) },
      ]
    }
  },
    computed: {
    ...mapState({
      currentPage: state => state.save.currentPage,
      tool: state => state.canvas.tool,
      size: state => state.canvas.size,
      color: state => state.canvas.color,
      diagnostics: state => state.canvas.diagnostics
    })
  },
  mounted() {
    document.addEventListener('keypress', this.boundKeyListener);
  },
  destroyed() {
    document.removeEventListener('keypress', this.boundKeyListener);
  },
  methods: {
    setTool(tool) {
      this.$store.commit('canvas/updateTool', tool);
      // this.sendToolUpdate();
    },
    setColor(color) {
      this.$store.commit('canvas/updateColor', color);
      this.$store.commit('canvas/updateTool', Tools.BRUSH);
      // this.sendToolUpdate();
    },
    setSize(size) {
      this.$store.commit('canvas/updateSize', size);
      // this.sendToolUpdate();
    },
    setPage(page) {
      this.$store.commit('save/setPage', page);
      this.$root.$emit('canvasAction', {
        code: CanvasEvents.SET_PAGE, data: {}
      });
    },
    sendToolUpdate() {
      this.$root.$emit('canvasAction', {
        code: CanvasEvents.TOOLSET,
        data: {
          tool: this.tool,
          color: this.color,
          size: this.size
        }
      })
    },
    clearDrawing() {
      this.$root.$emit('canvasAction', {
        code: CanvasEvents.CLEAR, data: {}
      });
    },
    handleKey(e) {
      let conf = this.map.find(m => {
        for (const key in m) {
          if (key === 'func') continue;
          if (m[key] !== e[key]) return false;
        }
        return true;
      });
      if (conf) {
        e.preventDefault();
        conf.func();
      }
    },
    undo() {
      this.$root.$emit('canvasAction', {
        code: CanvasEvents.UNDO, data: {}
      });
    },
    redo() {
      this.$root.$emit('canvasAction', {
        code: CanvasEvents.REDO, data: {}
      });
    }
  }
}
</script>
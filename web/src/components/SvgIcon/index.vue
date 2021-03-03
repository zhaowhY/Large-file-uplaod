<template>
  <i
    v-if="isElement"
    :class="iconClass"
  ></i>
  <div
    v-else-if="isExternal"
    :style="styleExternalIcon"
    class="svg-external-icon svg-icon"
    v-on="$listeners"
  />
  <svg
    v-else
    :class="svgClass"
    aria-hidden="true"
    v-on="$listeners"
  >
    <use :href="iconName" />
  </svg>
</template>

<script>

export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  computed: {
    // 是否为element的icon
    isElement() {
      return /^el/.test(this.iconClass);
    },
    // 网络资源
    isExternal() {
      return /^(https?:|mailto:|tel:)/.test(this.iconClass);
    },
    iconName() {
      return `#icon-${this.iconClass}`;
    },
    svgClass() {
      if (this.className) {
        return `svg-icon ${this.className}`;
      }
      return 'svg-icon';
    },
    styleExternalIcon() {
      return {
        mask: `url(${this.iconClass}) no-repeat 50% 50%`,
        '-webkit-mask': `url(${this.iconClass}) no-repeat 50% 50%`
      };
    }
  },
  methods: {

  }
};
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>

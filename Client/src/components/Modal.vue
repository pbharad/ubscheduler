<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <slot name="header"></slot>
            <button class="delete" aria-label="close" @click="$emit('close')"></button>
        </header>
        <section class="modal-card-body">
            <slot name="content"></slot>
        </section>
        <footer class="modal-card-foot">
            <slot name="footer"></slot>
        </footer>
    </div>
  </div>
</template>

<script>
export default {
    name:'Modal',
    
}
</script>

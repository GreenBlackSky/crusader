<!-- "Change session": push, pull, legs, full body, mobility. -->
<script lang="ts">
  import { TEMPLATES, type TemplateId } from '../lib/motion/library';
  import { chooseTemplate } from '../lib/state.svelte';

  const ORDER: TemplateId[] = ['push', 'pull', 'legs', 'full', 'mobility'];

  const { current }: { current: TemplateId | null } = $props();
</script>

<div class="chips tpl">
  {#each ORDER as tpl (tpl)}
    <button class="chip" class:on={current === tpl} onclick={() => chooseTemplate(tpl)}
      >{TEMPLATES[tpl].short}</button
    >
  {/each}
</div>

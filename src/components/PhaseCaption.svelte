<!-- "Lower slowly…": a caption that follows the animation's phase. -->
<script lang="ts">
  import type { Playing } from '../lib/anim';
  import { DESC } from '../lib/motion/descriptions';

  const CAPTION_MS = 160;

  const { id, main }: { id: string; main: Playing | null } = $props();

  const phases = $derived(DESC[id]?.phases);
  let text = $state('');

  $effect(() => {
    const list = phases;
    const playing = main;
    if (!list || !playing) {
      return;
    }
    const tick = (): void => {
      const phase = playing.phase();
      let caption = list[0][1];
      list.forEach(([at, words]) => {
        if (phase >= at) {
          caption = words;
        }
      });
      text = caption;
    };
    tick();
    const timer = setInterval(tick, CAPTION_MS);
    return () => clearInterval(timer);
  });
</script>

{#if phases}<p class="phasecap" aria-hidden="true">{text}</p>{/if}

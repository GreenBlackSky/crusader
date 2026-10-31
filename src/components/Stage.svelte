<!--
  An exercise's animation. The "primary" stage on screen gets the 3D figure
  (when 3D is on); the others are 2D. `onmain` hands out the playing animation
  so a phase caption can follow it.
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { mountStage, type Playing } from '../lib/anim';
  import { EX } from '../lib/motion/library';
  import { ui, use3d, viewOf } from '../lib/state.svelte';

  const {
    id,
    size = '',
    primary = false,
    onmain,
  }: {
    id: string;
    size?: string;
    primary?: boolean;
    /** receives the playing animation (for a phase caption) */
    onmain?: (main: Playing | null) => void;
  } = $props();

  let host: HTMLDivElement;
  const ex = $derived(EX[id]);
  const view = $derived(viewOf(id));
  const in3d = $derived(primary && use3d());

  $effect(() => {
    const mounted = mountStage(host, {
      ex,
      view,
      in3d,
      preset: untrack(() => ui.cam),
      onPreset: (name) => (ui.camShown = name),
    });
    if (in3d) {
      untrack(() => (ui.camShown = ui.cam));
    }
    onmain?.(mounted.main);
    return () => mounted.destroy();
  });
</script>

<div bind:this={host} class="stage {size}" aria-label="Animation of {ex.name}"></div>

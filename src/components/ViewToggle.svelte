<!--
  The camera buttons under an animation: 3D / Side / Front / Top for the 3D
  figure, or Side / Front / Both for exercises with a second 2D angle.
-->
<script lang="ts">
  import { EX } from '../lib/motion/library';
  import type { CameraPreset } from '../lib/motion/mannequin3d';
  import { setCamera, setView, ui, use3d, viewOf } from '../lib/state.svelte';
  import type { View } from '../lib/types';

  const CAMERAS: Array<[CameraPreset, string]> = [
    ['3d', '3D'],
    ['side', 'Side'],
    ['front', 'Front'],
    ['top', 'Top'],
  ];

  const { id }: { id: string } = $props();
  const ex = $derived(EX[id]);
  const view = $derived(viewOf(id));
  const views = $derived<Array<[View, string]>>([
    ['side', 'Side'],
    ['front', ex.flabel ?? 'Front'],
    ['both', 'Both'],
  ]);
</script>

{#if use3d()}
  <div class="seg viewseg" role="group" aria-label="Camera angle">
    {#each CAMERAS as [key, label] (key)}
      <button
        class:on={ui.camShown === key}
        aria-pressed={ui.camShown === key}
        onclick={() => setCamera(key)}>{label}</button
      >
    {/each}
  </div>
{:else if ex.front}
  <div class="seg viewseg" role="group" aria-label="Camera view">
    {#each views as [key, label] (key)}
      <button class:on={view === key} aria-pressed={view === key} onclick={() => setView(id, key)}
        >{label}</button
      >
    {/each}
  </div>
{/if}

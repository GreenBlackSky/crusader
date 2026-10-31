<!-- "End this workout?" — save what was done, throw it away, or keep going. -->
<script lang="ts">
  import { discard, runner, saveAndQuit, setsLogged, stretchCount } from '../lib/run.svelte';
  import { closeSheet } from '../lib/state.svelte';

  const run = $derived(runner.run);
</script>

{#if run && run.routine}
  {@const n = run.workSegs.length}
  <div class="sheet-in">
    <h2>End this routine?</h2>
    <p>
      {n
        ? `You've done ${n} of ${stretchCount(run)} stretches.`
        : "You haven't finished a stretch yet."}
    </p>
    <div class="btns">
      {#if n}<button class="btn" onclick={saveAndQuit}>Save as done</button>{/if}
      <button class="btn ghost" onclick={discard}>Discard</button>
      <button class="btn ghost" onclick={closeSheet}>Keep going</button>
    </div>
  </div>
{:else if run}
  {@const n = setsLogged(run)}
  <div class="sheet-in">
    <h2>End this workout?</h2>
    <p>
      {n ? `You've logged ${n} set${n === 1 ? '' : 's'}.` : "You haven't logged any sets yet."}
    </p>
    <div class="btns">
      {#if n}<button class="btn" onclick={saveAndQuit}>Save what I did</button>{/if}
      <button class="btn ghost" onclick={discard}>Discard</button>
      <button class="btn ghost" onclick={closeSheet}>Keep going</button>
    </div>
  </div>
{/if}

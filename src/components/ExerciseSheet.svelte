<!--
  One exercise: the animation (3D when on), what it works, how to do it,
  your level and pins, and the whole progression ladder it belongs to.
-->
<script lang="ts">
  import type { Playing } from '../lib/anim';
  import { EQ_LABEL, EX, LAD, missingEq, musOf } from '../lib/motion/library';
  import {
    closeSheet,
    data,
    openExercise,
    setLevel,
    toggleHidden,
    togglePin,
  } from '../lib/state.svelte';
  import { effectiveIndex, isMobility } from '../lib/training';
  import HowTo from './HowTo.svelte';
  import Icon from './Icon.svelte';
  import Legend from './Legend.svelte';
  import PhaseCaption from './PhaseCaption.svelte';
  import Stage from './Stage.svelte';
  import ViewToggle from './ViewToggle.svelte';
  import Xid from './Xid.svelte';

  const { id }: { id: string } = $props();

  let main = $state.raw<Playing | null>(null);
  const ex = $derived(EX[id]);
  const ladder = $derived(LAD[ex.ladder]);
  const mobility = $derived(isMobility(ladder.id));
  const missing = $derived(missingEq(ex, data.profile.equip));
  const stat = $derived(data.progress.stats[id]);
  const pinned = $derived(data.progress.pinned.includes(id));
  const hidden = $derived(data.progress.hidden.includes(id));
  const level = $derived(mobility ? -2 : effectiveIndex(data, ladder.id));
  const needs = (list: string[]): string =>
    list.map((k) => EQ_LABEL[k].toLowerCase()).join(' and ');
  const goal = $derived.by(() => {
    if (ex.kind === 'time') {
      return ex.goal + ' sec';
    }
    return `goal ${ex.goal} ${ex.kind === 'reps' ? 'reps' : 'sec'}${ex.per ? ' each side' : ''}`;
  });
</script>

<div class="sheet-in">
  <button class="x" aria-label="Close" onclick={closeSheet}><Icon name="close" /></button>
  <Stage {id} size="sm" primary onmain={(m) => (main = m)} /><ViewToggle {id} /><PhaseCaption
    {id}
    {main}
  />
  <h2>{ex.name}<Xid n={ex.n} /></h2>
  <p class="meta">
    {ladder.name} · {goal}{stat && stat.best ? ' · your best ' + stat.best : ''}
  </p>
  {#if missing.length}
    <p class="note">
      <Icon name="lock" small /> Needs {needs(missing)}. Turn it on in Profile when you have it.
    </p>
  {/if}
  <Legend mus={musOf(ex)} />
  <p class="cue">{ex.cue}</p>
  <HowTo {id} />
  <div class="btns">
    {#if !mobility && !missing.length && ex.idx !== level}
      <button class="btn" onclick={() => setLevel(id)}>Set as my level</button>
    {/if}
    {#if !mobility}
      <button class="btn ghost" aria-pressed={pinned} onclick={() => togglePin(id)}
        >{pinned ? 'Unpin' : 'Pin to workouts'}</button
      >
    {/if}
    <button class="btn ghost" onclick={() => toggleHidden(id)}
      >{hidden ? 'Show in workouts again' : 'Hide from workouts'}</button
    >
  </div>
  {#if ladder.ids.length > 1}
    <h3 class="sm">Progression</h3>
    <ol class="ladder">
      {#each ladder.ids as other (other)}
        {@const step = EX[other]}
        {@const locked = missingEq(step, data.profile.equip).length > 0}
        <li class:cur={other === id} class:locked>
          <button onclick={() => openExercise(other)}>{step.name}</button
          >{#if step.idx === level}<span class="tag">Your level</span>{/if}{#if locked}<span
              class="lk"><Icon name="lock" small /></span
            >{/if}
        </li>
      {/each}
    </ol>
  {/if}
</div>

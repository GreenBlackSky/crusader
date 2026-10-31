<!-- One exercise of today's plan: thumbnail, sets × reps, pin and swap. -->
<script lang="ts">
  import { thumb } from '../lib/anim';
  import { EX } from '../lib/motion/library';
  import { data, openExercise, swapExercise, togglePin, viewOf } from '../lib/state.svelte';
  import { isWarmOrCool } from '../lib/training';
  import type { PlanItem } from '../lib/types';
  import Icon from './Icon.svelte';
  import Xid from './Xid.svelte';

  const ROLE_LABEL: Record<string, string> = {
    warm: 'Warm-up',
    cool: 'Cool-down',
    balance: 'Balance',
    core: 'Core',
  };

  const { item, index }: { item: PlanItem; index: number } = $props();

  const ex = $derived(EX[item.id]);
  const role = $derived(ROLE_LABEL[item.role] ?? '');
  const pinned = $derived(data.progress.pinned.includes(item.id));

  const setsText = $derived.by(() => {
    if (ex.kind === 'time') {
      return `${item.amount} sec`;
    }
    const amount = ex.kind === 'reps' ? item.amount : item.amount + ' s';
    return `${item.sets} × ${amount}${ex.per ? ' per side' : ''}`;
  });
</script>

<li class="row">
  <button
    class="thumb"
    aria-label="Open {ex.name}"
    use:thumb={{ id: item.id, view: viewOf(item.id) }}
    onclick={() => openExercise(item.id)}
  ></button>
  <div class="rt">
    <b>{ex.name}<Xid n={ex.n} /></b><span>{setsText}{role ? ' · ' + role : ''}</span>
  </div>
  {#if !isWarmOrCool(item.role)}
    <button
      class="ib"
      class:on={pinned}
      aria-label="{pinned ? 'Unpin' : 'Pin'} {ex.name}"
      aria-pressed={pinned}
      onclick={() => togglePin(item.id)}><Icon name="pin" /></button
    ><button class="ib" aria-label="Swap {ex.name}" onclick={() => swapExercise(index)}
      ><Icon name="shuffle" /></button
    >
  {/if}
</li>

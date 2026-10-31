<!-- This week, Monday to Sunday: train, box or rest, and a tick when done. -->
<script lang="ts">
  import { DOWS, now } from '../lib/dates';
  import { data } from '../lib/state.svelte';
  import { weekStrip } from '../lib/training';
  import Icon from './Icon.svelte';

  const LABEL = { box: 'Box', train: 'Train', rest: 'Rest' };

  const days = $derived(weekStrip(data, data.sessions, now()));
</script>

<div class="week" role="group" aria-label="This week">
  {#each days as day (day.dow)}
    <div class="wd {day.kind}" class:did={day.did} class:today={day.today} class:both={day.both}>
      <span>{DOWS[day.dow]}</span><em
        >{#if day.did}<Icon name="check" small />{:else}{LABEL[day.kind]}{/if}</em
      >{#if day.both && !day.did}<small>+ box</small>{/if}
    </div>
  {/each}
</div>

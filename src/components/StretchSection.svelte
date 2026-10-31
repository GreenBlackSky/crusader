<!--
  Stretch breaks: three short routines a day (morning, mid-day, evening),
  the stretches picked fresh each day and kept for the day.
-->
<script lang="ts">
  import { minsTxt, todayStr } from '../lib/dates';
  import { thumb } from '../lib/anim';
  import { ROUTINES } from '../lib/motion/library';
  import { startRoutine } from '../lib/run.svelte';
  import { data, saveProgress, viewOf } from '../lib/state.svelte';
  import {
    rememberRoutine,
    ROUTINE_IDS,
    routineItems,
    routineNow,
    routineSecs,
    routinesDone,
  } from '../lib/training';
  import type { RoutineId } from '../lib/motion/library';
  import Icon from './Icon.svelte';

  const day = todayStr();
  const now = routineNow();
  const done = $derived(routinesDone(data, day));

  /* keep today's picks, so they don't change during the day */
  $effect(() => {
    let changed = false;
    ROUTINE_IDS.forEach((key) => {
      changed = rememberRoutine(data, key, day) || changed;
    });
    if (changed) {
      saveProgress();
    }
  });

  function shuffle(key: RoutineId): void {
    delete data.progress.rplan[day + ':' + key];
    data.progress.rsalt = (data.progress.rsalt || 0) + 1;
    rememberRoutine(data, key, day);
    saveProgress();
  }
</script>

<section class="stretch">
  <div class="plan-hd"><h2>Stretch breaks</h2></div>
  <p class="meta">
    Three short routines for the day, mixed up each day. Tap shuffle for a different set.
  </p>
  <ul class="list">
    {#each ROUTINE_IDS as key (key)}
      {@const routine = ROUTINES[key]}
      {@const isDone = done.includes(key)}
      {@const isNow = key === now && !isDone}
      <li class="row routine">
        <span class="thumb" use:thumb={{ id: routine.thumb, view: viewOf(routine.thumb) }}></span>
        <div class="rt">
          <b
            >{routine.name}{isNow || isDone ? ' ' : ''}{#if isNow}<span class="tag">Now</span
              >{/if}{#if isDone}<span class="okmark"><Icon name="check" small /> Done</span>{/if}</b
          ><span
            >{minsTxt(routineSecs(data, key, day))} · {routineItems(data, key, day).length} stretches
            · {routine.sub}</span
          >
        </div>
        <button
          class="ib"
          aria-label="Pick different stretches for the {routine.name.toLowerCase()} routine"
          onclick={() => shuffle(key)}><Icon name="shuffle" /></button
        ><button
          class="btn sm"
          class:ghost={isDone}
          aria-label="{isDone ? 'Repeat' : 'Start'} {routine.name} routine"
          onclick={() => startRoutine(key)}>{isDone ? 'Again' : 'Start'}</button
        >
      </li>
    {/each}
  </ul>
</section>

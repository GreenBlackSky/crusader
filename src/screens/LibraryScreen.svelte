<!--
  Exercises: every movement, grouped by progression ladder, with search and
  a filter by family. Locked ones need equipment the profile doesn't have.
-->
<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import Xid from '../components/Xid.svelte';
  import { thumb } from '../lib/anim';
  import {
    ALL_IDS,
    EQ_LABEL,
    EX,
    FAMS,
    LAD,
    missingEq,
    type Exercise,
  } from '../lib/motion/library';
  import { data, openExercise, ui, viewOf } from '../lib/state.svelte';
  import { effectiveIndex, isMobility } from '../lib/training';

  const FILTERS = [{ k: 'all', label: 'All' }, ...FAMS];

  const query = $derived(ui.libQuery.trim().toLowerCase());
  const groups = $derived(
    Object.values(LAD)
      .filter((ladder) => ui.libFam === 'all' || ladder.fam === ui.libFam)
      .map((ladder) => ({
        ladder,
        level: isMobility(ladder.id) ? -2 : effectiveIndex(data, ladder.id),
        ids: ladder.ids.filter((id) => matches(EX[id], ladder.name)),
      }))
      .filter((group) => group.ids.length),
  );

  /** By name, ladder name, or reference number ("12" or "#12"). */
  function matches(ex: Exercise, ladderName: string): boolean {
    return (
      !query ||
      ex.name.toLowerCase().includes(query) ||
      ladderName.toLowerCase().includes(query) ||
      (/^#?\d+$/.test(query) && ex.n === +query.replace('#', ''))
    );
  }

  function goalText(ex: Exercise): string {
    if (ex.kind === 'time') {
      return ex.goal + ' sec';
    }
    const unit = ex.kind === 'reps' ? 'reps' : 'sec';
    return `Goal ${ex.goal} ${unit}${ex.per ? ' each side' : ''}`;
  }
</script>

<header class="hd">
  <h1>Exercises</h1>
  <p class="sub">{ALL_IDS.length} movements. Locked ones need equipment from your profile.</p>
</header>
<div class="search">
  <input
    type="search"
    id="q"
    placeholder="Search exercises"
    aria-label="Search exercises"
    bind:value={ui.libQuery}
  />
</div>
<div class="chips scroll" role="group" aria-label="Filter">
  {#each FILTERS as filter (filter.k)}
    <button class="chip" class:on={ui.libFam === filter.k} onclick={() => (ui.libFam = filter.k)}
      >{filter.label}</button
    >
  {/each}
</div>
{#each groups as group (group.ladder.id)}
  <section class="grp">
    <h3>{group.ladder.name}</h3>
    <ul class="lib">
      {#each group.ids as id (id)}
        {@const ex = EX[id]}
        {@const missing = missingEq(ex, data.profile.equip)}
        <li>
          <button class="lrow" class:locked={missing.length} onclick={() => openExercise(id)}
            ><span class="thumb" use:thumb={{ id, view: viewOf(id) }}></span>
            <span class="rt"
              ><b>{ex.name}<Xid n={ex.n} /></b><span
                >{#if missing.length}<Icon name="lock" small /> Needs {missing
                    .map((k) => EQ_LABEL[k].toLowerCase())
                    .join(' and ')}{:else if data.progress.hidden.includes(id)}Hidden from workouts{:else}{goalText(
                    ex,
                  )}{/if}</span
              ></span
            >
            {#if ex.idx === group.level}<span class="tag">Your level</span>{/if}</button
          >
        </li>
      {/each}
    </ul>
  </section>
{:else}
  <p class="empty">No exercises match that search.</p>
{/each}

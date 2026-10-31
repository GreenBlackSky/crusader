<!-- After a workout or a stretch routine: what was done, and level-ups to accept. -->
<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import { todayStr } from '../lib/dates';
  import { EX, ROUTINES } from '../lib/motion/library';
  import { data, go, saveProgress, ui, type Summary } from '../lib/state.svelte';
  import { acceptLevelUp, ROUTINE_IDS, routinesDone } from '../lib/training';

  const { summary }: { summary: Summary } = $props();

  /** level-up card i: offered, accepted, or dismissed */
  const answers = $state<Record<number, 'yes' | 'no'>>({});

  const done = $derived(routinesDone(data, todayStr()));

  function close(): void {
    ui.summary = null;
    ui.tplOverride = null;
    go('today');
  }
</script>

{#if summary.kind === 'routine'}
  {@const routine = ROUTINES[summary.routine]}
  {@const nextUp = ROUTINE_IDS.find((k) => !done.includes(k))}
  <section class="sum">
    <div class="tick"><Icon name="check" /></div>
    <h1>{routine.name} done</h1>
    <div class="stats">
      <div class="stat">
        <b>{Math.max(1, Math.round(summary.secs / 60))}</b><span>minutes stretching</span>
      </div>
      <div class="stat"><b>{summary.count}</b><span>stretches</span></div>
    </div>
    <ul class="log">
      {#each ROUTINE_IDS as key (key)}
        <li>
          <span>{ROUTINES[key].name}</span><span>{done.includes(key) ? 'Done' : 'Not yet'}</span>
        </li>
      {/each}
    </ul>
    {#if nextUp}
      <p class="fine">Next up today: {ROUTINES[nextUp].name.toLowerCase()} routine.</p>
    {:else}
      <p class="fine">All three routines done today.</p>
    {/if}
    <button class="btn big" onclick={close}>Done</button>
  </section>
{:else}
  {@const doc = summary.doc}
  <section class="sum">
    <div class="tick"><Icon name="check" /></div>
    <h1>Nice work</h1>
    <div class="stats">
      <div class="stat">
        <b>{Math.max(1, Math.round(doc.duration / 60))}</b><span>minutes</span>
      </div>
      <div class="stat"><b>{doc.kcal}</b><span>kcal (est.)</span></div>
      <div class="stat">
        <b>{doc.items.reduce((sum, i) => sum + i.sets.length, 0)}</b><span>sets logged</span>
      </div>
    </div>
    <ul class="log">
      {#each doc.items as item (item.id)}
        <li>
          <span>{EX[item.id].name}</span><span
            >{item.sets.join(', ')}{EX[item.id].kind === 'hold' ? ' s' : ''}</span
          >
        </li>
      {/each}
    </ul>
    {#each summary.ups as up, k (up.ladder)}
      {#if answers[k] === 'yes'}
        <div class="card up"><p>Level updated. See you next session.</p></div>
      {:else if !answers[k]}
        <div class="card up">
          <h2>Ready to level up</h2>
          <p>
            You hit the goal on every set twice in a row: <b>{EX[up.from].name}</b>. Next:
            <b>{EX[up.to].name}</b>, starting lower and building back up.
          </p>
          <div class="btns">
            <button
              class="btn"
              onclick={() => {
                acceptLevelUp(data, up, todayStr());
                saveProgress();
                answers[k] = 'yes';
              }}>Move up</button
            ><button class="btn ghost" onclick={() => (answers[k] = 'no')}>Not yet</button>
          </div>
        </div>
      {/if}
    {/each}
    <p class="fine">
      Estimated calories use your body weight and exercise intensity, accurate to roughly ±30%.
    </p>
    <button class="btn big" onclick={close}>Done</button>
  </section>
{/if}

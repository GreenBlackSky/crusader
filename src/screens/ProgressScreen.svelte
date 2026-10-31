<!--
  Progress: this week's numbers, best set per session for any exercise,
  calories per week, body check-ins and level-ups.
-->
<script lang="ts">
  import { addDays, parseYmd, shortDay, todayStr, weekStart } from '../lib/dates';
  import { barChart, lineChart } from '../lib/charts';
  import { EX } from '../lib/motion/library';
  import { data, saveBody, saveProfile, ui } from '../lib/state.svelte';
  import { formatWeight, KG_PER_LB, shownWeight } from '../lib/training';
  import type { BodyEntry } from '../lib/types';
  import { toast } from '../lib/ui/toast.svelte';

  const CHART_WEEKS = 8;

  const thisMonday = weekStart(todayStr());
  const sessions = $derived(data.sessions);
  const thisWeek = $derived(sessions.filter((s) => weekStart(s.date) === thisMonday));
  const kcalWeek = $derived(thisWeek.reduce((sum, s) => sum + s.kcal, 0));
  const stretchWeek = $derived(
    Object.keys(data.progress.routines || {})
      .filter((day) => weekStart(day) === thisMonday)
      .reduce((sum, day) => sum + data.progress.routines[day].length, 0),
  );

  /* calories per week, the last 8 weeks */
  const weeks = $derived(
    Array.from({ length: CHART_WEEKS }, (_, k) => {
      const monday = addDays(thisMonday, -7 * (CHART_WEEKS - 1 - k));
      const date = parseYmd(monday);
      return {
        kcal: sessions.filter((s) => weekStart(s.date) === monday).reduce((a, s) => a + s.kcal, 0),
        label: `${date.getDate()}/${date.getMonth() + 1}`,
      };
    }),
  );

  /* best set per session, per exercise (most recently done first) */
  const perf = $derived.by(() => {
    const byId: Record<string, Array<{ date: string; best: number; ts: number }>> = {};
    sessions.forEach((s) =>
      s.items.forEach((i) => {
        if (EX[i.id] && EX[i.id].kind !== 'time') {
          (byId[i.id] ||= []).push({ date: s.date, best: Math.max(...i.sets), ts: s.ts });
        }
      }),
    );
    return byId;
  });
  const perfIds = $derived(
    Object.keys(perf).sort(
      (a, b) => perf[b][perf[b].length - 1].ts - perf[a][perf[a].length - 1].ts,
    ),
  );
  const shownId = $derived(
    ui.progEx && perfIds.includes(ui.progEx) ? ui.progEx : (perfIds[0] ?? null),
  );

  const units = $derived(data.profile.units);
  const body = $derived(data.body.slice().sort((a, b) => (a.date < b.date ? -1 : 1)));
  const weightPoints = $derived(
    body
      .filter((b) => b.weight)
      .map((b, i) => ({
        x: i,
        y: units === 'lb' ? b.weight! / KG_PER_LB : b.weight!,
        l: shortDay(b.date),
      })),
  );
  const waistPoints = $derived(
    body.filter((b) => b.waist).map((b, i) => ({ x: i, y: b.waist!, l: shortDay(b.date) })),
  );
  const oneDecimal = (v: number): number => Math.round(v * 10) / 10;

  function addEntry(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const fields = new FormData(form);
    let weight = parseFloat(String(fields.get('w')));
    const waist = parseFloat(String(fields.get('c')));
    if (!(weight > 0) && !(waist > 0)) {
      toast('Enter a weight or waist measurement.');
      return;
    }
    if (weight > 0 && units === 'lb') {
      weight = weight * KG_PER_LB;
    }
    const day = todayStr();
    let entry = data.body.find((b) => b.date === day);
    if (!entry) {
      data.body.push({ date: day } as BodyEntry);
      entry = data.body[data.body.length - 1];
    }
    if (weight > 0) {
      entry.weight = oneDecimal(weight);
      data.profile.weight = entry.weight;
      data.profile.weightSet = true;
      saveProfile(true);
    }
    if (waist > 0) {
      entry.waist = oneDecimal(waist);
    }
    saveBody();
    form.reset();
    toast('Saved.');
  }
</script>

<header class="hd">
  <h1>Progress</h1>
  <p class="sub">{sessions.length} session{sessions.length === 1 ? '' : 's'} logged</p>
</header>
<section class="stats">
  <div class="stat">
    <b>{thisWeek.length}<small>{` / ${data.profile.trainDays.length}`}</small></b><span
      >sessions this week</span
    >
  </div>
  <div class="stat"><b>{kcalWeek}</b><span>kcal this week (est.)</span></div>
  <div class="stat"><b>{stretchWeek}</b><span>stretch routines this week</span></div>
</section>
<section class="card">
  <h2>Exercise progress</h2>
  {#if shownId}
    {@const ex = EX[shownId]}
    <label class="sel"
      ><span class="sr">Exercise</span><select
        id="pe"
        value={shownId}
        onchange={(e) => (ui.progEx = e.currentTarget.value)}
      >
        {#each perfIds as id (id)}<option value={id}>{EX[id].name}</option>{/each}
      </select></label
    >
    {@html lineChart(
      perf[shownId].map((p, i) => ({ x: i, y: p.best, l: shortDay(p.date) })),
      { zero: true, label: ex.name + ' best set per session', fmt: (v) => Math.round(v) },
    )}
    <p class="fine">
      Best set per session, in {ex.kind === 'reps' ? 'reps' : 'seconds'}{ex.per ? ' per side' : ''}.
    </p>
  {:else}
    <p class="empty small">Finish a workout and your reps and hold times will chart here.</p>
  {/if}
</section>
<section class="card">
  <h2>Weekly calories</h2>
  {@html barChart(
    weeks.map((w) => w.kcal),
    weeks.map((w) => w.label),
    'Estimated calories per week',
  )}
  <p class="fine">
    Estimated from your weight, exercise intensity and time. Boxing is not included.
  </p>
</section>
<section class="card">
  <h2>Body check-in</h2>
  <form class="inline" onsubmit={addEntry}>
    <label
      ><span>Weight ({units})</span><input
        type="number"
        inputmode="decimal"
        step="0.1"
        min="20"
        max="400"
        name="w"
        placeholder={data.profile.weightSet ? String(shownWeight(data)) : ''}
      /></label
    >
    <label
      ><span>Waist (cm)</span><input
        type="number"
        inputmode="decimal"
        step="0.1"
        min="30"
        max="250"
        name="c"
        placeholder="optional"
      /></label
    >
    <button class="btn" type="submit">Add entry</button>
  </form>
  {#if weightPoints.length > 1}
    <h3 class="sm">Weight</h3>
    {@html lineChart(weightPoints, { label: 'Weight over time', fmt: oneDecimal })}
  {/if}
  {#if waistPoints.length > 1}
    <h3 class="sm">Waist</h3>
    {@html lineChart(waistPoints, { label: 'Waist over time', fmt: oneDecimal })}
  {/if}
  {#if body.length}
    <ul class="log">
      {#each body.slice(-4).reverse() as entry (entry.date)}
        <li>
          <span>{entry.date}</span><span
            >{entry.weight ? formatWeight(data, entry.weight) : ''}{entry.weight && entry.waist
              ? ' · '
              : ''}{entry.waist ? entry.waist + ' cm' : ''}</span
          >
        </li>
      {/each}
    </ul>
  {:else}
    <p class="fine">
      Log weekly, same time of day, to see the trend. One day of data means little.
    </p>
  {/if}
</section>
<section class="card">
  <h2>Level-ups</h2>
  {#if data.progress.levelups.length}
    <ul class="log">
      {#each data.progress.levelups.slice().reverse() as up, i (i)}
        <li>
          <span>{up.date}</span><span>{EX[up.from].name} to <b>{EX[up.to].name}</b></span>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="fine">
      Hit the goal on every set in two sessions in a row and the app suggests the next variation.
    </p>
  {/if}
</section>

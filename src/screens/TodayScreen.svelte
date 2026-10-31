<!--
  Today: the week strip, then today's session (its first exercise animated,
  the plan, Start), or a rest-day card, or "Session done" — and the day's
  stretch breaks underneath.
-->
<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import Legend from '../components/Legend.svelte';
  import PlanRow from '../components/PlanRow.svelte';
  import Stage from '../components/Stage.svelte';
  import StretchSection from '../components/StretchSection.svelte';
  import TemplateChips from '../components/TemplateChips.svelte';
  import ViewToggle from '../components/ViewToggle.svelte';
  import WeekStrip from '../components/WeekStrip.svelte';
  import Xid from '../components/Xid.svelte';
  import { DOW, minsTxt, now, todayParts, todayStr } from '../lib/dates';
  import { EX, musOf, TEMPLATES } from '../lib/motion/library';
  import { startWorkout } from '../lib/run.svelte';
  import {
    chooseTemplate,
    currentPlan,
    currentTemplate,
    data,
    go,
    setFormat,
    shuffleSession,
    ui,
  } from '../lib/state.svelte';
  import {
    dayKind,
    estimate,
    FORMATS,
    isWarmOrCool,
    nextTrainDay,
    weekInfo,
  } from '../lib/training';
  import type { Format } from '../lib/types';

  const FORMAT_KEYS = Object.keys(FORMATS) as Format[];

  const day = todayStr();
  const parts = todayParts();
  const week = $derived(weekInfo(data, day));
  const done = $derived(data.sessions.filter((s) => s.date === day));
  const kind = $derived(dayKind(data, now()));
  const next = $derived(nextTrainDay(data, Date.now(), DOW));
  const tpl = $derived(currentTemplate());
  const plan = $derived(currentPlan());
  const est = $derived(plan ? estimate(data, plan) : null);
  const first = $derived(
    plan ? (plan.items.find((i) => !isWarmOrCool(i.role)) ?? plan.items[0]) : null,
  );
</script>

<p class="brand">Crusader</p>
<header class="hd">
  <h1>{parts.weekday}</h1>
  <p class="sub">{parts.date} {parts.month} · Week {week.week}, {week.phase.toLowerCase()}</p>
</header>
<WeekStrip />

{#if done.length && !ui.tplOverride}
  {@const last = done[done.length - 1]}
  <section class="card done">
    <div class="tick"><Icon name="check" /></div>
    <h2>Session done</h2>
    <p>
      {TEMPLATES[last.tpl].name} · {Math.round(last.duration / 60)} min · about {last.kcal} kcal.
    </p>
    <p class="muted">Rest up. {next ? 'Next session: ' + next + '.' : ''}</p>
    <button class="btn ghost" onclick={() => (ui.showTpl = !ui.showTpl)}>Do another session</button
    >{#if ui.showTpl}<TemplateChips current={null} />{/if}
  </section>
{:else if !tpl || !plan || !est || !first}
  <section class="card rest">
    <h2>{kind === 'box' ? 'Boxing day' : 'Rest day'}</h2>
    <p>
      {kind === 'box'
        ? 'Your legs and shoulders are already working today, so strength training waits.'
        : 'Recovery is when your muscles rebuild. Walk, eat well and sleep.'}
      {next ? `Next session: ${next}.` : ''}
    </p>
    <button class="btn" onclick={() => chooseTemplate('mobility')}
      >Start a 7-minute mobility reset</button
    >
    <button class="link" onclick={() => (ui.showTpl = !ui.showTpl)}>Train anyway</button>
  </section>
  {#if ui.showTpl}<TemplateChips current={null} />{/if}
{:else}
  {@const fx = EX[first.id]}
  <section class="stage-card">
    <Stage id={first.id} primary={ui.sheet?.type !== 'ex'} />
    <div class="stage-cap">
      <b>{fx.name}<Xid n={fx.n} /></b><ViewToggle id={first.id} /><Legend mus={musOf(fx)} />
    </div>
  </section>
  <section class="plan">
    <div class="plan-hd">
      <h2>{TEMPLATES[tpl].name}</h2>
      <button class="link" onclick={() => (ui.showTpl = !ui.showTpl)}>Change session</button>
    </div>
    {#if ui.showTpl}<TemplateChips current={tpl} />{/if}
    <p class="meta">
      {minsTxt(est.sec)} · about {est.kcal} kcal · {plan.items.filter((i) => !isWarmOrCool(i.role))
        .length} exercises
    </p>
    {#if plan.light}<p class="fine lightnote">
        Boxing later today, so this morning session is lighter: two sets each.
      </p>{/if}
    <div class="chips" role="group" aria-label="Format">
      {#each FORMAT_KEYS as format (format)}
        <button
          class="chip"
          class:on={plan.format === format}
          disabled={tpl === 'mobility'}
          onclick={() => setFormat(format)}>{FORMATS[format]}</button
        >
      {/each}<button class="chip shuf" onclick={shuffleSession}
        ><Icon name="shuffle" small /> Shuffle session</button
      >
    </div>
    <ol class="list">
      {#each plan.items as item, index (index + ':' + item.id)}
        <PlanRow {item} {index} />
      {/each}
    </ol>
    {#if data.profile.weightSet}
      <p class="fine">
        Calories are estimates based on your weight and intensity, accurate to roughly ±30%.
      </p>
    {:else}
      <p class="fine">
        Calories use 70 kg until you <button class="link inline" onclick={() => go('me')}
          >enter your weight</button
        >. They are estimates, accurate to roughly ±30%.
      </p>
    {/if}
    <button class="btn big" onclick={startWorkout}>Start workout</button>
  </section>
{/if}
<StretchSection />

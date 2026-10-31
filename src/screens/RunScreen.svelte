<!--
  The workout (or stretch routine) runner: one step at a time — the
  animation, the target, a timer or a reps stepper — and rests in between.
  Everything, including the buttons, fits one phone screen.
-->
<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import Legend from '../components/Legend.svelte';
  import PhaseCaption from '../components/PhaseCaption.svelte';
  import Stage from '../components/Stage.svelte';
  import ViewToggle from '../components/ViewToggle.svelte';
  import Xid from '../components/Xid.svelte';
  import type { Playing } from '../lib/anim';
  import { mmss } from '../lib/dates';
  import { EX, musOf, type Exercise } from '../lib/motion/library';
  import {
    askQuit,
    begin,
    changeValue,
    clock,
    currentStep,
    holdDone,
    logReps,
    moreRest,
    runner,
    skipRest,
    skipStep,
    startNow,
    timerView,
    togglePause,
    type Run,
  } from '../lib/run.svelte';

  const { run }: { run: Run } = $props();

  let main = $state.raw<Playing | null>(null);
  const step = $derived(currentStep(run));
  const ex = $derived(EX[step.id]);
  const timer = $derived(timerView(run, clock.now));
  const total = $derived(run.steps.length);
  const resting = $derived(run.phase === 'rest' || run.phase === 'blockrest');
  const next = $derived(run.steps[run.i + 1]);

  const amountText = (e: Exercise, amount: number): string =>
    `${amount} ${e.kind === 'reps' ? 'reps' : 'sec'}${e.per ? ' each side' : ''}`;

  const label = $derived(
    step.k === 'time'
      ? step.label + (step.side ? ' · ' + step.side : '')
      : `Set ${step.n} of ${step.of}`,
  );
</script>

<div class="run-top">
  <button class="ib" aria-label="End workout" onclick={askQuit}><Icon name="close" /></button>
  <div class="prog"><i style="width:{(run.i / total) * 100}%"></i></div>
  <span class="muted">{run.i + 1}/{total}</span>
</div>

{#if resting}
  {@const nex = next ? EX[next.id] : null}
  <div class="run rest-v">
    <p class="kicker">{run.phase === 'blockrest' ? 'Rest until the next minute' : 'Rest'}</p>
    <div class="big">{timer?.text}</div>
    <div class="bar"><i style="width:{timer?.pct ?? 0}%"></i></div>
    {#if next && nex}
      <div class="next">
        <Stage id={next.id} size="xs" />
        <div>
          <span class="muted">Next</span><b>{nex.name}</b><span
            >{next.k === 'time' ? next.secs + ' sec' : amountText(nex, next.amount)}</span
          >
        </div>
      </div>
    {/if}
    <div class="btns">
      <button class="btn" onclick={skipRest}
        >{run.phase === 'rest' ? 'Skip rest' : 'Next now'}</button
      >{#if run.phase === 'rest'}<button class="btn ghost" onclick={togglePause}
          >{run.paused ? 'Resume' : 'Pause'}</button
        ><button class="btn ghost" onclick={moreRest}>+15 sec</button>{/if}
    </div>
  </div>
{:else}
  <div class="run">
    <p class="kicker">
      {label}<Xid n={ex.n} />{step.k === 'set' && step.round
        ? ` · round ${step.round} of ${step.rounds}`
        : ''}{step.k === 'set' && step.emom ? ' · every minute' : ''}
    </p>
    <h2>{ex.name}</h2>
    <Stage id={step.id} primary onmain={(m) => (main = m)} /><ViewToggle
      id={step.id}
    /><PhaseCaption id={step.id} {main} />
    <Legend mus={musOf(ex)} />
    <p class="cue">{ex.cue}</p>
    {#if run.routine}
      {#if run.phase === 'prep'}
        <p class="muted">Get into position</p>
        <div class="big dim">{timer?.text}</div>
        <div class="bar"><i style="width:{timer?.pct ?? 0}%"></i></div>
        <div class="btns c">
          <button class="btn" onclick={startNow}>Start now</button><button
            class="btn ghost"
            onclick={togglePause}>{run.paused ? 'Resume' : 'Pause'}</button
          ><button class="btn ghost" onclick={skipStep}>Skip</button>
        </div>
      {:else}
        <div class="big">{timer?.text ?? (step.k === 'time' ? mmss(step.secs) : '')}</div>
        <div class="bar"><i style="width:{timer?.pct ?? 0}%"></i></div>
        <div class="btns c">
          <button class="btn" onclick={togglePause}>{run.paused ? 'Resume' : 'Pause'}</button
          ><button class="btn ghost" onclick={skipStep}>Next</button>
        </div>
      {/if}
      {#if next}
        <p class="muted up">
          Next: {EX[next.id].name}{next.k === 'time' && next.side ? ' · ' + next.side : ''}
        </p>
      {/if}
    {:else if step.k === 'time'}
      {#if run.phase === 'work'}
        <div class="big">{timer?.text}</div>
        <div class="bar"><i style="width:{timer?.pct ?? 0}%"></i></div>
        <div class="btns c">
          <button class="btn" onclick={togglePause}>{run.paused ? 'Resume' : 'Pause'}</button
          ><button class="btn ghost" onclick={skipStep}>Skip</button>
        </div>
      {:else}
        <div class="big dim">{mmss(step.secs)}</div>
        <button class="btn big" onclick={begin}>Start timer</button>
        <button class="link" onclick={skipStep}>Skip</button>
      {/if}
    {:else if ex.kind === 'hold'}
      {#if run.phase === 'work'}
        <div class="big">{timer?.text}</div>
        <div class="bar"><i style="width:{timer?.pct ?? 0}%"></i></div>
        <p class="muted">Target {step.amount} sec{ex.per ? ' each side' : ''}</p>
        <button class="btn big" onclick={holdDone}>Done</button>
      {:else}
        <p class="target">Hold {step.amount} sec{ex.per ? ' each side' : ''}</p>
        <button class="btn big" onclick={begin}>Start hold</button>
        {@render stepper('seconds')}
      {/if}
    {:else}
      {#if step.block}
        <div class="big sm">{timer?.text}</div>
        <div class="bar"><i style="width:{timer?.pct ?? 0}%"></i></div>
      {/if}
      <p class="target">{amountText(ex, step.amount)}</p>
      {@render stepper('reps done')}
      <button class="btn big" onclick={logReps}>Log set</button>
    {/if}
    {#if step.k === 'set'}
      <button class="link" onclick={skipStep}>Skip this set</button>
    {/if}
  </div>
{/if}

{#snippet stepper(unit: string)}
  <div class="stepper">
    <button class="ib lg" aria-label="One less" onclick={() => changeValue(-1)}>−</button><output
      >{runner.run?.val}</output
    ><button class="ib lg" aria-label="One more" onclick={() => changeValue(1)}>+</button><span
      class="muted">{unit}</span
    >
  </div>
{/snippet}

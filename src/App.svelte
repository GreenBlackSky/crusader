<!--
  Crusader: the runner or the summary when one is on, otherwise one of
  four tabs (Today, Exercises, Progress, Profile) with the tab bar; sheets
  (an exercise, set-up, "end this workout?") slide up over everything.
-->
<script lang="ts">
  import ExerciseSheet from './components/ExerciseSheet.svelte';
  import Icon from './components/Icon.svelte';
  import OnboardSheet from './components/OnboardSheet.svelte';
  import QuitSheet from './components/QuitSheet.svelte';
  import type { IconName } from './lib/icons';
  import { runner } from './lib/run.svelte';
  import { closeSheet, data, go, ui, type Tab } from './lib/state.svelte';
  import { toastState } from './lib/ui/toast.svelte';
  import LibraryScreen from './screens/LibraryScreen.svelte';
  import ProfileScreen from './screens/ProfileScreen.svelte';
  import ProgressScreen from './screens/ProgressScreen.svelte';
  import RunScreen from './screens/RunScreen.svelte';
  import SummaryScreen from './screens/SummaryScreen.svelte';
  import TodayScreen from './screens/TodayScreen.svelte';

  const TABS: Array<{ id: Tab; label: string; icon: IconName }> = [
    { id: 'today', label: 'Today', icon: 'today' },
    { id: 'lib', label: 'Exercises', icon: 'lib' },
    { id: 'prog', label: 'Progress', icon: 'prog' },
    { id: 'me', label: 'Profile', icon: 'me' },
  ];

  const sheetOpen = $derived(data.fresh || ui.sheet !== null);
  let sheetEl = $state<HTMLDivElement>();

  /* another exercise opened in the sheet: start it at the top */
  $effect(() => {
    void (ui.sheet?.type === 'ex' && ui.sheet.id);
    sheetEl?.scrollTo(0, 0);
  });

  function onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && ui.sheet) {
      closeSheet();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

{#if !data.loaded}
  <p class="loading">Loading…</p>
{:else}
  <main class="screen">
    {#if runner.run}<RunScreen run={runner.run} />
    {:else if ui.summary}<SummaryScreen summary={ui.summary} />
    {:else if ui.tab === 'lib'}<LibraryScreen />
    {:else if ui.tab === 'prog'}<ProgressScreen />
    {:else if ui.tab === 'me'}<ProfileScreen />
    {:else}<TodayScreen />
    {/if}
  </main>
  {#if !runner.run && !ui.summary}
    <nav class="tabs" aria-label="Main">
      {#each TABS as tab (tab.id)}
        <button
          class="tab"
          class:on={ui.tab === tab.id}
          data-tab={tab.id}
          aria-current={ui.tab === tab.id ? 'page' : undefined}
          onclick={() => go(tab.id)}><Icon name={tab.icon} /><span>{tab.label}</span></button
        >
      {/each}
    </nav>
  {/if}
  {#if sheetOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (Escape closes it too) -->
    <div class="scrim" onclick={data.fresh ? undefined : closeSheet}></div>
    <div bind:this={sheetEl} class="sheet" role="dialog" aria-modal="true">
      {#if data.fresh}<OnboardSheet />
      {:else if ui.sheet?.type === 'ex'}{#key ui.sheet.id}<ExerciseSheet id={ui.sheet.id} />{/key}
      {:else if ui.sheet?.type === 'quit'}<QuitSheet />
      {/if}
    </div>
  {/if}
{/if}
<div id="toast" role="status" class:on={toastState.visible}>{toastState.message}</div>

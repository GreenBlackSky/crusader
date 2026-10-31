<!--
  Profile: weight, schedule (training and boxing days), session length,
  equipment, 3D or 2D animations, starting level, and the data card.
-->
<script lang="ts">
  import DataCard from '../components/DataCard.svelte';
  import { DOWS } from '../lib/dates';
  import { EQUIP } from '../lib/motion/library';
  import { A3 } from '../lib/motion/mannequin3d';
  import { data, resetLevels, saveProfile } from '../lib/state.svelte';
  import { KG_PER_LB, shownWeight } from '../lib/training';
  import type { Units } from '../lib/types';
  import { toast } from '../lib/ui/toast.svelte';

  /** Monday first. */
  const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const LENGTHS = [15, 20, 25];
  const LEVELS: Array<[number, string]> = [
    [0, 'Beginner'],
    [0.4, 'Some experience'],
    [0.7, 'Strong'],
  ];

  const profile = $derived(data.profile);
  const units = $derived(profile.units);

  function toggleDay(key: 'trainDays' | 'boxDays', dow: number): void {
    const list = profile[key];
    const i = list.indexOf(dow);
    if (i >= 0) {
      list.splice(i, 1);
    } else {
      list.push(dow);
    }
    saveProfile();
  }

  function setWeight(event: Event): void {
    let value = parseFloat((event.currentTarget as HTMLInputElement).value);
    if (!(value > 0)) {
      return;
    }
    if (units === 'lb') {
      value = value * KG_PER_LB;
    }
    if (value >= 20 && value <= 400) {
      profile.weight = Math.round(value * 10) / 10;
      profile.weightSet = true;
      saveProfile(true);
      toast('Weight saved.');
    }
  }

  function setUnits(value: Units): void {
    profile.units = value;
    saveProfile();
  }

  function setEquipment(key: string, owned: boolean): void {
    profile.equip[key] = owned;
    saveProfile();
    toast('Equipment updated.');
  }
</script>

<header class="hd">
  <h1>Profile</h1>
  <p class="sub">Saved on this device only.</p>
</header>
<section class="card">
  <h2>You</h2>
  <div class="fld">
    <label for="wt">Body weight ({units})</label><input
      id="wt"
      type="number"
      inputmode="decimal"
      step="0.1"
      min="20"
      max="400"
      value={profile.weightSet ? shownWeight(data) : ''}
      placeholder={String(shownWeight(data))}
      onchange={setWeight}
    />
  </div>
  <div class="seg" role="group" aria-label="Units">
    <button class:on={units === 'kg'} onclick={() => setUnits('kg')}>kg</button><button
      class:on={units === 'lb'}
      onclick={() => setUnits('lb')}>lb</button
    >
  </div>
  <p class="fine">Used only to estimate calories.</p>
</section>
<section class="card">
  <h2>Schedule</h2>
  <p class="lbl">Calisthenics days</p>
  {@render days('trainDays', 'Calisthenics days')}
  <p class="lbl">Boxing days</p>
  {@render days('boxDays', 'Boxing days')}
  <p class="fine">A day can be both: train in the morning, box later.</p>
  <label class="switch"
    ><input
      type="checkbox"
      id="lb"
      checked={profile.lightBox !== false}
      onchange={(e) => {
        profile.lightBox = e.currentTarget.checked;
        saveProfile();
      }}
    /><span
      >Lighter session on boxing days<small
        >Two sets each, about 15 minutes, so you arrive at boxing fresh.</small
      ></span
    ></label
  >
  <p class="lbl">Session length</p>
  <div class="chips">
    {#each LENGTHS as minutes (minutes)}
      <button
        class="chip"
        class:on={profile.minutes === minutes}
        onclick={() => {
          profile.minutes = minutes;
          saveProfile();
        }}>{minutes} min</button
      >
    {/each}
  </div>
  <label class="switch"
    ><input
      type="checkbox"
      id="dl"
      checked={profile.deload}
      onchange={(e) => {
        profile.deload = e.currentTarget.checked;
        saveProfile();
      }}
    /><span>Lighter week every 4th week</span></label
  >
  <p class="fine">
    A deload week trims sets and reps by about a quarter. It helps recovery on top of boxing.
  </p>
</section>
<section class="card">
  <h2>Equipment</h2>
  <p class="fine">
    Exercises that need something you don't have are hidden from workouts and shown as locked.
  </p>
  <ul class="eq">
    {#each EQUIP as item (item.k)}
      <li>
        <label class="switch"
          ><input
            type="checkbox"
            checked={!!profile.equip[item.k]}
            onchange={(e) => setEquipment(item.k, e.currentTarget.checked)}
          /><span><b>{item.label}</b><small>{item.hint}</small></span></label
        >
      </li>
    {/each}
  </ul>
</section>
<section class="card">
  <h2>Animations</h2>
  <div class="seg" role="group" aria-label="Animation style">
    <button
      class:on={profile.mode !== '2d'}
      onclick={() => {
        profile.mode = '3d';
        saveProfile(true);
      }}>3D</button
    ><button
      class:on={profile.mode === '2d'}
      onclick={() => {
        profile.mode = '2d';
        saveProfile(true);
      }}>2D</button
    >
  </div>
  <p class="fine">
    {A3.ok
      ? '3D lets you turn the figure around: drag it sideways, or pick Side, Front or Top. Switch to 2D if it runs slowly on your device.'
      : "3D isn't available on this device, so the 2D animations are used."}
  </p>
</section>
<section class="card">
  <h2>Starting level</h2>
  <p class="fine">Resets where each progression begins. Your history stays.</p>
  <div class="chips">
    {#each LEVELS as [fraction, label] (fraction)}
      <button class="chip" onclick={() => resetLevels(fraction)}>{label}</button>
    {/each}
  </div>
</section>
<DataCard />

{#snippet days(key: 'trainDays' | 'boxDays', label: string)}
  <div class="days" role="group" aria-label={label}>
    {#each WEEK_ORDER as dow (dow)}
      <button
        class="chip"
        class:on={profile[key].includes(dow)}
        aria-pressed={profile[key].includes(dow)}
        onclick={() => toggleDay(key, dow)}>{DOWS[dow]}</button
      >
    {/each}
  </div>
{/snippet}

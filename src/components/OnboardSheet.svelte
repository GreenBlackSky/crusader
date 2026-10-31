<!-- First run: starting level, equipment and weight — then the plan is built. -->
<script lang="ts">
  import { EQUIP } from '../lib/motion/library';
  import { finishSetup, ui } from '../lib/state.svelte';

  const LEVELS: Array<[number, string]> = [
    [0, 'Beginner'],
    [0.4, 'Some experience'],
    [0.7, 'Strong'],
  ];

  let weight = $state('');
</script>

<div class="sheet-in onb">
  <h2>Set up your plan</h2>
  <p>Three quick choices. You can change all of it later in Profile.</p>
  <h3 class="sm">Where are you starting?</h3>
  <div class="chips">
    {#each LEVELS as [fraction, label] (fraction)}
      <button
        class="chip"
        class:on={ui.onb.frac === fraction}
        onclick={() => (ui.onb.frac = fraction)}>{label}</button
      >
    {/each}
  </div>
  <p class="fine">
    Beginner starts with wall and incline moves. "Some experience" starts around push-ups and table
    rows.
  </p>
  <h3 class="sm">What do you have at home?</h3>
  <ul class="eq">
    {#each EQUIP as item (item.k)}
      <li>
        <label class="switch"
          ><input type="checkbox" bind:checked={ui.onb.equip[item.k]} /><span
            ><b>{item.label}</b></span
          ></label
        >
      </li>
    {/each}
  </ul>
  <div class="fld">
    <label for="ow">Body weight (kg)</label><input
      id="ow"
      type="number"
      inputmode="decimal"
      step="0.1"
      min="20"
      max="300"
      placeholder="70"
      bind:value={weight}
    />
  </div>
  <button class="btn big" onclick={() => finishSetup(parseFloat(String(weight)))}
    >Build my plan</button
  >
</div>

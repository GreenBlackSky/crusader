<!-- "How to do it": start, move, finish, watch for. -->
<script lang="ts">
  import { DESC } from '../lib/motion/descriptions';

  const { id }: { id: string } = $props();
  const how = $derived(DESC[id]?.how);
</script>

{#if how}
  <section class="how">
    <h3>How to do it</h3>
    {#each how as [heading, text] (heading)}<p><b>{heading}</b>{text}</p>{/each}
  </section>
{/if}

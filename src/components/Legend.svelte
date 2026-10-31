<!-- Which muscles the animation colours: working, supporting, stretching. -->
<script lang="ts">
  import type { Muscles } from '../lib/motion/engine';
  import { MUSCLE_LABEL } from '../lib/motion/library';

  const { mus }: { mus: Muscles } = $props();

  /** Readable names, each once ("traps" and "upper back" are the same label). */
  const names = (list: string[] | undefined): string =>
    (list ?? [])
      .map((m) => MUSCLE_LABEL[m] || m)
      .filter((v, i, all) => all.indexOf(v) === i)
      .join(', ');

  const rows = $derived(
    [
      { k: 'p', label: 'Working', list: mus.p },
      { k: 's', label: 'Supporting', list: mus.s },
      { k: 'st', label: 'Stretching', list: mus.st },
    ].filter((row) => row.list && row.list.length),
  );
</script>

<ul class="legend">
  {#each rows as row (row.k)}
    <li><i class="dot {row.k}"></i><span><b>{row.label}</b> {names(row.list)}</span></li>
  {/each}
</ul>

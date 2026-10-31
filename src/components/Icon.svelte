<!-- One of the app's line icons; `small` for the 14 px inline size. -->
<script lang="ts">
  import { ICON, type IconName } from '../lib/icons';

  const { name, small = false }: { name: IconName; small?: boolean } = $props();
</script>

<svg class="ic" class:sm={small} viewBox="0 0 24 24" aria-hidden="true">{@html ICON[name]}</svg>

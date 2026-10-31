<!-- An exercise's reference number, "#12" — it never changes, so it can be quoted. -->
<script lang="ts">
  const { n }: { n: number } = $props();
</script>

<small class="xid" aria-label="Exercise number {n}">#{n}</small>

<!--
  Data: everything is saved in this browser only (until Firebase is set up),
  so this is where a backup file is saved and restored — the backup exported
  from the original claude.ai app restores here too — and where everything
  can be deleted (two taps).
-->
<script lang="ts">
  import { APP_ID, db, type Backup } from '../lib/db';
  import { countDocs, downloadBackup, readBackupFile } from '../lib/db/backup';
  import { deleteEverything } from '../lib/state.svelte';
  import { toast } from '../lib/ui/toast.svelte';

  const ARM_MS = 3500;

  let fileInput: HTMLInputElement;
  /** a backup read from a file, waiting for "Replace" */
  let pending = $state<Backup | null>(null);
  /** "Delete all my data" was tapped once */
  let armed = $state(false);
  let armTimer: ReturnType<typeof setTimeout> | undefined;

  async function choose(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    try {
      pending = await readBackupFile(file, APP_ID);
    } catch (e) {
      toast((e as Error).message);
    }
  }

  function replace(): void {
    if (pending) {
      db.importAll(pending);
      pending = null;
      toast('Backup restored.');
    }
  }

  function deleteAll(): void {
    clearTimeout(armTimer);
    if (!armed) {
      armed = true;
      armTimer = setTimeout(() => (armed = false), ARM_MS);
      return;
    }
    armed = false;
    void deleteEverything();
  }
</script>

<section class="card">
  <h2>Data</h2>
  <p class="fine">
    Your profile, progress and workouts are saved in this browser only. Save a backup now and then —
    and before clearing browser data.
  </p>
  {#if pending}
    <p class="note" data-confirm>
      Replace everything on this device with the backup from {new Date(
        pending.exportedAt,
      ).toLocaleString()} ({countDocs(pending)} items)?
    </p>
    <div class="btns">
      <button class="btn danger ghost" data-replace onclick={replace}>Replace</button>
      <button class="btn ghost" onclick={() => (pending = null)}>Cancel</button>
    </div>
  {:else}
    <div class="btns">
      <button class="btn ghost" data-export onclick={() => downloadBackup(db, APP_ID)}
        >Save backup</button
      >
      <button class="btn ghost" data-import onclick={() => fileInput.click()}
        >Restore backup…</button
      >
      <button class="btn ghost danger" data-reset onclick={deleteAll}
        >{armed ? 'Tap again to delete everything' : 'Delete all my data'}</button
      >
    </div>
  {/if}
  <input
    bind:this={fileInput}
    type="file"
    accept="application/json,.json"
    hidden
    onchange={choose}
  />
</section>

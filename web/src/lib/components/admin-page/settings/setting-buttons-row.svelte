<script lang="ts">
  import Button from '$lib/components/elements/buttons/button.svelte';
  import type { ResetOptions } from '$lib/utils/dipatch';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    reset: ResetOptions;
    save: void;
  }>();

  export let showResetToDefault = true;
  export let disabled = false;
</script>

<div class="mt-8 flex justify-between gap-2">
  <div class="left">
    {#if showResetToDefault}
      <button
        on:click={() => dispatch('reset', { default: true })}
        class="bg-none text-sm font-medium text-immich-primary hover:text-immich-primary/75 dark:text-immich-dark-primary hover:dark:text-immich-dark-primary/75"
      >
        恢复为默认设置
      </button>
    {/if}
  </div>

  <div class="right">
    <Button {disabled} size="sm" color="gray" on:click={() => dispatch('reset', { default: false })}>重置</Button>
    <Button {disabled} size="sm" on:click={() => dispatch('save')}>保存</Button>
  </div>
</div>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { copyToClipboard } from '@api';
  import Button from '../elements/buttons/button.svelte';
  import FullScreenModal from '../shared-components/full-screen-modal.svelte';
  import { mdiKeyVariant } from '@mdi/js';
  import Icon from '$lib/components/elements/icon.svelte';

  export let secret = '';

  const dispatch = createEventDispatcher<{
    done: void;
  }>();
  const handleDone = () => dispatch('done');
  let canCopyImagesToClipboard = true;

  onMount(async () => {
    const module = await import('copy-image-clipboard');
    canCopyImagesToClipboard = module.canCopyImagesToClipboard();
  });
</script>

<FullScreenModal>
  <div
    class="w-[500px] max-w-[95vw] rounded-3xl border bg-immich-bg p-4 py-8 shadow-sm dark:border-immich-dark-gray dark:bg-immich-dark-gray dark:text-immich-dark-fg"
  >
    <div
      class="flex flex-col place-content-center place-items-center gap-4 px-4 text-immich-primary dark:text-immich-dark-primary"
    >
      <Icon path={mdiKeyVariant} size="4em" />
      <h1 class="text-2xl font-medium text-immich-primary dark:text-immich-dark-primary">API Key</h1>

      <p class="text-sm dark:text-immich-dark-fg">
        此值仅会显示一次，请确保在关闭窗口之前将其复制。
      </p>
    </div>

    <div class="m-4 flex flex-col gap-2">
      <!-- <label class="immich-form-label" for="secret">API Key</label> -->
      <textarea class="immich-form-input" id="secret" name="secret" readonly={true} value={secret} />
    </div>

    <div class="mt-8 flex w-full gap-4 px-4">
      {#if canCopyImagesToClipboard}
        <Button on:click={() => copyToClipboard(secret)} fullwidth>复制到剪贴板</Button>
      {/if}
      <Button on:click={() => handleDone()} fullwidth>完成</Button>
    </div>
  </div>
</FullScreenModal>

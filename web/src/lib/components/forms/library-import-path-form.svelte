<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/components/elements/icon.svelte';
  import Button from '../elements/buttons/button.svelte';
  import FullScreenModal from '../shared-components/full-screen-modal.svelte';
  import { mdiFolderSync } from '@mdi/js';

  export let importPath: string;
  export let title = 'Import path';
  export let cancelText = '取消';
  export let submitText = '保存';
  export let canDelete = false;

  const dispatch = createEventDispatcher<{
    cancel: void;
    submit: { importPath: string };
    delete: void;
  }>();
  const handleCancel = () => dispatch('cancel');
  const handleSubmit = () => dispatch('submit', { importPath });
</script>

<FullScreenModal on:clickOutside={() => handleCancel()}>
  <div
    class="w-[500px] max-w-[95vw] rounded-3xl border bg-immich-bg p-4 py-8 shadow-sm dark:border-immich-dark-gray dark:bg-immich-dark-gray dark:text-immich-dark-fg"
  >
    <div
      class="flex flex-col place-content-center place-items-center gap-4 px-4 text-immich-primary dark:text-immich-dark-primary"
    >
      <Icon path={mdiFolderSync} size="4em" />
      <h1 class="text-2xl font-medium text-immich-primary dark:text-immich-dark-primary">
        {title}
      </h1>
    </div>

    <form on:submit|preventDefault={() => handleSubmit()} autocomplete="off">
      <p class="p-5 text-sm">
        请指定要导入的文件夹。该文件夹及其子文件夹将被扫描以查找图片和视频。请注意，您只能导入位于您的帐户的外部路径内的路径，这些路径可以在管理设置中进行配置。
      </p>

      <div class="m-4 flex flex-col gap-2">
        <label class="immich-form-label" for="path">路径</label>
        <input class="immich-form-input" id="path" name="path" type="text" bind:value={importPath} />
      </div>

      <div class="mt-8 flex w-full gap-4 px-4">
        <Button color="gray" fullwidth on:click={() => handleCancel()}>{cancelText}</Button>
        {#if canDelete}
          <Button color="red" fullwidth on:click={() => dispatch('delete')}>删除</Button>
        {/if}

        <Button type="submit" fullwidth>{submitText}</Button>
      </div>
    </form>
  </div>
</FullScreenModal>

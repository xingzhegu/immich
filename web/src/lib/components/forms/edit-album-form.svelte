<script lang="ts">
  import { AlbumResponseDto, api } from '@api';
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/components/elements/icon.svelte';
  import Button from '../elements/buttons/button.svelte';
  import { handleError } from '../../utils/handle-error';
  import { mdiImageAlbum } from '@mdi/js';

  export let album: AlbumResponseDto;

  const dispatch = createEventDispatcher<{
    editSuccess: void;
    cancel: void;
  }>();

  const editUser = async () => {
    try {
      const { status } = await api.albumApi.updateAlbumInfo({
        id: album.id,
        updateAlbumDto: {
          albumName: album.albumName,
          description: album.description,
        },
      });

      if (status === 200) {
        dispatch('editSuccess');
      }
    } catch (error) {
      handleError(error, '无法更新用户');
    }
  };
</script>

<div
  class="max-h-screen w-[500px] max-w-[95vw] overflow-y-auto rounded-3xl border bg-immich-bg p-4 py-8 shadow-sm dark:border-immich-dark-gray dark:bg-immich-dark-gray dark:text-immich-dark-fg"
>
  <div
    class="flex flex-col place-content-center place-items-center gap-4 px-4 text-immich-primary dark:text-immich-dark-primary"
  >
    <Icon path={mdiImageAlbum} size="4em" />
    <h1 class="text-2xl font-medium text-immich-primary dark:text-immich-dark-primary">编辑相册</h1>
  </div>

  <form on:submit|preventDefault={editUser} autocomplete="off">
    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="name">名称</label>
      <input class="immich-form-input" id="name" type="text" bind:value={album.albumName} />
    </div>

    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="description">描述</label>
      <textarea class="immich-form-input" id="description" bind:value={album.description} />
    </div>

    <div class="mt-8 flex w-full gap-4 px-4">
      <Button color="gray" fullwidth on:click={() => dispatch('cancel')}>取消</Button>
      <Button type="submit" fullwidth>确认</Button>
    </div>
  </form>
</div>

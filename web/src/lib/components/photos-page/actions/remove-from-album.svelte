<script lang="ts">
  import CircleIconButton from '$lib/components/elements/buttons/circle-icon-button.svelte';
  import ConfirmDialogue from '$lib/components/shared-components/confirm-dialogue.svelte';
  import {
    NotificationType,
    notificationController,
  } from '$lib/components/shared-components/notification/notification';
  import { AlbumResponseDto, api } from '@api';
  import MenuOption from '../../shared-components/context-menu/menu-option.svelte';
  import { getAssetControlContext } from '../asset-select-control-bar.svelte';
  import { mdiDeleteOutline } from '@mdi/js';

  export let album: AlbumResponseDto;
  export let onRemove: ((assetIds: string[]) => void) | undefined = undefined;
  export let menuItem = false;

  const { getAssets, clearSelect } = getAssetControlContext();

  let isShowConfirmation = false;

  const removeFromAlbum = async () => {
    try {
      const ids = Array.from(getAssets()).map((a) => a.id);
      const { data: results } = await api.albumApi.removeAssetFromAlbum({
        id: album.id,
        bulkIdsDto: { ids },
      });

      const { data } = await api.albumApi.getAlbumInfo({ id: album.id });
      album = data;

      onRemove?.(ids);

      const count = results.filter(({ success }) => success).length;
      notificationController.show({
        type: NotificationType.Info,
        message: `已删除${count}个资源`,
      });

      clearSelect();
    } catch (e) {
      console.error('Error [album-viewer] [removeAssetFromAlbum]', e);
      notificationController.show({
        type: NotificationType.Error,
        message: '从相册中移除资产时出错，请检查控制台获取更多详细信息',
      });
    } finally {
      isShowConfirmation = false;
    }
  };
</script>

{#if menuItem}
  <MenuOption text="从相册中移除" on:click={() => (isShowConfirmation = true)} />
{:else}
  <CircleIconButton title="从相册中移除" icon={mdiDeleteOutline} on:click={() => (isShowConfirmation = true)} />
{/if}

{#if isShowConfirmation}
  <ConfirmDialogue
    title="从{album.albumName}相册中移除"
    confirmText="删除"
    on:confirm={removeFromAlbum}
    on:cancel={() => (isShowConfirmation = false)}
  >
    <svelte:fragment slot="prompt">
      <p>
        确认删除
        {#if getAssets().size > 1}
          <b>{getAssets().size}</b>个资源
        {:else}
          这个资源
        {/if}
        从相册中？
      </p>
    </svelte:fragment>
  </ConfirmDialogue>
{/if}

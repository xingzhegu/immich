<script lang="ts">
  import CircleIconButton from '$lib/components/elements/buttons/circle-icon-button.svelte';
  import ConfirmDialogue from '$lib/components/shared-components/confirm-dialogue.svelte';
  import {
    NotificationType,
    notificationController,
  } from '$lib/components/shared-components/notification/notification';
  import { handleError } from '$lib/utils/handle-error';
  import { api } from '@api';
  import MenuOption from '../../shared-components/context-menu/menu-option.svelte';
  import { OnAssetDelete, getAssetControlContext } from '../asset-select-control-bar.svelte';
  import { createEventDispatcher } from 'svelte';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { mdiTimerSand, mdiDeleteOutline } from '@mdi/js';

  export let onAssetDelete: OnAssetDelete;
  export let menuItem = false;
  export let force = !$featureFlags.trash;

  const { clearSelect, getOwnedAssets } = getAssetControlContext();

  const dispatch = createEventDispatcher<{
    escape: void;
  }>();

  let isShowConfirmation = false;
  let loading = false;

  const handleTrash = async () => {
    if (force) {
      isShowConfirmation = true;
      return;
    }

    await handleDelete();
  };

  const handleDelete = async () => {
    loading = true;

    try {
      const ids = Array.from(getOwnedAssets())
        .filter((a) => !a.isExternal)
        .map((a) => a.id);
      await api.assetApi.deleteAssets({ assetBulkDeleteDto: { ids, force } });
      for (const id of ids) {
        onAssetDelete(id);
      }

      notificationController.show({
        message: `${force ? '永久删除' : '回收'} ${ids.length}个资源`,
        type: NotificationType.Info,
      });

      clearSelect();
    } catch (e) {
      handleError(e, 'Error deleting assets');
    } finally {
      isShowConfirmation = false;
      loading = false;
    }
  };

  const escape = () => {
    dispatch('escape');
    isShowConfirmation = false;
  };
</script>

{#if menuItem}
  <MenuOption text={force ? '永久删除' : '删除'} on:click={handleTrash} />
{:else if loading}
  <CircleIconButton title="载入中" icon={mdiTimerSand} />
{:else}
  <CircleIconButton title="删除" icon={mdiDeleteOutline} on:click={handleTrash} />
{/if}

{#if isShowConfirmation}
  <ConfirmDialogue
    title="永久删除资源{getOwnedAssets().size > 1 ? '' : ''}"
    confirmText="删除"
    on:confirm={handleDelete}
    on:cancel={() => (isShowConfirmation = false)}
    on:escape={escape}
  >
    <svelte:fragment slot="prompt">
      <p>
        Are you sure you want to permanently delete
        {#if getOwnedAssets().size > 1}
          these <b>{getOwnedAssets().size}</b> assets? This will also remove them from their album(s).
        {:else}
          this asset? This will also remove it from its album(s).
        {/if}
      </p>
      <p><b>You cannot undo this action!</b></p>
    </svelte:fragment>
  </ConfirmDialogue>
{/if}

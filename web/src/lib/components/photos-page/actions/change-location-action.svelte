<script lang="ts">
  import { api } from '@api';
  import MenuOption from '../../shared-components/context-menu/menu-option.svelte';
  import { getAssetControlContext } from '../asset-select-control-bar.svelte';
  import ChangeLocation from '$lib/components/shared-components/change-location.svelte';
  import { handleError } from '../../../utils/handle-error';
  import { user } from '$lib/stores/user.store';
  import { getSelectedAssets } from '$lib/utils/asset-utils';

  export let menuItem = false;
  const { clearSelect, getOwnedAssets } = getAssetControlContext();

  let isShowChangeLocation = false;

  async function handleConfirm(point: { lng: number; lat: number }) {
    isShowChangeLocation = false;
    const ids = getSelectedAssets(getOwnedAssets(), $user);

    try {
      await api.assetApi.updateAssets({
        assetBulkUpdateDto: {
          ids,
          latitude: point.lat,
          longitude: point.lng,
        },
      });
    } catch (error) {
      handleError(error, '无法修改位置');
    }
    clearSelect();
  }
</script>

{#if menuItem}
  <MenuOption text="修改位置" on:click={() => (isShowChangeLocation = true)} />
{/if}
{#if isShowChangeLocation}
  <ChangeLocation
    on:confirm={({ detail: point }) => handleConfirm(point)}
    on:cancel={() => (isShowChangeLocation = false)}
  />
{/if}

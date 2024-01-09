<script lang="ts">
  import CircleIconButton from '$lib/components/elements/buttons/circle-icon-button.svelte';
  import { SharedLinkResponseDto, api } from '@api';
  import ConfirmDialogue from '../../shared-components/confirm-dialogue.svelte';
  import { getAssetControlContext } from '../asset-select-control-bar.svelte';
  import { NotificationType, notificationController } from '../../shared-components/notification/notification';
  import { handleError } from '../../../utils/handle-error';
  import { mdiDeleteOutline } from '@mdi/js';

  export let sharedLink: SharedLinkResponseDto;

  let removing = false;

  const { getAssets, clearSelect } = getAssetControlContext();

  const handleRemove = async () => {
    try {
      const { data: results } = await api.sharedLinkApi.removeSharedLinkAssets({
        id: sharedLink.id,
        assetIdsDto: {
          assetIds: Array.from(getAssets()).map((asset) => asset.id),
        },
        key: api.getKey(),
      });

      for (const result of results) {
        if (!result.success) {
          continue;
        }

        sharedLink.assets = sharedLink.assets.filter((asset) => asset.id !== result.assetId);
      }

      const count = results.filter((item) => item.success).length;

      notificationController.show({
        type: NotificationType.Info,
        message: `已删除${count}个资源`,
      });

      clearSelect();
    } catch (error) {
      handleError(error, '无法从分享链接中删除资源');
    }
  };
</script>

<CircleIconButton title="从分享链接中移除" on:click={() => (removing = true)} icon={mdiDeleteOutline} />

{#if removing}
  <ConfirmDialogue
    title="删除资源"
    prompt="您确定要从此分享链接中移除{getAssets().size}个资源吗？"
    confirmText="删除"
    on:confirm={() => handleRemove()}
    on:cancel={() => (removing = false)}
  />
{/if}

<script lang="ts">
  import { page } from '$app/stores';
  import { locale, sidebarSettings } from '$lib/stores/preferences.store';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { AssetApiGetAssetStatisticsRequest, api } from '@api';
  import {
    mdiAccount,
    mdiAccountMultiple,
    mdiAccountMultipleOutline,
    mdiArchiveArrowDownOutline,
    mdiHeartMultiple,
    mdiHeartMultipleOutline,
    mdiImageAlbum,
    mdiImageMultiple,
    mdiImageMultipleOutline,
    mdiMagnify,
    mdiMap,
    mdiTrashCanOutline,
  } from '@mdi/js';
  import { AppRoute } from '../../../constants';
  import LoadingSpinner from '../loading-spinner.svelte';
  import StatusBox from '../status-box.svelte';
  import SideBarButton from './side-bar-button.svelte';
  import SideBarSection from './side-bar-section.svelte';

  const getStats = async (dto: AssetApiGetAssetStatisticsRequest) => {
    const { data: stats } = await api.assetApi.getAssetStatistics(dto);
    return stats;
  };

  const getAlbumCount = async () => {
    try {
      const { data: albumCount } = await api.albumApi.getAlbumCount();
      return albumCount;
    } catch {
      return { owned: 0, shared: 0, notShared: 0 };
    }
  };

  const isFavoritesSelected = $page.route.id === '/(user)/favorites';
  const isPhotosSelected = $page.route.id === '/(user)/photos';
  const isSharingSelected = $page.route.id === '/(user)/sharing';
  const isTrashSelected = $page.route.id === '/(user)/trash';
</script>

<SideBarSection>
  <a data-sveltekit-preload-data="hover" data-sveltekit-noscroll href={AppRoute.PHOTOS} draggable="false">
    <SideBarButton
      title="照片"
      icon={isPhotosSelected ? mdiImageMultiple : mdiImageMultipleOutline}
      isSelected={isPhotosSelected}
    >
      <svelte:fragment slot="moreInformation">
        {#await getStats({ isArchived: false })}
          <LoadingSpinner />
        {:then data}
          <div>
            <p>{data.videos.toLocaleString($locale)} 视频</p>
            <p>{data.images.toLocaleString($locale)} 照片</p>
          </div>
        {/await}
      </svelte:fragment>
    </SideBarButton>
  </a>
  {#if $featureFlags.search}
    <a data-sveltekit-preload-data="hover" data-sveltekit-noscroll href={AppRoute.EXPLORE} draggable="false">
      <SideBarButton title="探索" icon={mdiMagnify} isSelected={$page.route.id === '/(user)/explore'} />
    </a>
  {/if}
  {#if $featureFlags.map}
    <a data-sveltekit-preload-data="hover" href={AppRoute.MAP} draggable="false">
      <SideBarButton title="地图" icon={mdiMap} isSelected={$page.route.id === '/(user)/map'} />
    </a>
  {/if}
  {#if $sidebarSettings.people}
    <a data-sveltekit-preload-data="hover" href={AppRoute.PEOPLE} draggable="false">
      <SideBarButton title="人物" icon={mdiAccount} isSelected={$page.route.id === '/(user)/people'} />
    </a>
  {/if}
  {#if $sidebarSettings.sharing}
    <a data-sveltekit-preload-data="hover" href={AppRoute.SHARING} draggable="false">
      <SideBarButton
        title="分享"
        icon={isSharingSelected ? mdiAccountMultiple : mdiAccountMultipleOutline}
        isSelected={isSharingSelected}
      >
        <svelte:fragment slot="moreInformation">
          {#await getAlbumCount()}
            <LoadingSpinner />
          {:then data}
            <div>
              <p>{data.shared.toLocaleString($locale)} 相册</p>
            </div>
          {/await}
        </svelte:fragment>
      </SideBarButton>
    </a>
  {/if}

  <div class="text-xs transition-all duration-200 dark:text-immich-dark-fg">
    <p class="hidden p-6 group-hover:sm:block md:block">图库</p>
    <hr class="mx-4 mb-[31px] mt-8 block group-hover:sm:hidden md:hidden" />
  </div>
  <a data-sveltekit-preload-data="hover" href={AppRoute.FAVORITES} draggable="false">
    <SideBarButton
      title="收藏夹"
      icon={isFavoritesSelected ? mdiHeartMultiple : mdiHeartMultipleOutline}
      isSelected={isFavoritesSelected}
    >
      <svelte:fragment slot="moreInformation">
        {#await getStats({ isFavorite: true })}
          <LoadingSpinner />
        {:then data}
          <div>
            <p>{data.videos.toLocaleString($locale)} 视频</p>
            <p>{data.images.toLocaleString($locale)} 照片</p>
          </div>
        {/await}
      </svelte:fragment>
    </SideBarButton>
  </a>
  <a data-sveltekit-preload-data="hover" href={AppRoute.ALBUMS} draggable="false">
    <SideBarButton
      title="相册"
      icon={mdiImageAlbum}
      flippedLogo={true}
      isSelected={$page.route.id === '/(user)/albums'}
    >
      <svelte:fragment slot="moreInformation">
        {#await getAlbumCount()}
          <LoadingSpinner />
        {:then data}
          <div>
            <p>{data.owned.toLocaleString($locale)} 相册</p>
          </div>
        {/await}
      </svelte:fragment>
    </SideBarButton>
  </a>
  <a data-sveltekit-preload-data="hover" href={AppRoute.ARCHIVE} draggable="false">
    <SideBarButton title="归档" icon={mdiArchiveArrowDownOutline} isSelected={$page.route.id === '/(user)/archive'}>
      <svelte:fragment slot="moreInformation">
        {#await getStats({ isArchived: true })}
          <LoadingSpinner />
        {:then data}
          <div>
            <p>{data.videos.toLocaleString($locale)} 视频</p>
            <p>{data.images.toLocaleString($locale)} 相册</p>
          </div>
        {/await}
      </svelte:fragment>
    </SideBarButton>
  </a>

  {#if $featureFlags.trash}
    <a data-sveltekit-preload-data="hover" href={AppRoute.TRASH} draggable="false">
      <SideBarButton title="回收站" icon={mdiTrashCanOutline} isSelected={isTrashSelected}>
        <svelte:fragment slot="moreInformation">
          {#await getStats({ isTrashed: true })}
            <LoadingSpinner />
          {:then data}
            <div>
              <p>{data.videos.toLocaleString($locale)} 视频</p>
              <p>{data.images.toLocaleString($locale)} 相册</p>
            </div>
          {/await}
        </svelte:fragment>
      </SideBarButton>
    </a>
  {/if}

  <!-- Status Box -->
  <div class="mb-6 mt-auto">
    <StatusBox />
  </div>
</SideBarSection>

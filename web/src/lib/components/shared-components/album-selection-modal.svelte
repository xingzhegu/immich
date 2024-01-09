<script lang="ts">
  import { AlbumResponseDto, api } from '@api';
  import { createEventDispatcher, onMount } from 'svelte';
  import Icon from '$lib/components/elements/icon.svelte';
  import BaseModal from './base-modal.svelte';
  import AlbumListItem from '../asset-viewer/album-list-item.svelte';
  import { mdiPlus } from '@mdi/js';

  let albums: AlbumResponseDto[] = [];
  let recentAlbums: AlbumResponseDto[] = [];
  let filteredAlbums: AlbumResponseDto[] = [];
  let loading = true;
  let search = '';

  const dispatch = createEventDispatcher<{
    newAlbum: string;
    album: AlbumResponseDto;
    close: void;
  }>();

  export let shared: boolean;

  onMount(async () => {
    const { data } = await api.albumApi.getAllAlbums({ shared: shared || undefined });
    albums = data;

    recentAlbums = albums.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1)).slice(0, 3);

    loading = false;
  });

  $: {
    if (search.length > 0 && albums.length > 0) {
      filteredAlbums = albums.filter((album) => {
        return album.albumName.toLowerCase().includes(search.toLowerCase());
      });
    } else {
      filteredAlbums = albums;
    }
  }

  const handleSelect = (album: AlbumResponseDto) => {
    dispatch('album', album);
  };

  const handleNew = () => {
    dispatch('newAlbum', search.length > 0 ? search : '');
  };
</script>

<BaseModal on:close={() => dispatch('close')}>
  <svelte:fragment slot="title">
    <span class="flex place-items-center gap-2">
      <p class="font-medium">
        添加到{shared ? '共享' : ''}相册
      </p>
    </span>
  </svelte:fragment>

  <div class="mb-2 flex max-h-[400px] flex-col">
    {#if loading}
      {#each { length: 3 } as _}
        <div class="flex animate-pulse gap-4 px-6 py-2">
          <div class="h-12 w-12 rounded-xl bg-slate-200" />
          <div class="flex flex-col items-start justify-center gap-2">
            <span class="h-4 w-36 animate-pulse bg-slate-200" />
            <div class="flex animate-pulse gap-1">
              <span class="h-3 w-8 bg-slate-200" />
              <span class="h-3 w-20 bg-slate-200" />
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <!-- svelte-ignore a11y-autofocus -->
      <input
        class="border-b-4 border-immich-bg bg-immich-bg px-6 py-2 text-2xl focus:border-immich-primary dark:border-immich-dark-gray dark:bg-immich-dark-gray dark:focus:border-immich-dark-primary"
        placeholder="搜索"
        autofocus
        bind:value={search}
      />
      <div class="immich-scrollbar overflow-y-auto">
        <button
          on:click={handleNew}
          class="flex w-full items-center gap-4 px-6 py-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <div class="flex h-12 w-12 items-center justify-center">
            <Icon path={mdiPlus} size="30" />
          </div>
          <p class="">
            新的{shared ? '分享' : ''}相册 {#if search.length > 0}<b>{search}</b>{/if}
          </p>
        </button>
        {#if filteredAlbums.length > 0}
          {#if !shared && search.length === 0}
            <p class="px-5 py-3 text-xs">最近的</p>
            {#each recentAlbums as album (album.id)}
              <AlbumListItem variant="simple" {album} on:album={() => handleSelect(album)} />
            {/each}
          {/if}

          {#if !shared}
            <p class="px-5 py-3 text-xs">
              {#if search.length === 0}所有
              {/if}相册
            </p>
          {/if}
          {#each filteredAlbums as album (album.id)}
            <AlbumListItem {album} searchQuery={search} on:album={() => handleSelect(album)} />
          {/each}
        {:else if albums.length > 0}
          <p class="px-5 py-1 text-sm">看起来您还没有使用此名称的相册。</p>
        {:else}
          <p class="px-5 py-1 text-sm">看起来您还没有任何相册。</p>
        {/if}
      </div>
    {/if}
  </div>
</BaseModal>

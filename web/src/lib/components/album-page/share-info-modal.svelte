<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { AlbumResponseDto, api, UserResponseDto } from '@api';
  import BaseModal from '../shared-components/base-modal.svelte';
  import UserAvatar from '../shared-components/user-avatar.svelte';
  import CircleIconButton from '../elements/buttons/circle-icon-button.svelte';
  import ContextMenu from '../shared-components/context-menu/context-menu.svelte';
  import MenuOption from '../shared-components/context-menu/menu-option.svelte';
  import { notificationController, NotificationType } from '../shared-components/notification/notification';
  import { handleError } from '../../utils/handle-error';
  import ConfirmDialogue from '../shared-components/confirm-dialogue.svelte';
  import { getContextMenuPosition } from '../../utils/context-menu';
  import { mdiDotsVertical } from '@mdi/js';

  export let album: AlbumResponseDto;

  const dispatch = createEventDispatcher<{
    remove: string;
    close: void;
  }>();

  let currentUser: UserResponseDto;
  let position = { x: 0, y: 0 };
  let selectedMenuUser: UserResponseDto | null = null;
  let selectedRemoveUser: UserResponseDto | null = null;

  $: isOwned = currentUser?.id == album.ownerId;

  onMount(async () => {
    try {
      const { data } = await api.userApi.getMyUserInfo();
      currentUser = data;
    } catch (e) {
      handleError(e, 'Unable to refresh user');
    }
  });

  const showContextMenu = (event: MouseEvent, user: UserResponseDto) => {
    position = getContextMenuPosition(event);
    selectedMenuUser = user;
    selectedRemoveUser = null;
  };

  const handleMenuRemove = () => {
    selectedRemoveUser = selectedMenuUser;
    selectedMenuUser = null;
  };

  const handleRemoveUser = async () => {
    if (!selectedRemoveUser) {
      return;
    }

    const userId = selectedRemoveUser.id === currentUser?.id ? 'me' : selectedRemoveUser.id;

    try {
      await api.albumApi.removeUserFromAlbum({ id: album.id, userId });
      dispatch('remove', userId);
      const message = userId === 'me' ? `离开${album.albumName}成功` : `删除${selectedRemoveUser.name}成功`;
      notificationController.show({ type: NotificationType.Info, message });
    } catch (e) {
      handleError(e, '无法删除用户');
    } finally {
      selectedRemoveUser = null;
    }
  };
</script>

{#if !selectedRemoveUser}
  <BaseModal on:close={() => dispatch('close')}>
    <svelte:fragment slot="title">
      <span class="flex place-items-center gap-2">
        <p class="font-medium text-immich-fg dark:text-immich-dark-fg">选项</p>
      </span>
    </svelte:fragment>

    <section class="immich-scrollbar max-h-[400px] overflow-y-auto pb-4">
      <div class="flex w-full place-items-center justify-between gap-4 p-5">
        <div class="flex place-items-center gap-4">
          <UserAvatar user={album.owner} size="md" />
          <p class="text-sm font-medium">{album.owner.name}</p>
        </div>

        <div id="icon-{album.owner.id}" class="flex place-items-center">
          <p class="text-sm">所有者</p>
        </div>
      </div>
      {#each album.sharedUsers as user}
        <div
          class="flex w-full place-items-center justify-between gap-4 p-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex place-items-center gap-4">
            <UserAvatar {user} size="md" />
            <p class="text-sm font-medium">{user.name}</p>
          </div>

          <div id="icon-{user.id}" class="flex place-items-center">
            {#if isOwned}
              <div>
                <CircleIconButton
                  on:click={(event) => showContextMenu(event, user)}
                  icon={mdiDotsVertical}
                  backgroundColor="transparent"
                  hoverColor="#e2e7e9"
                  size="20"
                />

                {#if selectedMenuUser === user}
                  <ContextMenu {...position} on:outclick={() => (selectedMenuUser = null)}>
                    <MenuOption on:click={handleMenuRemove} text="删除" />
                  </ContextMenu>
                {/if}
              </div>
            {:else if user.id == currentUser?.id}
              <button
                on:click={() => (selectedRemoveUser = user)}
                class="text-sm font-medium text-immich-primary transition-colors hover:text-immich-primary/75 dark:text-immich-dark-primary"
                >离开</button
              >
            {/if}
          </div>
        </div>
      {/each}
    </section>
  </BaseModal>
{/if}

{#if selectedRemoveUser && selectedRemoveUser?.id === currentUser?.id}
  <ConfirmDialogue
    title="离开相册？"
    prompt="确定离开{album.albumName}?"
    confirmText="离开"
    on:confirm={handleRemoveUser}
    on:cancel={() => (selectedRemoveUser = null)}
  />
{/if}

{#if selectedRemoveUser && selectedRemoveUser?.id !== currentUser?.id}
  <ConfirmDialogue
    title="删除用户？"
    prompt="确定删除{selectedRemoveUser.name}"
    confirmText="删除"
    on:confirm={handleRemoveUser}
    on:cancel={() => (selectedRemoveUser = null)}
  />
{/if}

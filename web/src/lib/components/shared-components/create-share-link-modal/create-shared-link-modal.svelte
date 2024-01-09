<script lang="ts">
  import SettingInputField, {
    SettingInputFieldType,
  } from '$lib/components/admin-page/settings/setting-input-field.svelte';
  import SettingSwitch from '$lib/components/admin-page/settings/setting-switch.svelte';
  import Button from '$lib/components/elements/buttons/button.svelte';
  import { handleError } from '$lib/utils/handle-error';
  import { api, copyToClipboard, makeSharedLinkUrl, SharedLinkResponseDto, SharedLinkType } from '@api';
  import { createEventDispatcher, onMount } from 'svelte';
  import Icon from '$lib/components/elements/icon.svelte';
  import BaseModal from '../base-modal.svelte';
  import type { ImmichDropDownOption } from '../dropdown-button.svelte';
  import DropdownButton from '../dropdown-button.svelte';
  import { notificationController, NotificationType } from '../notification/notification';
  import { mdiLink } from '@mdi/js';
  import { serverConfig } from '$lib/stores/server-config.store';

  export let albumId: string | undefined = undefined;
  export let assetIds: string[] = [];
  export let editingLink: SharedLinkResponseDto | undefined = undefined;

  let sharedLink: string | null = null;
  let description = '';
  let allowDownload = true;
  let allowUpload = false;
  let showMetadata = true;
  let expirationTime = '';
  let password = '';
  let shouldChangeExpirationTime = false;
  let canCopyImagesToClipboard = true;
  let enablePassword = false;

  const dispatch = createEventDispatcher<{
    close: void;
    escape: void;
  }>();

  const expiredDateOption: ImmichDropDownOption = {
    default: 'Never',
    options: ['Never', '30 minutes', '1 hour', '6 hours', '1 day', '7 days', '30 days'],
  };

  $: shareType = albumId ? SharedLinkType.Album : SharedLinkType.Individual;

  onMount(async () => {
    if (editingLink) {
      if (editingLink.description) {
        description = editingLink.description;
      }
      if (editingLink.password) {
        password = editingLink.password;
      }
      allowUpload = editingLink.allowUpload;
      allowDownload = editingLink.allowDownload;
      showMetadata = editingLink.showMetadata;

      albumId = editingLink.album?.id;
      assetIds = editingLink.assets.map(({ id }) => id);

      enablePassword = !!editingLink.password;
    }

    const module = await import('copy-image-clipboard');
    canCopyImagesToClipboard = module.canCopyImagesToClipboard();
  });

  const handleCreateSharedLink = async () => {
    const expirationTime = getExpirationTimeInMillisecond();
    const currentTime = new Date().getTime();
    const expirationDate = expirationTime ? new Date(currentTime + expirationTime).toISOString() : undefined;

    try {
      const { data } = await api.sharedLinkApi.createSharedLink({
        sharedLinkCreateDto: {
          type: shareType,
          albumId,
          assetIds,
          expiresAt: expirationDate,
          allowUpload,
          description,
          password,
          allowDownload,
          showMetadata,
        },
      });
      sharedLink = makeSharedLinkUrl($serverConfig.externalDomain, data.key);
    } catch (e) {
      handleError(e, '创建分享链接失败');
    }
  };

  const handleCopy = async () => {
    if (!sharedLink) {
      return;
    }

    await copyToClipboard(password ? `链接: ${sharedLink}\n密码: ${password}` : sharedLink);
  };

  const getExpirationTimeInMillisecond = () => {
    switch (expirationTime) {
      case '30 minutes':
        return 30 * 60 * 1000;
      case '1 hour':
        return 60 * 60 * 1000;
      case '6 hours':
        return 6 * 60 * 60 * 1000;
      case '1 day':
        return 24 * 60 * 60 * 1000;
      case '7 days':
        return 7 * 24 * 60 * 60 * 1000;
      case '30 days':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const handleEditLink = async () => {
    if (!editingLink) {
      return;
    }

    try {
      const expirationTime = getExpirationTimeInMillisecond();
      const currentTime = new Date().getTime();
      const expirationDate: string | null = expirationTime
        ? new Date(currentTime + expirationTime).toISOString()
        : null;

      await api.sharedLinkApi.updateSharedLink({
        id: editingLink.id,
        sharedLinkEditDto: {
          description,
          password: enablePassword ? password : '',
          expiresAt: shouldChangeExpirationTime ? expirationDate : undefined,
          allowUpload,
          allowDownload,
          showMetadata,
        },
      });

      notificationController.show({
        type: NotificationType.Info,
        message: '已编辑',
      });

      dispatch('close');
    } catch (e) {
      handleError(e, '编辑分享链接失败');
    }
  };
</script>

<BaseModal on:close={() => dispatch('close')} on:escape={() => dispatch('escape')}>
  <svelte:fragment slot="title">
    <span class="flex place-items-center gap-2">
      <Icon path={mdiLink} size={24} />
      {#if editingLink}
        <p class="font-medium text-immich-fg dark:text-immich-dark-fg">编辑链接</p>
      {:else}
        <p class="font-medium text-immich-fg dark:text-immich-dark-fg">创建分享链接</p>
      {/if}
    </span>
  </svelte:fragment>

  <section class="mx-6 mb-6">
    {#if shareType === SharedLinkType.Album}
      {#if !editingLink}
        <div>允许任何拥有链接的人查看此相册中的照片和人物。</div>
      {:else}
        <div class="text-sm">
          公共相册 | <span class="text-immich-primary dark:text-immich-dark-primary"
            >{editingLink.album?.albumName}</span
          >
        </div>
      {/if}
    {/if}

    {#if shareType === SharedLinkType.Individual}
      {#if !editingLink}
        <div>允许任何拥有链接的人查看所选的照片。</div>
      {:else}
        <div class="text-sm">
          个人分享 | <span class="text-immich-primary dark:text-immich-dark-primary"
            >{editingLink.description || ''}</span
          >
        </div>
      {/if}
    {/if}

    <div class="mb-2 mt-4">
      <p class="text-xs">链接选项</p>
    </div>
    <div class="rounded-lg bg-gray-100 p-4 dark:bg-black/40 overflow-y-auto">
      <div class="flex flex-col">
        <div class="mb-2">
          <SettingInputField inputType={SettingInputFieldType.TEXT} label="描述" bind:value={description} />
        </div>

        <div class="mb-2">
          <SettingInputField
            inputType={SettingInputFieldType.TEXT}
            label="密码"
            bind:value={password}
            disabled={!enablePassword}
          />
        </div>

        <div class="my-3">
          <SettingSwitch bind:checked={enablePassword} title={'需要密码'} />
        </div>

        <div class="my-3">
          <SettingSwitch bind:checked={showMetadata} title={'显示元数据'} />
        </div>

        <div class="my-3">
          <SettingSwitch bind:checked={allowDownload} title={'允许公共用户下载'} />
        </div>

        <div class="my-3">
          <SettingSwitch bind:checked={allowUpload} title={'允许公共用户上传'} />
        </div>

        <div class="text-sm">
          {#if editingLink}
            <p class="immich-form-label my-2">
              <SettingSwitch bind:checked={shouldChangeExpirationTime} title={'修改过期时间'} />
            </p>
          {:else}
            <p class="immich-form-label my-2">过期时间</p>
          {/if}

          <DropdownButton
            options={expiredDateOption}
            bind:selected={expirationTime}
            disabled={editingLink && !shouldChangeExpirationTime}
          />
        </div>
      </div>
    </div>
  </section>

  <hr />

  <section slot="sticky-bottom">
    {#if !sharedLink}
      {#if editingLink}
        <div class="flex justify-end">
          <Button size="sm" rounded="lg" on:click={handleEditLink}>确认</Button>
        </div>
      {:else}
        <div class="flex justify-end">
          <Button size="sm" rounded="lg" on:click={handleCreateSharedLink}>创建链接</Button>
        </div>
      {/if}
    {:else}
      <div class="flex w-full gap-4">
        <input class="immich-form-input w-full" bind:value={sharedLink} disabled />

        {#if canCopyImagesToClipboard}
          <Button on:click={() => handleCopy()}>复制</Button>
        {/if}
      </div>
    {/if}
  </section>
</BaseModal>

<script lang="ts">
  import { api, UserResponseDto } from '@api';
  import { createEventDispatcher } from 'svelte';
  import { notificationController, NotificationType } from '../shared-components/notification/notification';
  import Button from '../elements/buttons/button.svelte';
  import ConfirmDialogue from '$lib/components/shared-components/confirm-dialogue.svelte';
  import { handleError } from '../../utils/handle-error';
  import Icon from '$lib/components/elements/icon.svelte';
  import { mdiAccountEditOutline, mdiClose } from '@mdi/js';
  import { AppRoute } from '$lib/constants';
  import CircleIconButton from '../elements/buttons/circle-icon-button.svelte';

  export let user: UserResponseDto;
  export let canResetPassword = true;

  let error: string;
  let success: string;

  let isShowResetPasswordConfirmation = false;

  const dispatch = createEventDispatcher<{
    close: void;
    resetPasswordSuccess: void;
    editSuccess: void;
  }>();

  const editUser = async () => {
    try {
      const { id, email, name, storageLabel, externalPath } = user;
      const { status } = await api.userApi.updateUser({
        updateUserDto: {
          id,
          email,
          name,
          storageLabel: storageLabel || '',
          externalPath: externalPath || '',
        },
      });

      if (status === 200) {
        dispatch('editSuccess');
      }
    } catch (error) {
      handleError(error, '无法更新用户');
    }
  };

  const resetPassword = async () => {
    try {
      const defaultPassword = 'password';

      const { status } = await api.userApi.updateUser({
        updateUserDto: {
          id: user.id,
          password: defaultPassword,
          shouldChangePassword: true,
        },
      });

      if (status == 200) {
        dispatch('resetPasswordSuccess');
      }
    } catch (e) {
      console.error('Error reseting user password', e);
      notificationController.show({
        message: '重置用户密码错误，查看控制台获取更多信息',
        type: NotificationType.Error,
      });
    } finally {
      isShowResetPasswordConfirmation = false;
    }
  };
</script>

<div
  class="relative max-h-screen w-[500px] max-w-[95vw] overflow-y-auto rounded-3xl border bg-immich-bg p-4 py-8 shadow-sm dark:border-immich-dark-gray dark:bg-immich-dark-gray dark:text-immich-dark-fg"
>
  <div class="absolute top-0 right-0 px-2 py-2 h-fit">
    <CircleIconButton icon={mdiClose} on:click={() => dispatch('close')} />
  </div>

  <div
    class="flex flex-col place-content-center place-items-center gap-4 px-4 text-immich-primary dark:text-immich-dark-primary"
  >
    <Icon path={mdiAccountEditOutline} size="4em" />
    <h1 class="text-2xl font-medium text-immich-primary dark:text-immich-dark-primary">编辑用户</h1>
  </div>

  <form on:submit|preventDefault={editUser} autocomplete="off">
    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="email">邮箱</label>
      <input class="immich-form-input" id="email" name="email" type="email" bind:value={user.email} />
    </div>

    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="name">姓名</label>
      <input class="immich-form-input" id="name" name="name" type="text" required bind:value={user.name} />
    </div>

    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="storage-label">存储标签</label>
      <input
        class="immich-form-input"
        id="storage-label"
        name="storage-label"
        type="text"
        bind:value={user.storageLabel}
      />

      <p>
        注意：要将存储标签应用于先前上传的资产，请运行
        <a href={AppRoute.ADMIN_JOBS} class="text-immich-primary dark:text-immich-dark-primary">
          存储迁移任务</a
        >。
      </p>
    </div>

    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="external-path">外部路径</label>
      <input
        class="immich-form-input"
        id="external-path"
        name="external-path"
        type="text"
        bind:value={user.externalPath}
      />

      <p>
        注意：导入目录的绝对路径。只有在此路径下或其子路径下存在的文件才能被用户导入。
      </p>
    </div>

    {#if error}
      <p class="ml-4 text-sm text-red-400">{error}</p>
    {/if}

    {#if success}
      <p class="ml-4 text-sm text-immich-primary">{success}</p>
    {/if}
    <div class="mt-8 flex w-full gap-4 px-4">
      {#if canResetPassword}
        <Button color="light-red" fullwidth on:click={() => (isShowResetPasswordConfirmation = true)}
          >重置密码</Button
        >
      {/if}
      <Button type="submit" fullwidth>确认</Button>
    </div>
  </form>
</div>

{#if isShowResetPasswordConfirmation}
  <ConfirmDialogue
    title="重置密码"
	cancelText="取消"
    confirmText="重置"
    on:confirm={resetPassword}
    on:cancel={() => (isShowResetPasswordConfirmation = false)}
  >
    <svelte:fragment slot="prompt">
      <p>
        确定重置<b>{user.name}</b>的密码?
      </p>
    </svelte:fragment>
  </ConfirmDialogue>
{/if}

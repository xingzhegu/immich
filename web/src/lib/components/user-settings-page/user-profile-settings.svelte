<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { api, UserResponseDto } from '@api';
  import { fade } from 'svelte/transition';
  import { handleError } from '../../utils/handle-error';
  import SettingInputField, { SettingInputFieldType } from '../admin-page/settings/setting-input-field.svelte';
  import Button from '../elements/buttons/button.svelte';
  import { setUser } from '$lib/stores/user.store';

  export let user: UserResponseDto;

  const handleSaveProfile = async () => {
    try {
      const { data } = await api.userApi.updateUser({
        updateUserDto: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });

      Object.assign(user, data);
      setUser(data);

      notificationController.show({
        message: '个人信息已保存',
        type: NotificationType.Info,
      });
    } catch (error) {
      handleError(error, '无法保存个人信息');
    }
  };
</script>

<section class="my-4">
  <div in:fade={{ duration: 500 }}>
    <form autocomplete="off" on:submit|preventDefault>
      <div class="ml-4 mt-4 flex flex-col gap-4">
        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="用户ID"
          bind:value={user.id}
          disabled={true}
        />

        <SettingInputField inputType={SettingInputFieldType.EMAIL} label="邮箱" bind:value={user.email} />

        <SettingInputField inputType={SettingInputFieldType.TEXT} label="姓名" bind:value={user.name} required={true} />

        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="存储标签"
          disabled={true}
          value={user.storageLabel || ''}
          required={false}
        />

        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="外部路径"
          disabled={true}
          value={user.externalPath || ''}
          required={false}
        />

        <div class="flex justify-end">
          <Button type="submit" size="sm" on:click={() => handleSaveProfile()}>保存</Button>
        </div>
      </div>
    </form>
  </div>
</section>

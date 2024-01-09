<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { api, ApiError } from '@api';
  import { fade } from 'svelte/transition';
  import SettingInputField, { SettingInputFieldType } from '../admin-page/settings/setting-input-field.svelte';
  import Button from '../elements/buttons/button.svelte';

  let password = '';
  let newPassword = '';
  let confirmPassword = '';

  const handleChangePassword = async () => {
    try {
      await api.authenticationApi.changePassword({
        changePasswordDto: {
          password,
          newPassword,
        },
      });

      notificationController.show({
        message: 'Updated password',
        type: NotificationType.Info,
      });

      password = '';
      newPassword = '';
      confirmPassword = '';
    } catch (error) {
      console.error('Error [user-profile] [changePassword]', error);
      notificationController.show({
        message: (error as ApiError)?.response?.data?.message || 'Unable to change password',
        type: NotificationType.Error,
      });
    }
  };
</script>

<section class="my-4">
  <div in:fade={{ duration: 500 }}>
    <form autocomplete="off" on:submit|preventDefault>
      <div class="ml-4 mt-4 flex flex-col gap-4">
        <SettingInputField
          inputType={SettingInputFieldType.PASSWORD}
          label="密码"
          bind:value={password}
          required={true}
        />

        <SettingInputField
          inputType={SettingInputFieldType.PASSWORD}
          label="新的密码"
          bind:value={newPassword}
          required={true}
        />

        <SettingInputField
          inputType={SettingInputFieldType.PASSWORD}
          label="确认密码"
          bind:value={confirmPassword}
          required={true}
        />

        <div class="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!(password && newPassword && newPassword === confirmPassword)}
            on:click={() => handleChangePassword()}>保存</Button
          >
        </div>
      </div>
    </form>
  </div>
</section>

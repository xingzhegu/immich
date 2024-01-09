<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { api, UserResponseDto } from '@api';
  import { fade } from 'svelte/transition';
  import { handleError } from '../../utils/handle-error';
  import SettingSwitch from '../admin-page/settings/setting-switch.svelte';
  import Button from '../elements/buttons/button.svelte';

  export let user: UserResponseDto;

  const handleSave = async () => {
    try {
      const { data } = await api.userApi.updateUser({
        updateUserDto: {
          id: user.id,
          memoriesEnabled: user.memoriesEnabled,
        },
      });

      Object.assign(user, data);

      notificationController.show({ message: '设置已保存', type: NotificationType.Info });
    } catch (error) {
      handleError(error, '无法修改设置');
    }
  };
</script>

<section class="my-4">
  <div in:fade={{ duration: 500 }}>
    <form autocomplete="off" on:submit|preventDefault>
      <div class="ml-4 mt-4 flex flex-col gap-4">
        <div class="ml-4">
          <SettingSwitch
            title="基于时间的回忆"
            subtitle="以往年份的照片"
            bind:checked={user.memoriesEnabled}
          />
        </div>
        <div class="flex justify-end">
          <Button type="submit" size="sm" on:click={() => handleSave()}>保存</Button>
        </div>
      </div>
    </form>
  </div>
</section>

<script lang="ts">
  import { api, UserResponseDto } from '@api';
  import { createEventDispatcher } from 'svelte';
  import ConfirmDialogue from '$lib/components/shared-components/confirm-dialogue.svelte';
  import { handleError } from '../../utils/handle-error';

  export let user: UserResponseDto;

  const dispatch = createEventDispatcher<{
    success: void;
    fail: void;
  }>();

  const deleteUser = async () => {
    try {
      const deletedUser = await api.userApi.deleteUser({ id: user.id });
      if (deletedUser.data.deletedAt != null) {
        dispatch('success');
      } else {
        dispatch('fail');
      }
    } catch (error) {
      handleError(error, '无法删除用户');
      dispatch('fail');
    }
  };
</script>

<ConfirmDialogue title="删除用户" cancelText="取消" confirmText="删除" on:confirm={deleteUser} on:cancel>
  <svelte:fragment slot="prompt">
    <div class="flex flex-col gap-4">
      <p>
        <b>{user.name}</b>的账号和资产将在7天后被永久删除。
      </p>
      <p>确定继续？</p>
    </div>
  </svelte:fragment>
</ConfirmDialogue>

<script lang="ts">
  import { api, UserResponseDto } from '@api';
  import { createEventDispatcher } from 'svelte';
  import ConfirmDialogue from '$lib/components/shared-components/confirm-dialogue.svelte';

  export let user: UserResponseDto;

  const dispatch = createEventDispatcher<{
    success: void;
    fail: void;
  }>();

  const restoreUser = async () => {
    const restoredUser = await api.userApi.restoreUser({ id: user.id });
    if (restoredUser.data.deletedAt == null) {
      dispatch('success');
    } else {
      dispatch('fail');
    }
  };
</script>

<ConfirmDialogue title="恢复用户" cancelText="取消" confirmText="恢复" confirmColor="green" on:confirm={restoreUser} on:cancel>
  <svelte:fragment slot="prompt">
    <p><b>{user.name}</b>的账号将被恢复。</p>
  </svelte:fragment>
</ConfirmDialogue>

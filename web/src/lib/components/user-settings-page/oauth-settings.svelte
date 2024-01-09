<script lang="ts">
  import { goto } from '$app/navigation';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { oauth, UserResponseDto } from '@api';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { handleError } from '../../utils/handle-error';
  import Button from '../elements/buttons/button.svelte';
  import LoadingSpinner from '../shared-components/loading-spinner.svelte';
  import { notificationController, NotificationType } from '../shared-components/notification/notification';

  export let user: UserResponseDto;

  let loading = true;

  onMount(async () => {
    if (oauth.isCallback(window.location)) {
      try {
        loading = true;

        const { data } = await oauth.link(window.location);
        user = data;

        notificationController.show({
          message: '连接的OAuth账户',
          type: NotificationType.Info,
        });
      } catch (error) {
        handleError(error, '无法连接OAuth账户');
      } finally {
        goto('?open=oauth');
      }
    }

    loading = false;
  });

  const handleUnlink = async () => {
    try {
      const { data } = await oauth.unlink();
      user = data;
      notificationController.show({
        message: '取消连接OAuth账户',
        type: NotificationType.Info,
      });
    } catch (error) {
      handleError(error, '无法取消连接OAuth账户');
    }
  };
</script>

<section class="my-4">
  <div in:fade={{ duration: 500 }}>
    <div class="flex justify-end">
      {#if loading}
        <div class="flex place-content-center place-items-center">
          <LoadingSpinner />
        </div>
      {:else if $featureFlags.oauth}
        {#if user.oauthId}
          <Button size="sm" on:click={() => handleUnlink()}>取消连接Oauth</Button>
        {:else}
          <Button size="sm" on:click={() => oauth.authorize(window.location)}>连接OAuth</Button>
        {/if}
      {/if}
    </div>
  </div>
</section>

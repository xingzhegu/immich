<script lang="ts">
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/shared-components/loading-spinner.svelte';
  import { AppRoute } from '$lib/constants';
  import { featureFlags, serverConfig } from '$lib/stores/server-config.store';
  import { getServerErrorMessage, handleError } from '$lib/utils/handle-error';
  import { api, oauth } from '@api';
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Button from '../elements/buttons/button.svelte';

  let errorMessage: string;
  let email = '';
  let password = '';
  let oauthError = '';
  let loading = false;
  let oauthLoading = true;

  const dispatch = createEventDispatcher<{
    success: void;
    firstLogin: void;
    onboarding: void;
  }>();

  onMount(async () => {
    if (!$featureFlags.oauth) {
      oauthLoading = false;
      return;
    }

    if (oauth.isCallback(window.location)) {
      try {
        await oauth.login(window.location);
        dispatch('success');
        return;
      } catch (e) {
        console.error('Error [login-form] [oauth.callback]', e);
        oauthError = (await getServerErrorMessage(e)) || 'Unable to complete OAuth login';
        oauthLoading = false;
      }
    }

    try {
      if ($featureFlags.oauthAutoLaunch && !oauth.isAutoLaunchDisabled(window.location)) {
        await goto(`${AppRoute.AUTH_LOGIN}?autoLaunch=0`, { replaceState: true });
        await oauth.authorize(window.location);
        return;
      }
    } catch (error) {
      await handleError(error, '无法访问系统!');
    }

    oauthLoading = false;
  });

  const login = async () => {
    try {
      errorMessage = '';
      loading = true;

      const { data: user } = await api.authenticationApi.login({
        loginCredentialDto: {
          email,
          password,
        },
      });

      const { data: serverConfig } = await api.serverInfoApi.getServerConfig();

      if (user.isAdmin && !serverConfig.isOnboarded) {
        dispatch('onboarding');
        return;
      }

      if (!user.isAdmin && user.shouldChangePassword) {
        dispatch('firstLogin');
        return;
      }

      dispatch('success');
      return;
    } catch (error) {
      errorMessage = (await getServerErrorMessage(error)) || '不正确的邮箱或密码';
      loading = false;
      return;
    }
  };

  const handleOAuthLogin = async () => {
    oauthLoading = true;
    oauthError = '';
    await oauth.authorize(window.location);
  };
</script>

{#if !oauthLoading && $featureFlags.passwordLogin}
  <form on:submit|preventDefault={login} class="mt-5 flex flex-col gap-5">
    {#if errorMessage}
      <p class="text-red-400" transition:fade>
        {errorMessage}
      </p>
    {/if}

    <div class="flex flex-col gap-2">
      <label class="immich-form-label" for="email">邮箱</label>
      <input
        class="immich-form-input"
        id="email"
        name="email"
        type="email"
        autocomplete="email"
        bind:value={email}
        required
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="immich-form-label" for="password">密码</label>
      <input
        class="immich-form-input"
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        bind:value={password}
        required
      />
    </div>

    <div class="my-5 flex w-full">
      <Button type="submit" size="lg" fullwidth disabled={loading}>
        {#if loading}
          <span class="h-6">
            <LoadingSpinner />
          </span>
        {:else}
          登录
        {/if}
      </Button>
    </div>
  </form>
{/if}

{#if $featureFlags.oauth}
  {#if $featureFlags.passwordLogin}
    <div class="inline-flex w-full items-center justify-center">
      <hr class="my-4 h-px w-3/4 border-0 bg-gray-200 dark:bg-gray-600" />
      <span
        class="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-immich-dark-gray dark:text-white"
      >
        or
      </span>
    </div>
  {/if}
  <div class="my-5 flex flex-col gap-5">
    {#if oauthError}
      <p class="text-center text-red-400" transition:fade>{oauthError}</p>
    {/if}
    <Button
      type="button"
      disabled={loading || oauthLoading}
      size="lg"
      fullwidth
      color={$featureFlags.passwordLogin ? 'secondary' : 'primary'}
      on:click={handleOAuthLogin}
    >
      {#if oauthLoading}
        <span class="h-6">
          <LoadingSpinner />
        </span>
      {:else}
        {$serverConfig.oauthButtonText}
      {/if}
    </Button>
  </div>
{/if}

{#if !$featureFlags.passwordLogin && !$featureFlags.oauth}
  <p class="p-4 text-center dark:text-immich-dark-fg">无法登录。</p>
{/if}

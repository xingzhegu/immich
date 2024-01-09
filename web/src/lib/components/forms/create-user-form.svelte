<script lang="ts">
  import { api } from '@api';
  import { createEventDispatcher } from 'svelte';
  import ImmichLogo from '../shared-components/immich-logo.svelte';
  import { notificationController, NotificationType } from '../shared-components/notification/notification';
  import Button from '../elements/buttons/button.svelte';

  let error: string;
  let success: string;

  let password = '';
  let confirmPassowrd = '';

  let canCreateUser = false;

  let isCreatingUser = false;

  $: {
    if (password !== confirmPassowrd && confirmPassowrd.length > 0) {
      error = '密码不一致';
      canCreateUser = false;
    } else {
      error = '';
      canCreateUser = true;
    }
  }
  const dispatch = createEventDispatcher<{
    submit: void;
    cancel: void;
  }>();

  async function registerUser(event: SubmitEvent) {
    if (canCreateUser && !isCreatingUser) {
      isCreatingUser = true;

      error = '';

      const formElement = event.target as HTMLFormElement;

      const form = new FormData(formElement);

      const email = form.get('email');
      const password = form.get('password');
      const name = form.get('name');

      try {
        const { status } = await api.userApi.createUser({
          createUserDto: {
            email: String(email),
            password: String(password),
            name: String(name),
          },
        });

        if (status === 201) {
          success = 'New user created';

          dispatch('submit');

          isCreatingUser = false;
          return;
        } else {
          error = 'Error create user account';
          isCreatingUser = false;
        }
      } catch (e) {
        error = 'Error create user account';
        isCreatingUser = false;

        console.log('[ERROR] registerUser', e);

        notificationController.show({
          message: `Error create new user, check console for more detail`,
          type: NotificationType.Error,
        });
      }
    }
  }
</script>

<div
  class="max-h-screen w-[500px] max-w-[95vw] overflow-y-scroll rounded-3xl border bg-immich-bg p-4 py-8 shadow-sm dark:border-immich-dark-gray dark:bg-immich-dark-gray dark:text-immich-dark-fg"
>
  <div class="flex flex-col place-content-center place-items-center gap-4 px-4">
    <ImmichLogo class="text-center" height="100" width="100" />
    <h1 class="text-2xl font-medium text-immich-primary dark:text-immich-dark-primary">创建新的用户</h1>
    <p class="rounded-md border p-4 font-mono text-sm text-gray-600 dark:border-immich-dark-bg dark:text-gray-300">
      请向您的用户提供密码，他们必须在第一次登录时更改密码。
    </p>
  </div>

  <form on:submit|preventDefault={registerUser} autocomplete="off">
    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="email">邮箱</label>
      <input class="immich-form-input" id="email" name="email" type="email" required />
    </div>

    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="password">密码</label>
      <input class="immich-form-input" id="password" name="password" type="password" required bind:value={password} />
    </div>

    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="confirmPassword">确认密码</label>
      <input
        class="immich-form-input"
        id="confirmPassword"
        name="password"
        type="password"
        required
        bind:value={confirmPassowrd}
      />
    </div>

    <div class="m-4 flex flex-col gap-2">
      <label class="immich-form-label" for="name">姓名</label>
      <input class="immich-form-input" id="name" name="name" type="text" required />
    </div>

    {#if error}
      <p class="ml-4 text-sm text-red-400">{error}</p>
    {/if}

    {#if success}
      <p class="ml-4 text-sm text-immich-primary">{success}</p>
    {/if}
    <div class="flex w-full gap-4 p-4">
      <Button color="gray" fullwidth on:click={() => dispatch('cancel')}>取消</Button>
      <Button type="submit" disabled={isCreatingUser} fullwidth>创建</Button>
    </div>
  </form>
</div>

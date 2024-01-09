<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { handleError } from '$lib/utils/handle-error';
  import { api, SystemConfigOAuthDto } from '@api';
  import { isEqual } from 'lodash-es';
  import { fade } from 'svelte/transition';
  import ConfirmDisableLogin from '../confirm-disable-login.svelte';
  import SettingButtonsRow from '../setting-buttons-row.svelte';
  import SettingInputField, { SettingInputFieldType } from '../setting-input-field.svelte';
  import SettingSwitch from '../setting-switch.svelte';
  import type { ResetOptions } from '$lib/utils/dipatch';

  export let oauthConfig: SystemConfigOAuthDto;
  export let disabled = false;

  let savedConfig: SystemConfigOAuthDto;
  let defaultConfig: SystemConfigOAuthDto;

  const handleReset = (detail: ResetOptions) => {
    if (detail.default) {
      resetToDefault();
    } else {
      reset();
    }
  };

  const handleToggleOverride = () => {
    // click runs before bind
    const previouslyEnabled = oauthConfig.mobileOverrideEnabled;
    if (!previouslyEnabled && !oauthConfig.mobileRedirectUri) {
      oauthConfig.mobileRedirectUri = window.location.origin + '/api/oauth/mobile-redirect';
    }
  };

  async function getConfigs() {
    [savedConfig, defaultConfig] = await Promise.all([
      api.systemConfigApi.getConfig().then((res) => res.data.oauth),
      api.systemConfigApi.getConfigDefaults().then((res) => res.data.oauth),
    ]);
  }

  async function reset() {
    const { data: resetConfig } = await api.systemConfigApi.getConfig();

    oauthConfig = { ...resetConfig.oauth };
    savedConfig = { ...resetConfig.oauth };

    notificationController.show({
      message: '将OAuth设置恢复为最后保存的设置',
      type: NotificationType.Info,
    });
  }

  let isConfirmOpen = false;
  let handleConfirm: (value: boolean) => void;

  const openConfirmModal = () => {
    return new Promise((resolve) => {
      handleConfirm = (value: boolean) => {
        isConfirmOpen = false;
        resolve(value);
      };
      isConfirmOpen = true;
    });
  };

  async function saveSetting() {
    try {
      const { data: current } = await api.systemConfigApi.getConfig();

      if (!current.passwordLogin.enabled && current.oauth.enabled && !oauthConfig.enabled) {
        const confirmed = await openConfirmModal();
        if (!confirmed) {
          return;
        }
      }

      if (!oauthConfig.mobileOverrideEnabled) {
        oauthConfig.mobileRedirectUri = '';
      }

      const { data: updated } = await api.systemConfigApi.updateConfig({
        systemConfigDto: {
          ...current,
          oauth: oauthConfig,
        },
      });

      oauthConfig = { ...updated.oauth };
      savedConfig = { ...updated.oauth };

      notificationController.show({ message: 'OAuth设置已保存', type: NotificationType.Info });
    } catch (error) {
      handleError(error, '无法保存OAuth设置');
    }
  }

  async function resetToDefault() {
    const { data: defaultConfig } = await api.systemConfigApi.getConfigDefaults();

    oauthConfig = { ...defaultConfig.oauth };

    notificationController.show({
      message: '将OAuth设置恢复为默认设置',
      type: NotificationType.Info,
    });
  }
</script>

{#if isConfirmOpen}
  <ConfirmDisableLogin on:cancel={() => handleConfirm(false)} on:confirm={() => handleConfirm(true)} />
{/if}

<div class="mt-2">
  {#await getConfigs() then}
    <div in:fade={{ duration: 500 }}>
      <form autocomplete="off" on:submit|preventDefault class="mx-4 flex flex-col gap-4 py-4">
        <p class="text-sm dark:text-immich-dark-fg">
			有关此功能的更多详细信息，请参考<a
            href="https://immich.app/docs/administration/oauth#mobile-redirect-uri"
            class="underline"
            target="_blank"
            rel="noreferrer">文档</a
          >.
        </p>

        <SettingSwitch {disabled} title="启用" bind:checked={oauthConfig.enabled} />
        <hr />
        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="ISSUER URL"
          bind:value={oauthConfig.issuerUrl}
          required={true}
          disabled={disabled || !oauthConfig.enabled}
          isEdited={!(oauthConfig.issuerUrl == savedConfig.issuerUrl)}
        />

        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="CLIENT ID"
          bind:value={oauthConfig.clientId}
          required={true}
          disabled={disabled || !oauthConfig.enabled}
          isEdited={!(oauthConfig.clientId == savedConfig.clientId)}
        />

        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="CLIENT SECRET"
          bind:value={oauthConfig.clientSecret}
          required={true}
          disabled={disabled || !oauthConfig.enabled}
          isEdited={!(oauthConfig.clientSecret == savedConfig.clientSecret)}
        />

        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="SCOPE"
          bind:value={oauthConfig.scope}
          required={true}
          disabled={disabled || !oauthConfig.enabled}
          isEdited={!(oauthConfig.scope == savedConfig.scope)}
        />

        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="STORAGE LABEL CLAIM"
          desc="自动将用户的存储标签设置为此声明的值。"
          bind:value={oauthConfig.storageLabelClaim}
          required={true}
          disabled={disabled || !oauthConfig.storageLabelClaim}
          isEdited={!(oauthConfig.storageLabelClaim == savedConfig.storageLabelClaim)}
        />

        <SettingInputField
          inputType={SettingInputFieldType.TEXT}
          label="BUTTON TEXT"
          bind:value={oauthConfig.buttonText}
          required={false}
          disabled={disabled || !oauthConfig.enabled}
          isEdited={!(oauthConfig.buttonText == savedConfig.buttonText)}
        />

        <SettingSwitch
          title="自动注册"
          subtitle="在使用 OAuth 登录后自动注册新用户"
          bind:checked={oauthConfig.autoRegister}
          disabled={disabled || !oauthConfig.enabled}
        />

        <SettingSwitch
          title="自动启动"
          subtitle="在导航到登录页面时自动启动 OAuth 登录流程"
          disabled={disabled || !oauthConfig.enabled}
          bind:checked={oauthConfig.autoLaunch}
        />

        <SettingSwitch
          title="移动设备重定向URI覆盖"
          subtitle="当app.immich:/是无效的重定向 URI 时启用。"
          disabled={disabled || !oauthConfig.enabled}
          on:click={() => handleToggleOverride()}
          bind:checked={oauthConfig.mobileOverrideEnabled}
        />

        {#if oauthConfig.mobileOverrideEnabled}
          <SettingInputField
            inputType={SettingInputFieldType.TEXT}
            label="MOBILE REDIRECT URI"
            bind:value={oauthConfig.mobileRedirectUri}
            required={true}
            disabled={disabled || !oauthConfig.enabled}
            isEdited={!(oauthConfig.mobileRedirectUri == savedConfig.mobileRedirectUri)}
          />
        {/if}

        <SettingButtonsRow
          on:reset={({ detail }) => handleReset(detail)}
          on:save={saveSetting}
          showResetToDefault={!isEqual(savedConfig, defaultConfig)}
          {disabled}
        />
      </form>
    </div>
  {/await}
</div>

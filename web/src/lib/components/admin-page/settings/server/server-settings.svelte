<script lang="ts">
  import SettingButtonsRow from '$lib/components/admin-page/settings/setting-buttons-row.svelte';
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import type { ResetOptions } from '$lib/utils/dipatch';
  import { handleError } from '$lib/utils/handle-error';
  import { api, SystemConfigServerDto } from '@api';
  import { isEqual } from 'lodash-es';
  import { fade } from 'svelte/transition';
  import SettingInputField, { SettingInputFieldType } from '../setting-input-field.svelte';

  export let serverConfig: SystemConfigServerDto; // this is the config that is being edited
  export let disabled = false;

  let savedConfig: SystemConfigServerDto;
  let defaultConfig: SystemConfigServerDto;

  const handleReset = (detail: ResetOptions) => {
    if (detail.default) {
      resetToDefault();
    } else {
      reset();
    }
  };

  async function getConfigs() {
    [savedConfig, defaultConfig] = await Promise.all([
      api.systemConfigApi.getConfig().then((res) => res.data.server),
      api.systemConfigApi.getConfigDefaults().then((res) => res.data.server),
    ]);
  }

  async function reset() {
    const { data: resetConfig } = await api.systemConfigApi.getConfig();

    serverConfig = { ...resetConfig.server };
    savedConfig = { ...resetConfig.server };

    notificationController.show({
      message: '将服务器设置重置为最近保存的设置',
      type: NotificationType.Info,
    });
  }

  async function resetToDefault() {
    const { data: configs } = await api.systemConfigApi.getConfigDefaults();

    serverConfig = { ...configs.server };
    defaultConfig = { ...configs.server };

    notificationController.show({
      message: '将服务器设置重置为默认值',
      type: NotificationType.Info,
    });
  }

  async function saveSetting() {
    try {
      const { data: configs } = await api.systemConfigApi.getConfig();

      const result = await api.systemConfigApi.updateConfig({
        systemConfigDto: {
          ...configs,
          server: serverConfig,
        },
      });

      serverConfig = { ...result.data.server };
      savedConfig = { ...result.data.server };

      notificationController.show({
        message: '服务器设置已保存',
        type: NotificationType.Info,
      });
    } catch (e) {
      handleError(e, '无法保存设置');
    }
  }
</script>

<div>
  {#await getConfigs() then}
    <div in:fade={{ duration: 500 }}>
      <form autocomplete="off" on:submit|preventDefault>
        <div class="mt-2">
          <SettingInputField
            inputType={SettingInputFieldType.TEXT}
            label="外部域名"
            desc="公共分享链接的域名，包括http(s)://"
            bind:value={serverConfig.externalDomain}
            isEdited={serverConfig.externalDomain !== savedConfig.externalDomain}
          />

          <SettingInputField
            inputType={SettingInputFieldType.TEXT}
            label="欢迎消息"
            desc="登录页面上显示的消息。"
            bind:value={serverConfig.loginPageMessage}
            isEdited={serverConfig.loginPageMessage !== savedConfig.loginPageMessage}
          />

          <div class="ml-4">
            <SettingButtonsRow
              on:reset={({ detail }) => handleReset(detail)}
              on:save={saveSetting}
              showResetToDefault={!isEqual(savedConfig, defaultConfig)}
              {disabled}
            />
          </div>
        </div>
      </form>
    </div>
  {/await}
</div>

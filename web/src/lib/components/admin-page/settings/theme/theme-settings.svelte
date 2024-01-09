<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { handleError } from '$lib/utils/handle-error';
  import { api, SystemConfigThemeDto } from '@api';
  import { isEqual } from 'lodash-es';
  import { fade } from 'svelte/transition';
  import SettingButtonsRow from '../setting-buttons-row.svelte';
  import SettingTextarea from '../setting-textarea.svelte';
  import type { ResetOptions } from '$lib/utils/dipatch';

  export let themeConfig: SystemConfigThemeDto; // this is the config that is being edited
  export let disabled = false;

  let savedConfig: SystemConfigThemeDto;
  let defaultConfig: SystemConfigThemeDto;

  const handleReset = (detail: ResetOptions) => {
    if (detail.default) {
      resetToDefault();
    } else {
      reset();
    }
  };

  async function getConfigs() {
    [savedConfig, defaultConfig] = await Promise.all([
      api.systemConfigApi.getConfig().then((res) => res.data.theme),
      api.systemConfigApi.getConfigDefaults().then((res) => res.data.theme),
    ]);
  }

  async function saveSetting() {
    try {
      const { data: current } = await api.systemConfigApi.getConfig();

      const { data: updated } = await api.systemConfigApi.updateConfig({
        systemConfigDto: {
          ...current,
          theme: themeConfig,
        },
      });

      themeConfig = { ...updated.theme };
      savedConfig = { ...updated.theme };

      notificationController.show({ message: '主题已保存', type: NotificationType.Info });
    } catch (error) {
      handleError(error, '无法保存设置');
    }
  }

  async function reset() {
    const { data: resetConfig } = await api.systemConfigApi.getConfig();

    themeConfig = { ...resetConfig.theme };
    savedConfig = { ...resetConfig.theme };

    notificationController.show({
      message: '将主题重置为最近保存的主题',
      type: NotificationType.Info,
    });
  }

  async function resetToDefault() {
    const { data: configs } = await api.systemConfigApi.getConfigDefaults();

    themeConfig = { ...configs.theme };
    defaultConfig = { ...configs.theme };

    notificationController.show({
      message: '将主题重置为默认主题',
      type: NotificationType.Info,
    });
  }
</script>

<div>
  {#await getConfigs() then}
    <div in:fade={{ duration: 500 }}>
      <form autocomplete="off" on:submit|preventDefault>
        <div class="ml-4 mt-4 flex flex-col gap-4">
          <div class="ml-4">
            <SettingTextarea
              {disabled}
              label="自定义CSS"
              desc="层叠样式表（Cascading Style Sheets，CSS）允许自定义Immich的设计"
              bind:value={themeConfig.customCss}
              required={true}
              isEdited={themeConfig.customCss !== savedConfig.customCss}
            />

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

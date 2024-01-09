<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { handleError } from '$lib/utils/handle-error';
  import { api, SystemConfigDto } from '@api';
  import { cloneDeep, isEqual } from 'lodash-es';
  import { fade } from 'svelte/transition';
  import SettingAccordion from '../setting-accordion.svelte';
  import SettingButtonsRow from '../setting-buttons-row.svelte';
  import SettingSwitch from '../setting-switch.svelte';
  import SettingInputField, { SettingInputFieldType } from '../setting-input-field.svelte';
  import type { ResetOptions } from '$lib/utils/dipatch';

  export let config: SystemConfigDto; // this is the config that is being edited
  export let disabled = false;

  let savedConfig: SystemConfigDto;
  let defaultConfig: SystemConfigDto;

  const handleReset = (detail: ResetOptions) => {
    if (detail.default) {
      resetToDefault();
    } else {
      reset();
    }
  };

  async function refreshConfig() {
    [savedConfig, defaultConfig] = await Promise.all([
      api.systemConfigApi.getConfig().then((res) => res.data),
      api.systemConfigApi.getConfigDefaults().then((res) => res.data),
    ]);
  }

  async function saveSetting() {
    try {
      const { data: current } = await api.systemConfigApi.getConfig();
      const { data: updated } = await api.systemConfigApi.updateConfig({
        systemConfigDto: {
          ...current,
          map: {
            enabled: config.map.enabled,
            lightStyle: config.map.lightStyle,
            darkStyle: config.map.darkStyle,
          },
          reverseGeocoding: {
            enabled: config.reverseGeocoding.enabled,
          },
        },
      });

      config = cloneDeep(updated);
      savedConfig = cloneDeep(updated);

      notificationController.show({ message: '设置已保存', type: NotificationType.Info });
    } catch (error) {
      handleError(error, '无法保存设置');
    }
  }

  async function reset() {
    const { data: resetConfig } = await api.systemConfigApi.getConfig();

    config = cloneDeep(resetConfig);
    savedConfig = cloneDeep(resetConfig);

    notificationController.show({
      message: '将设置恢复为最近保存的设置',
      type: NotificationType.Info,
    });
  }

  async function resetToDefault() {
    const { data: configs } = await api.systemConfigApi.getConfigDefaults();

    config = cloneDeep(configs);
    defaultConfig = cloneDeep(configs);

    notificationController.show({
      message: '将地图设置恢复为默认设置',
      type: NotificationType.Info,
    });
  }
</script>

<div class="mt-2">
  {#await refreshConfig() then}
    <div in:fade={{ duration: 500 }}>
      <form autocomplete="off" on:submit|preventDefault>
        <div class="flex flex-col gap-4">
          <SettingAccordion title="地图设置" subtitle="管理地图设置">
            <div class="ml-4 mt-4 flex flex-col gap-4">
              <SettingSwitch
                title="启用"
                {disabled}
                subtitle="启用地图功能"
                bind:checked={config.map.enabled}
              />

              <hr />

              <SettingInputField
                inputType={SettingInputFieldType.TEXT}
                label="日间样式"
                desc="地图主题的style.json文件的URL"
                bind:value={config.map.lightStyle}
                disabled={disabled || !config.map.enabled}
                isEdited={config.map.lightStyle !== savedConfig.map.lightStyle}
              />
              <SettingInputField
                inputType={SettingInputFieldType.TEXT}
                label="黑夜样式"
                desc="地图主题的style.json文件的URL"
                bind:value={config.map.darkStyle}
                disabled={disabled || !config.map.enabled}
                isEdited={config.map.darkStyle !== savedConfig.map.darkStyle}
              />
            </div></SettingAccordion
          >

          <SettingAccordion title="逆地理编码设置">
            <svelte:fragment slot="subtitle">
              <p class="text-sm dark:text-immich-dark-fg">
                管理<a
                  href="https://immich.app/docs/features/reverse-geocoding"
                  class="underline"
                  target="_blank"
                  rel="noreferrer">逆地理编码</a
                >设置
              </p>
            </svelte:fragment>
            <div class="ml-4 mt-4 flex flex-col gap-4">
              <SettingSwitch
                title="启用"
                {disabled}
                subtitle="启用逆地理编码"
                bind:checked={config.reverseGeocoding.enabled}
              />
            </div></SettingAccordion
          >

          <SettingButtonsRow
            on:reset={({ detail }) => handleReset(detail)}
            on:save={saveSetting}
            showResetToDefault={!isEqual(
              { ...savedConfig.map, ...savedConfig.reverseGeocoding },
              { ...defaultConfig.map, ...defaultConfig.reverseGeocoding },
            )}
            {disabled}
          />
        </div>
      </form>
    </div>
  {/await}
</div>

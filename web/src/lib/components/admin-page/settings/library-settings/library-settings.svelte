<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { api, SystemConfigLibraryDto } from '@api';
  import SettingButtonsRow from '../setting-buttons-row.svelte';
  import SettingInputField, { SettingInputFieldType } from '../setting-input-field.svelte';
  import SettingSwitch from '../setting-switch.svelte';
  import { isEqual } from 'lodash-es';
  import { fade } from 'svelte/transition';
  import { handleError } from '../../../../utils/handle-error';
  import SettingAccordion from '../setting-accordion.svelte';
  import type { ResetOptions } from '$lib/utils/dipatch';

  export let libraryConfig: SystemConfigLibraryDto; // this is the config that is being edited
  export let disabled = false;

  const cronExpressionOptions = [
    { title: '每天午夜时分', expression: '0 0 * * *' },
    { title: '每天凌晨2点', expression: '0 2 * * *' },
    { title: '每天下午一点', expression: '0 13 * * *' },
    { title: '每隔6小时', expression: '0 */6 * * *' },
  ];

  let savedConfig: SystemConfigLibraryDto;
  let defaultConfig: SystemConfigLibraryDto;

  const handleReset = (detail: ResetOptions) => {
    if (detail.default) {
      resetToDefault();
    } else {
      reset();
    }
  };

  async function getConfigs() {
    [savedConfig, defaultConfig] = await Promise.all([
      api.systemConfigApi.getConfig().then((res) => res.data.library),
      api.systemConfigApi.getConfigDefaults().then((res) => res.data.library),
    ]);
  }

  async function saveSetting() {
    try {
      const { data: configs } = await api.systemConfigApi.getConfig();

      const result = await api.systemConfigApi.updateConfig({
        systemConfigDto: {
          ...configs,
          library: libraryConfig,
        },
      });

      libraryConfig = { ...result.data.library };
      savedConfig = { ...result.data.library };

      notificationController.show({
        message: 'Library settings saved',
        type: NotificationType.Info,
      });
    } catch (e) {
      handleError(e, 'Unable to save settings');
    }
  }

  async function reset() {
    const { data: resetConfig } = await api.systemConfigApi.getConfig();

    libraryConfig = { ...resetConfig.library };
    savedConfig = { ...resetConfig.library };

    notificationController.show({
      message: 'Reset library settings to the recent saved settings',
      type: NotificationType.Info,
    });
  }

  async function resetToDefault() {
    const { data: configs } = await api.systemConfigApi.getConfigDefaults();

    libraryConfig = { ...configs.library };
    defaultConfig = { ...configs.library };

    notificationController.show({
      message: 'Reset library settings to default',
      type: NotificationType.Info,
    });
  }
</script>

<div>
  {#await getConfigs() then}
    <div in:fade={{ duration: 500 }}>
      <SettingAccordion title="扫描" subtitle="图库扫描设置" isOpen>
        <form autocomplete="off" on:submit|preventDefault>
          <div class="ml-4 mt-4 flex flex-col gap-4">
            <SettingSwitch
              title="启用"
              {disabled}
              subtitle="启用自动图库扫描"
              bind:checked={libraryConfig.scan.enabled}
            />

            <div class="flex flex-col my-2 dark:text-immich-dark-fg">
              <label class="text-sm" for="expression-select">预设的Cron表达式</label>
              <select
                class="p-2 mt-2 text-sm rounded-lg bg-slate-200 hover:cursor-pointer dark:bg-gray-600"
                disabled={disabled || !libraryConfig.scan.enabled}
                name="expression"
                id="expression-select"
                bind:value={libraryConfig.scan.cronExpression}
              >
                {#each cronExpressionOptions as { title, expression }}
                  <option value={expression}>{title}</option>
                {/each}
              </select>
            </div>

            <SettingInputField
              inputType={SettingInputFieldType.TEXT}
              required={true}
              disabled={disabled || !libraryConfig.scan.enabled}
              label="Cron表达式"
              bind:value={libraryConfig.scan.cronExpression}
              isEdited={libraryConfig.scan.cronExpression !== savedConfig.scan.cronExpression}
            >
              <svelte:fragment slot="desc">
                <p class="text-sm dark:text-immich-dark-fg">
                  使用 cron 格式设置扫描间隔。有关更多信息，请参考例如 <a
                    href="https://crontab.guru"
                    class="underline"
                    target="_blank"
                    rel="noreferrer">Crontab Guru</a
                  >
                </p>
              </svelte:fragment>
            </SettingInputField>
          </div>

          <div class="ml-4">
            <SettingButtonsRow
              on:reset={({ detail }) => handleReset(detail)}
              on:save={saveSetting}
              showResetToDefault={!isEqual(savedConfig, defaultConfig)}
              {disabled}
            />
          </div>
        </form>
      </SettingAccordion>
    </div>
  {/await}
</div>

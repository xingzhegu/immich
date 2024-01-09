<script lang="ts">
  import SettingSelect from '$lib/components/admin-page/settings/setting-select.svelte';
  import { api, Colorspace, SystemConfigThumbnailDto } from '@api';
  import { fade } from 'svelte/transition';
  import { isEqual } from 'lodash-es';
  import SettingButtonsRow from '$lib/components/admin-page/settings/setting-buttons-row.svelte';
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import SettingInputField, { SettingInputFieldType } from '../setting-input-field.svelte';
  import SettingSwitch from '../setting-switch.svelte';
  import type { ResetOptions } from '$lib/utils/dipatch';

  export let thumbnailConfig: SystemConfigThumbnailDto; // this is the config that is being edited
  export let disabled = false;

  let savedConfig: SystemConfigThumbnailDto;
  let defaultConfig: SystemConfigThumbnailDto;

  const handleReset = (detail: ResetOptions) => {
    if (detail.default) {
      resetToDefault();
    } else {
      reset();
    }
  };

  async function getConfigs() {
    [savedConfig, defaultConfig] = await Promise.all([
      api.systemConfigApi.getConfig().then((res) => res.data.thumbnail),
      api.systemConfigApi.getConfigDefaults().then((res) => res.data.thumbnail),
    ]);
  }

  async function reset() {
    const { data: resetConfig } = await api.systemConfigApi.getConfig();

    thumbnailConfig = { ...resetConfig.thumbnail };
    savedConfig = { ...resetConfig.thumbnail };

    notificationController.show({
      message: '将缩略图设置重置为最近保存的设置',
      type: NotificationType.Info,
    });
  }

  async function resetToDefault() {
    const { data: configs } = await api.systemConfigApi.getConfigDefaults();

    thumbnailConfig = { ...configs.thumbnail };
    defaultConfig = { ...configs.thumbnail };

    notificationController.show({
      message: '将缩略图设置重置为默认设置',
      type: NotificationType.Info,
    });
  }

  async function saveSetting() {
    try {
      const { data: configs } = await api.systemConfigApi.getConfig();

      const result = await api.systemConfigApi.updateConfig({
        systemConfigDto: {
          ...configs,
          thumbnail: thumbnailConfig,
        },
      });

      thumbnailConfig = { ...result.data.thumbnail };
      savedConfig = { ...result.data.thumbnail };

      notificationController.show({
        message: '缩略图设置已保存',
        type: NotificationType.Info,
      });
    } catch (e) {
      console.error('Error [thumbnail-settings] [saveSetting]', e);
      notificationController.show({
        message: '无法保存设置',
        type: NotificationType.Error,
      });
    }
  }
</script>

<div>
  {#await getConfigs() then}
    <div in:fade={{ duration: 500 }}>
      <form autocomplete="off" on:submit|preventDefault>
        <div class="ml-4 mt-4 flex flex-col gap-4">
          <SettingSelect
            label="小缩略图分辨率"
            desc="在查看照片组（主时间线、相册视图等）时使用。较高的分辨率可以保留更多细节，但编码时间较长，文件大小较大，并可能降低应用程序的响应速度。"
            number
            bind:value={thumbnailConfig.webpSize}
            options={[
              { value: 1080, text: '1080p' },
              { value: 720, text: '720p' },
              { value: 480, text: '480p' },
              { value: 250, text: '250p' },
              { value: 200, text: '200p' },
            ]}
            name="resolution"
            isEdited={thumbnailConfig.webpSize !== savedConfig.webpSize}
            {disabled}
          />

          <SettingSelect
            label="大缩略图分辨率"
            desc="在查看单张照片和机器学习时使用。较高的分辨率可以保留更多细节，但编码时间较长，文件大小较大，并可能降低应用程序的响应速度。"
            number
            bind:value={thumbnailConfig.jpegSize}
            options={[
              { value: 2160, text: '4K' },
              { value: 1440, text: '1440p' },
              { value: 1080, text: '1080p' },
              { value: 720, text: '720p' },
            ]}
            name="resolution"
            isEdited={thumbnailConfig.jpegSize !== savedConfig.jpegSize}
            {disabled}
          />

          <SettingInputField
            inputType={SettingInputFieldType.NUMBER}
            label="质量"
            desc="缩略图质量，范围为1-100。质量越高，文件越大。"
            bind:value={thumbnailConfig.quality}
            isEdited={thumbnailConfig.quality !== savedConfig.quality}
          />

          <SettingSwitch
            title="首选宽色域"
            subtitle="对于缩略图，请使用 Display P3。这样可以更好地保留具有宽色域的图像的鲜艳度，但在旧设备和旧浏览器版本上，图像可能显示不同。将 sRGB 图像保持为 sRGB，以避免颜色偏移。"
            checked={thumbnailConfig.colorspace === Colorspace.P3}
            on:toggle={(e) => (thumbnailConfig.colorspace = e.detail ? Colorspace.P3 : Colorspace.Srgb)}
            isEdited={thumbnailConfig.colorspace !== savedConfig.colorspace}
          />
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
    </div>
  {/await}
</div>

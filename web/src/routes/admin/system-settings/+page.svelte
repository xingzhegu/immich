<script lang="ts">
  import { page } from '$app/stores';
  import FFmpegSettings from '$lib/components/admin-page/settings/ffmpeg/ffmpeg-settings.svelte';
  import JobSettings from '$lib/components/admin-page/settings/job-settings/job-settings.svelte';
  import MachineLearningSettings from '$lib/components/admin-page/settings/machine-learning-settings/machine-learning-settings.svelte';
  import MapSettings from '$lib/components/admin-page/settings/map-settings/map-settings.svelte';
  import OAuthSettings from '$lib/components/admin-page/settings/oauth/oauth-settings.svelte';
  import PasswordLoginSettings from '$lib/components/admin-page/settings/password-login/password-login-settings.svelte';
  import SettingAccordion from '$lib/components/admin-page/settings/setting-accordion.svelte';
  import StorageTemplateSettings from '$lib/components/admin-page/settings/storage-template/storage-template-settings.svelte';
  import ThumbnailSettings from '$lib/components/admin-page/settings/thumbnail/thumbnail-settings.svelte';
  import ServerSettings from '$lib/components/admin-page/settings/server/server-settings.svelte';
  import TrashSettings from '$lib/components/admin-page/settings/trash-settings/trash-settings.svelte';
  import ThemeSettings from '$lib/components/admin-page/settings/theme/theme-settings.svelte';
  import LinkButton from '$lib/components/elements/buttons/link-button.svelte';
  import UserPageLayout from '$lib/components/layouts/user-page-layout.svelte';
  import { downloadManager } from '$lib/stores/download';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { downloadBlob } from '$lib/utils/asset-utils';
  import { copyToClipboard } from '@api';
  import Icon from '$lib/components/elements/icon.svelte';
  import type { PageData } from './$types';
  import NewVersionCheckSettings from '$lib/components/admin-page/settings/new-version-check-settings/new-version-check-settings.svelte';
  import LibrarySettings from '$lib/components/admin-page/settings/library-settings/library-settings.svelte';
  import LoggingSettings from '$lib/components/admin-page/settings/logging-settings/logging-settings.svelte';
  import { mdiAlert, mdiContentCopy, mdiDownload } from '@mdi/js';

  export let data: PageData;

  const configs = data.configs;

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(configs, null, 2)], { type: 'application/json' });
    const downloadKey = 'immich-config.json';
    downloadManager.add(downloadKey, blob.size);
    downloadManager.update(downloadKey, blob.size);
    downloadBlob(blob, downloadKey);
    setTimeout(() => downloadManager.clear(downloadKey), 5_000);
  };
</script>

{#if $featureFlags.configFile}
  <div class="mb-8 flex flex-row items-center gap-2 rounded-md bg-gray-100 p-3 dark:bg-gray-800">
    <Icon path={mdiAlert} class="text-yellow-400" size={18} />
    <h2 class="text-md text-immich-primary dark:text-immich-dark-primary">配置 当前由一个配置文件设置</h2>
  </div>
{/if}

<UserPageLayout title={data.meta.title} admin>
  <div class="flex justify-end gap-2" slot="buttons">
    <LinkButton on:click={() => copyToClipboard(JSON.stringify(configs, null, 2))}>
      <div class="flex place-items-center gap-2 text-sm">
        <Icon path={mdiContentCopy} size="18" />
        复制到剪贴板
      </div>
    </LinkButton>
    <LinkButton on:click={() => downloadConfig()}>
      <div class="flex place-items-center gap-2 text-sm">
        <Icon path={mdiDownload} size="18" />
        导出为 JSON 格式
      </div>
    </LinkButton>
  </div>

  <section id="setting-content" class="flex place-content-center sm:mx-4">
    <section class="w-full pb-28 sm:w-5/6 md:w-[850px]">
      <SettingAccordion
        title="任务设置"
        subtitle="管理任务并发"
        isOpen={$page.url.searchParams.get('open') === 'job-settings'}
      >
        <JobSettings disabled={$featureFlags.configFile} jobConfig={configs.job} />
      </SettingAccordion>

      <SettingAccordion title="图库" subtitle="管理图库设置">
        <LibrarySettings disabled={$featureFlags.configFile} libraryConfig={configs.library} />
      </SettingAccordion>

      <SettingAccordion title="日志" subtitle="管理日志设置">
        <LoggingSettings disabled={$featureFlags.configFile} loggingConfig={configs.logging} />
      </SettingAccordion>

      <SettingAccordion title="机器学习设置" subtitle="管理机器学习功能和设置">
        <MachineLearningSettings disabled={$featureFlags.configFile} machineLearningConfig={configs.machineLearning} />
      </SettingAccordion>

      <SettingAccordion title="地图和定位设置" subtitle="管理与地图相关的功能和设置">
        <MapSettings disabled={$featureFlags.configFile} config={configs} />
      </SettingAccordion>

      <SettingAccordion title="OAuth认证" subtitle="管理使用OAuth设置的登录功能">
        <OAuthSettings disabled={$featureFlags.configFile} oauthConfig={configs.oauth} />
      </SettingAccordion>

      <SettingAccordion title="密码认证" subtitle="管理使用密码设置的登录功能">
        <PasswordLoginSettings disabled={$featureFlags.configFile} passwordLoginConfig={configs.passwordLogin} />
      </SettingAccordion>

      <SettingAccordion title="服务器设置" subtitle="管理服务器设置">
        <ServerSettings disabled={$featureFlags.configFile} serverConfig={configs.server} />
      </SettingAccordion>

      <SettingAccordion
        title="存储模板"
        subtitle="管理上传资源的文件夹结构和文件名"
        isOpen={$page.url.searchParams.get('open') === 'storage-template'}
      >
        <StorageTemplateSettings disabled={$featureFlags.configFile} storageConfig={configs.storageTemplate} />
      </SettingAccordion>

      <SettingAccordion title="主题设置" subtitle="管理Immich网页界面的自定义设置">
        <ThemeSettings disabled={$featureFlags.configFile} themeConfig={configs.theme} />
      </SettingAccordion>

      <SettingAccordion title="缩略图设置" subtitle="管理缩略图尺寸的分辨率">
        <ThumbnailSettings disabled={$featureFlags.configFile} thumbnailConfig={configs.thumbnail} />
      </SettingAccordion>

      <SettingAccordion title="回收站设置" subtitle="管理回收站设置">
        <TrashSettings disabled={$featureFlags.configFile} trashConfig={configs.trash} />
      </SettingAccordion>

      <SettingAccordion title="版本检查" subtitle="启用/禁用新版本通知">
        <NewVersionCheckSettings disabled={$featureFlags.configFile} newVersionCheckConfig={configs.newVersionCheck} />
      </SettingAccordion>

      <SettingAccordion
        title="视频转码设置"
        subtitle="管理视频文件的分辨率和编码信息"
      >
        <FFmpegSettings disabled={$featureFlags.configFile} ffmpegConfig={configs.ffmpeg} />
      </SettingAccordion>
    </section>
  </section>
</UserPageLayout>

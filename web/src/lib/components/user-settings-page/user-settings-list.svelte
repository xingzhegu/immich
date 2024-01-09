<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { APIKeyResponseDto, AuthDeviceResponseDto, oauth } from '@api';
  import SettingAccordion from '../admin-page/settings/setting-accordion.svelte';
  import ChangePasswordSettings from './change-password-settings.svelte';
  import DeviceList from './device-list.svelte';
  import LibraryList from './library-list.svelte';
  import MemoriesSettings from './memories-settings.svelte';
  import OAuthSettings from './oauth-settings.svelte';
  import PartnerSettings from './partner-settings.svelte';
  import SidebarSettings from './sidebar-settings.svelte';
  import UserAPIKeyList from './user-api-key-list.svelte';
  import UserProfileSettings from './user-profile-settings.svelte';
  import { user } from '$lib/stores/user.store';
  import AppearanceSettings from './appearance-settings.svelte';

  export let keys: APIKeyResponseDto[] = [];
  export let devices: AuthDeviceResponseDto[] = [];

  let oauthOpen = false;
  if (browser) {
    oauthOpen = oauth.isCallback(window.location);
  }
</script>

<SettingAccordion title="外观" subtitle="管理Immich外观">
  <AppearanceSettings />
</SettingAccordion>

<SettingAccordion title="账户" subtitle="管理账户">
  <UserProfileSettings user={$user} />
</SettingAccordion>

<SettingAccordion title="API Keys" subtitle="管理API keys">
  <UserAPIKeyList bind:keys />
</SettingAccordion>

<SettingAccordion title="授权设备" subtitle="管理已登录设备">
  <DeviceList bind:devices />
</SettingAccordion>

<SettingAccordion title="图库" subtitle="管理资源库">
  <LibraryList />
</SettingAccordion>

<SettingAccordion title="回忆" subtitle="管理回忆中看到的内容。">
  <MemoriesSettings user={$user} />
</SettingAccordion>

{#if $featureFlags.loaded && $featureFlags.oauth}
  <SettingAccordion
    title="OAuth"
    subtitle="管理OAuth连接"
    isOpen={oauthOpen || $page.url.searchParams.get('open') === 'oauth'}
  >
    <OAuthSettings user={$user} />
  </SettingAccordion>
{/if}

<SettingAccordion title="密码" subtitle="修改密码">
  <ChangePasswordSettings />
</SettingAccordion>

<SettingAccordion title="分享" subtitle="管理与伙伴的分享">
  <PartnerSettings user={$user} />
</SettingAccordion>

<SettingAccordion title="侧边栏" subtitle="管理侧边栏设置">
  <SidebarSettings />
</SettingAccordion>

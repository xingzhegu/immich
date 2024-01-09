<script lang="ts">
  import type { ServerVersionResponseDto } from '@api';
  import { websocketStore } from '$lib/stores/websocket';
  import Button from '../elements/buttons/button.svelte';
  import FullScreenModal from './full-screen-modal.svelte';

  let showModal = false;

  const { onRelease } = websocketStore;

  const semverToName = ({ major, minor, patch }: ServerVersionResponseDto) => `v${major}.${minor}.${patch}`;

  $: releaseVersion = $onRelease && semverToName($onRelease.releaseVersion);
  $: serverVersion = $onRelease && semverToName($onRelease.serverVersion);
  $: $onRelease?.isAvailable && handleRelease();

  const onAcknowledge = () => {
    localStorage.setItem('appVersion', releaseVersion);
    showModal = false;
  };

  const handleRelease = () => {
    try {
      if (localStorage.getItem('appVersion') === releaseVersion) {
        return;
      }

      showModal = true;
    } catch (err) {
      console.error('Error [VersionAnnouncementBox]:', err);
    }
  };
</script>

{#if showModal}
  <FullScreenModal on:clickOutside={() => (showModal = false)}>
    <div
      class="max-w-lg rounded-3xl border bg-immich-bg px-8 py-10 shadow-sm dark:border-immich-dark-gray dark:bg-immich-dark-gray dark:text-immich-dark-fg"
    >
      <p class="mb-4 text-2xl">🎉 有新版本可用 🎉</p>

      <div>
        你好朋友，<span class="font-immich-title font-bold text-immich-primary dark:text-immich-dark-primary">IMMICH</span>有一个新版本发布了，
        请您花点时间访问
        <span class="font-medium underline"
          ><a href="https://github.com/immich-app/immich/releases/latest" target="_blank" rel="noopener noreferrer"
            >release notes</a
          ></span
        >
        请确保您的<code>docker-compose</code>和<code>.env</code>配置是最新的，以防止任何配置错误，
        特别是如果您使用WatchTower或任何自动更新应用程序的机制，请确保配置正确。
      </div>

      <div class="mt-4 font-medium">你的朋友, Alex</div>

      <div class="font-sm mt-8">
        <code>服务器版本: {serverVersion}</code>
        <br />
        <code>最新版本: {releaseVersion}</code>
      </div>

      <div class="mt-8 text-right">
        <Button fullwidth on:click={onAcknowledge}>已确认</Button>
      </div>
    </div>
  </FullScreenModal>
{/if}

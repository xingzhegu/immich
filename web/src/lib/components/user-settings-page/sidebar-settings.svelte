<script lang="ts">
  import { fade } from 'svelte/transition';
  import { sidebarSettings } from '../../stores/preferences.store';
  import SettingSwitch from '../admin-page/settings/setting-switch.svelte';
</script>

<section class="my-4">
  <div in:fade={{ duration: 500 }}>
    <div class="ml-4 mt-4 flex flex-col gap-4">
      <div class="ml-4">
        <SettingSwitch title="人物" subtitle="显示一个指向'人物'的链接" bind:checked={$sidebarSettings.people} />
      </div>
      <div class="ml-4">
        <SettingSwitch title="分享" subtitle="显示一个指向'分享'的链接" bind:checked={$sidebarSettings.sharing} />
      </div>
    </div>
  </div>
</section>

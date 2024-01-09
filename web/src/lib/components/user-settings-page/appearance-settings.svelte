<script lang="ts">
  import { fade } from 'svelte/transition';
  import { colorTheme } from '../../stores/preferences.store';
  import SettingSwitch from '../admin-page/settings/setting-switch.svelte';

  export const handleToggle = () => {
    $colorTheme.system = !$colorTheme.system;
  };
</script>

<section class="my-4">
  <div in:fade={{ duration: 500 }}>
    <div class="ml-4 mt-4 flex flex-col gap-4">
      <div class="ml-4">
        <SettingSwitch
          title="主题选择"
          subtitle="根据您的浏览器系统偏好，自动将主题设置为浅色或深色"
          bind:checked={$colorTheme.system}
          on:toggle={handleToggle}
        />
      </div>
    </div>
  </div>
</section>

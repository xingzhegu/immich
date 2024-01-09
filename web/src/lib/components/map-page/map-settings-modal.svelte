<script lang="ts">
  import FullScreenModal from '$lib/components/shared-components/full-screen-modal.svelte';
  import type { MapSettings } from '$lib/stores/preferences.store';
  import { Duration } from 'luxon';
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import SettingSelect from '../admin-page/settings/setting-select.svelte';
  import SettingSwitch from '../admin-page/settings/setting-switch.svelte';
  import Button from '../elements/buttons/button.svelte';
  import LinkButton from '../elements/buttons/link-button.svelte';

  export let settings: MapSettings;
  let customDateRange = !!settings.dateAfter || !!settings.dateBefore;

  const dispatch = createEventDispatcher<{
    close: void;
    save: MapSettings;
  }>();

  const handleClose = () => dispatch('close');
</script>

<FullScreenModal on:clickOutside={handleClose} on:escape={handleClose}>
  <div
    class="flex w-96 max-w-lg flex-col gap-8 rounded-3xl border bg-white p-8 shadow-sm dark:border-immich-dark-gray dark:bg-immich-dark-gray"
  >
    <h1 class="self-center text-2xl font-medium text-immich-primary dark:text-immich-dark-primary">地图设置</h1>

    <form
      on:submit|preventDefault={() => dispatch('save', settings)}
      class="flex flex-col gap-4 text-immich-primary dark:text-immich-dark-primary"
    >
      <SettingSwitch title="允许暗黑模式" bind:checked={settings.allowDarkMode} />
      <SettingSwitch title="仅收藏夹" bind:checked={settings.onlyFavorites} />
      <SettingSwitch title="包括已存档的内容" bind:checked={settings.includeArchived} />
      {#if customDateRange}
        <div in:fly={{ y: 10, duration: 200 }} class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-8">
            <label class="immich-form-label shrink-0 text-sm" for="date-after">之后</label>
            <input
              class="immich-form-input w-40"
              type="date"
              id="date-after"
              max={settings.dateBefore}
              bind:value={settings.dateAfter}
            />
          </div>
          <div class="flex items-center justify-between gap-8">
            <label class="immich-form-label shrink-0 text-sm" for="date-before">之前</label>
            <input class="immich-form-input w-40" type="date" id="date-before" bind:value={settings.dateBefore} />
          </div>
          <div class="flex justify-center text-xs">
            <LinkButton
              on:click={() => {
                customDateRange = false;
                settings.dateAfter = '';
                settings.dateBefore = '';
              }}
            >
              移除自定义日期范围
            </LinkButton>
          </div>
        </div>
      {:else}
        <div in:fly={{ y: -10, duration: 200 }} class="flex flex-col gap-1">
          <SettingSelect
            label="日期范围"
            name="date-range"
            bind:value={settings.relativeDate}
            options={[
              {
                value: '',
                text: '所有',
              },
              {
                value: Duration.fromObject({ hours: 24 }).toISO() || '',
                text: '过去24小时',
              },
              {
                value: Duration.fromObject({ days: 7 }).toISO() || '',
                text: '过去7天',
              },
              {
                value: Duration.fromObject({ days: 30 }).toISO() || '',
                text: '过去30天',
              },
              {
                value: Duration.fromObject({ years: 1 }).toISO() || '',
                text: '过去1年',
              },
              {
                value: Duration.fromObject({ years: 3 }).toISO() || '',
                text: '过去3年',
              },
            ]}
          />
          <div class="text-xs">
            <LinkButton
              on:click={() => {
                customDateRange = true;
                settings.relativeDate = '';
              }}
            >
              使用自定义日期范围
            </LinkButton>
          </div>
        </div>
      {/if}

      <div class="mt-4 flex w-full gap-4">
        <Button color="gray" size="sm" fullwidth on:click={handleClose}>取消</Button>
        <Button type="submit" size="sm" fullwidth>保存</Button>
      </div>
    </form>
  </div>
</FullScreenModal>

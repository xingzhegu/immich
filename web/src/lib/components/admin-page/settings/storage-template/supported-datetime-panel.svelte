<script lang="ts">
  import type { SystemConfigTemplateStorageOptionDto } from '@api';
  import * as luxon from 'luxon';

  export let options: SystemConfigTemplateStorageOptionDto;

  const getLuxonExample = (format: string) => {
    return luxon.DateTime.fromISO(new Date('2022-09-04T20:03:05.250').toISOString()).toFormat(format);
  };
</script>

<div class="mt-2 text-sm">
  <h4>日期 & 时间</h4>
</div>

<div class="mt-2 rounded-lg bg-gray-200 p-4 text-xs dark:bg-gray-700 dark:text-immich-dark-fg">
  <div class="mb-2 text-gray-600 dark:text-immich-dark-fg">
    <p>资源的创建时间戳被用作日期时间信息。</p>
    <p>时间例子 2022-02-03T04:56:05.250</p>
  </div>
  <div class="flex gap-[40px]">
    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">年</p>
      <ul>
        {#each options.yearOptions as yearFormat}
          <li>{'{{'}{yearFormat}{'}}'} - {getLuxonExample(yearFormat)}</li>
        {/each}
      </ul>
    </div>

    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">月</p>
      <ul>
        {#each options.monthOptions as monthFormat}
          <li>{'{{'}{monthFormat}{'}}'} - {getLuxonExample(monthFormat)}</li>
        {/each}
      </ul>
    </div>

    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">周</p>
      <ul>
        {#each options.weekOptions as weekFormat}
          <li>{'{{'}{weekFormat}{'}}'} - {getLuxonExample(weekFormat)}</li>
        {/each}
      </ul>
    </div>

    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">日</p>
      <ul>
        {#each options.dayOptions as dayFormat}
          <li>{'{{'}{dayFormat}{'}}'} - {getLuxonExample(dayFormat)}</li>
        {/each}
      </ul>
    </div>

    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">时</p>
      <ul>
        {#each options.hourOptions as dayFormat}
          <li>{'{{'}{dayFormat}{'}}'} - {getLuxonExample(dayFormat)}</li>
        {/each}
      </ul>
    </div>

    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">分</p>
      <ul>
        {#each options.minuteOptions as dayFormat}
          <li>{'{{'}{dayFormat}{'}}'} - {getLuxonExample(dayFormat)}</li>
        {/each}
      </ul>
    </div>

    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">秒</p>
      <ul>
        {#each options.secondOptions as dayFormat}
          <li>{'{{'}{dayFormat}{'}}'} - {getLuxonExample(dayFormat)}</li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { handleError } from '$lib/utils/handle-error';
  import { api, SystemConfigMachineLearningDto } from '@api';
  import { isEqual } from 'lodash-es';
  import { fade } from 'svelte/transition';
  import SettingButtonsRow from '../setting-buttons-row.svelte';
  import SettingInputField, { SettingInputFieldType } from '../setting-input-field.svelte';
  import SettingSwitch from '../setting-switch.svelte';
  import SettingAccordion from '../setting-accordion.svelte';
  import SettingSelect from '../setting-select.svelte';
  import type { ResetOptions } from '$lib/utils/dipatch';

  export let machineLearningConfig: SystemConfigMachineLearningDto; // this is the config that is being edited
  export let disabled = false;

  let savedConfig: SystemConfigMachineLearningDto;
  let defaultConfig: SystemConfigMachineLearningDto;

  async function refreshConfig() {
    [savedConfig, defaultConfig] = await Promise.all([
      api.systemConfigApi.getConfig().then((res) => res.data.machineLearning),
      api.systemConfigApi.getConfigDefaults().then((res) => res.data.machineLearning),
    ]);
  }

  async function reset() {
    const { data: resetConfig } = await api.systemConfigApi.getConfig();
    machineLearningConfig = { ...resetConfig.machineLearning };
    savedConfig = { ...resetConfig.machineLearning };
    notificationController.show({ message: '将设置恢复为最近保存的设置', type: NotificationType.Info });
  }

  const handleReset = (detail: ResetOptions) => {
    if (detail.default) {
      resetToDefault();
    } else {
      reset();
    }
  };

  async function saveSetting() {
    try {
      const { data: current } = await api.systemConfigApi.getConfig();
      const result = await api.systemConfigApi.updateConfig({
        systemConfigDto: { ...current, machineLearning: machineLearningConfig },
      });

      machineLearningConfig = { ...result.data.machineLearning };
      savedConfig = { ...result.data.machineLearning };

      notificationController.show({ message: '设置已保存', type: NotificationType.Info });
    } catch (error) {
      handleError(error, '无法保存设置');
    }
  }

  async function resetToDefault() {
    machineLearningConfig = { ...defaultConfig };
    notificationController.show({ message: '将设置恢复为默认设置', type: NotificationType.Info });
  }
</script>

<div class="mt-2">
  {#await refreshConfig() then}
    <div in:fade={{ duration: 500 }}>
      <form autocomplete="off" on:submit|preventDefault class="mx-4 mt-4">
        <div class="flex flex-col gap-4">
          <SettingSwitch
            title="启用"
            subtitle="如果禁用，则无论下面的设置如何，所有的机器学习功能都将被禁用。"
            {disabled}
            bind:checked={machineLearningConfig.enabled}
          />

          <hr />

          <SettingInputField
            inputType={SettingInputFieldType.TEXT}
            label="URL"
            desc="机器学习服务的URL"
            bind:value={machineLearningConfig.url}
            required={true}
            disabled={disabled || !machineLearningConfig.enabled}
            isEdited={machineLearningConfig.url !== savedConfig.url}
          />
        </div>

        <SettingAccordion title="智慧搜索" subtitle="使用内嵌的CLIP来语义搜索图像">
          <div class="ml-4 mt-4 flex flex-col gap-4">
            <SettingSwitch
              title="启用"
              subtitle="如果禁用，则图像将不会进行编码以进行智能搜索。"
              bind:checked={machineLearningConfig.clip.enabled}
              disabled={disabled || !machineLearningConfig.enabled}
            />

            <hr />

            <SettingInputField
              inputType={SettingInputFieldType.TEXT}
              label="CLIP模型"
              bind:value={machineLearningConfig.clip.modelName}
              required={true}
              disabled={disabled || !machineLearningConfig.enabled || !machineLearningConfig.clip.enabled}
              isEdited={machineLearningConfig.clip.modelName !== savedConfig.clip.modelName}
            >
              <p slot="desc" class="immich-form-label pb-2 text-sm">
				<a href="https://huggingface.co/immich-app"><u>这里</u></a>列出一些CLIP模型的名称。请注意，在更改模型后，您必须重新运行"Encode CLIP"任务来对所有图像进行编码。
              </p>
            </SettingInputField>
          </div>
        </SettingAccordion>

        <SettingAccordion title="人脸识别" subtitle="在图像中检测、识别和分组人脸">
          <div class="ml-4 mt-4 flex flex-col gap-4">
            <SettingSwitch
              title="启用"
              subtitle="如果禁用，则图像将不会进行人脸识别编码，并且不会在探索页面的人物部分显示。"
              bind:checked={machineLearningConfig.facialRecognition.enabled}
              disabled={disabled || !machineLearningConfig.enabled}
            />

            <hr />

            <SettingSelect
              label="人脸识别模型"
              desc="模型按照大小降序列出。较大的模型速度较慢，占用更多内存，但能产生更好的结果。请注意，在更改模型后，您必须重新运行'Recognize Faces'任务来对所有图像进行人脸识别。"
              name="facial-recognition-model"
              bind:value={machineLearningConfig.facialRecognition.modelName}
              options={[
                { value: 'antelopev2', text: 'antelopev2' },
                { value: 'buffalo_l', text: 'buffalo_l' },
                { value: 'buffalo_m', text: 'buffalo_m' },
                { value: 'buffalo_s', text: 'buffalo_s' },
              ]}
              disabled={disabled || !machineLearningConfig.enabled || !machineLearningConfig.facialRecognition.enabled}
              isEdited={machineLearningConfig.facialRecognition.modelName !== savedConfig.facialRecognition.modelName}
            />

            <SettingInputField
              inputType={SettingInputFieldType.NUMBER}
              label="最低检测分数"
              desc="人脸检测的最低置信度分数，取值范围为 0 到 1。较低的值将检测到更多的人脸，但可能会导致误报。"
              bind:value={machineLearningConfig.facialRecognition.minScore}
              step="0.1"
              min="0"
              max="1"
              disabled={disabled || !machineLearningConfig.enabled || !machineLearningConfig.facialRecognition.enabled}
              isEdited={machineLearningConfig.facialRecognition.minScore !== savedConfig.facialRecognition.minScore}
            />

            <SettingInputField
              inputType={SettingInputFieldType.NUMBER}
              label="最大识别距离"
              desc="两个人脸被认为是同一个人的最大距离，取值范围为 0 到 2。降低此值可以防止将两个人标记为同一个人，而增加它可以防止将同一个人标记为两个不同的人。请注意，合并两个人比将一个人分成两个人更容易，因此尽可能选择较低的阈值。"
              bind:value={machineLearningConfig.facialRecognition.maxDistance}
              step="0.1"
              min="0"
              max="2"
              disabled={disabled || !machineLearningConfig.enabled || !machineLearningConfig.facialRecognition.enabled}
              isEdited={machineLearningConfig.facialRecognition.maxDistance !==
                savedConfig.facialRecognition.maxDistance}
            />

            <SettingInputField
              inputType={SettingInputFieldType.NUMBER}
              label="最小检测到的人脸数"
              desc="必须检测到的人脸数的最小值，以使其在'人物'标签中显示。将此值设置为大于 1 的值可以防止显示那些不是图像主题的陌生人或模糊的人脸。"
              bind:value={machineLearningConfig.facialRecognition.minFaces}
              step="1"
              min="1"
              disabled={disabled || !machineLearningConfig.enabled || !machineLearningConfig.facialRecognition.enabled}
              isEdited={machineLearningConfig.facialRecognition.minFaces !== savedConfig.facialRecognition.minFaces}
            />
          </div>
        </SettingAccordion>

        <SettingButtonsRow
          on:reset={({ detail }) => handleReset(detail)}
          on:save={saveSetting}
          showResetToDefault={!isEqual(savedConfig, defaultConfig)}
          {disabled}
        />
      </form>
    </div>
  {/await}
</div>

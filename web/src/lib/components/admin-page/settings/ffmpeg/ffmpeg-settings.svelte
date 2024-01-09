<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import {
    api,
    AudioCodec,
    CQMode,
    SystemConfigFFmpegDto,
    ToneMapping,
    TranscodeHWAccel,
    TranscodePolicy,
    VideoCodec,
  } from '@api';
  import SettingButtonsRow from '../setting-buttons-row.svelte';
  import SettingInputField, { SettingInputFieldType } from '../setting-input-field.svelte';
  import SettingSelect from '../setting-select.svelte';
  import SettingSwitch from '../setting-switch.svelte';
  import { isEqual } from 'lodash-es';
  import { fade } from 'svelte/transition';
  import SettingAccordion from '../setting-accordion.svelte';
  import { mdiHelpCircleOutline } from '@mdi/js';
  import Icon from '$lib/components/elements/icon.svelte';
  import type { ResetOptions } from '$lib/utils/dipatch';

  export let ffmpegConfig: SystemConfigFFmpegDto; // this is the config that is being edited
  export let disabled = false;

  let savedConfig: SystemConfigFFmpegDto;
  let defaultConfig: SystemConfigFFmpegDto;

  async function getConfigs() {
    [savedConfig, defaultConfig] = await Promise.all([
      api.systemConfigApi.getConfig().then((res) => res.data.ffmpeg),
      api.systemConfigApi.getConfigDefaults().then((res) => res.data.ffmpeg),
    ]);
  }

  async function saveSetting() {
    try {
      const { data: configs } = await api.systemConfigApi.getConfig();

      const result = await api.systemConfigApi.updateConfig({
        systemConfigDto: {
          ...configs,
          ffmpeg: ffmpegConfig,
        },
      });

      ffmpegConfig = { ...result.data.ffmpeg };
      savedConfig = { ...result.data.ffmpeg };

      notificationController.show({
        message: 'FFmpeg设置已保存',
        type: NotificationType.Info,
      });
    } catch (e) {
      console.error('Error [ffmpeg-settings] [saveSetting]', e);
      notificationController.show({
        message: '无法保存设置',
        type: NotificationType.Error,
      });
    }
  }

  const handleReset = (detail: ResetOptions) => {
    if (detail.default) {
      resetToDefault();
    } else {
      reset();
    }
  };

  async function reset() {
    const { data: resetConfig } = await api.systemConfigApi.getConfig();

    ffmpegConfig = { ...resetConfig.ffmpeg };
    savedConfig = { ...resetConfig.ffmpeg };

    notificationController.show({
      message: '将FFmpeg设置重置为最近保存的设置',
      type: NotificationType.Info,
    });
  }

  async function resetToDefault() {
    const { data: configs } = await api.systemConfigApi.getConfigDefaults();

    ffmpegConfig = { ...configs.ffmpeg };
    defaultConfig = { ...configs.ffmpeg };

    notificationController.show({
      message: '将FFmpeg设置重置为默认设置',
      type: NotificationType.Info,
    });
  }
</script>

<div>
  {#await getConfigs() then}
    <div in:fade={{ duration: 500 }}>
      <form autocomplete="off" on:submit|preventDefault>
        <div class="ml-4 mt-4 flex flex-col gap-4">
          <p class="text-sm dark:text-immich-dark-fg">
            <Icon path={mdiHelpCircleOutline} class="inline" size="15" />
            要了解更多关于此处使用的术语，请参考 FFmpeg 文档中的以下内容：
            <a href="https://trac.ffmpeg.org/wiki/Encode/H.264" class="underline" target="_blank" rel="noreferrer"
              >H.264编解码器</a
            >,
            <a href="https://trac.ffmpeg.org/wiki/Encode/H.265" class="underline" target="_blank" rel="noreferrer"
              >HEVC编解码器</a
            >
            和
            <a href="https://trac.ffmpeg.org/wiki/Encode/VP9" class="underline" target="_blank" rel="noreferrer"
              >VP9编解码器</a
            >.
          </p>

          <SettingInputField
            inputType={SettingInputFieldType.NUMBER}
            {disabled}
            label="常量码率因子(-crf)"
            desc="视频质量级别。典型值为 H.264 的 23，HEVC 的 28，以及 VP9 的 31。数值越低质量越好，但编码时间更长，生成的文件更大。"
            bind:value={ffmpegConfig.crf}
            required={true}
            isEdited={ffmpegConfig.crf !== savedConfig.crf}
          />

          <SettingSelect
            label="预设(-preset)"
            {disabled}
            desc="压缩速度（Compression speed，-preset）。较慢的预设会生成较小的文件，并在以特定比特率为目标时提高质量。VP9 在'faster'以上的速度设置将被忽略。"
            bind:value={ffmpegConfig.preset}
            name="preset"
            options={[
              { value: 'ultrafast', text: 'ultrafast' },
              { value: 'superfast', text: 'superfast' },
              { value: 'veryfast', text: 'veryfast' },
              { value: 'faster', text: 'faster' },
              { value: 'fast', text: 'fast' },
              { value: 'medium', text: 'medium' },
              { value: 'slow', text: 'slow' },
              { value: 'slower', text: 'slower' },
              { value: 'veryslow', text: 'veryslow' },
            ]}
            isEdited={ffmpegConfig.preset !== savedConfig.preset}
          />

          <SettingSelect
            label="音频编解码器"
            {disabled}
            desc="Opus是最高质量的选项，但与旧设备或软件的兼容性较低。"
            bind:value={ffmpegConfig.targetAudioCodec}
            options={[
              { value: AudioCodec.Aac, text: 'aac' },
              { value: AudioCodec.Mp3, text: 'mp3' },
              { value: AudioCodec.Libopus, text: 'opus' },
            ]}
            name="acodec"
            isEdited={ffmpegConfig.targetAudioCodec !== savedConfig.targetAudioCodec}
          />

          <SettingSelect
            label="视频编解码器"
            {disabled}
            desc="VP9 具有高效性和网络兼容性，但转码时间较长。HEVC 的性能类似，但网络兼容性较低。H.264 具有广泛的兼容性，并且转码速度较快，但生成的文件较大。"
            bind:value={ffmpegConfig.targetVideoCodec}
            options={[
              { value: VideoCodec.H264, text: 'h264' },
              { value: VideoCodec.Hevc, text: 'hevc' },
              { value: VideoCodec.Vp9, text: 'vp9' },
            ]}
            name="vcodec"
            isEdited={ffmpegConfig.targetVideoCodec !== savedConfig.targetVideoCodec}
          />

          <SettingSelect
            label="目标分辨率"
            {disabled}
            desc="较高的分辨率可以保留更多细节，但编码时间较长，文件大小较大，并可能降低应用程序的响应速度。"
            bind:value={ffmpegConfig.targetResolution}
            options={[
              { value: '2160', text: '4k' },
              { value: '1440', text: '1440p' },
              { value: '1080', text: '1080p' },
              { value: '720', text: '720p' },
              { value: '480', text: '480p' },
              { value: 'original', text: 'original' },
            ]}
            name="resolution"
            isEdited={ffmpegConfig.targetResolution !== savedConfig.targetResolution}
          />

          <SettingInputField
            inputType={SettingInputFieldType.TEXT}
            {disabled}
            label="最大比特率"
            desc="设置最大比特率可以使文件大小更可预测，但会稍微降低质量。在 720p 分辨率下，典型值为 VP9 或 HEVC 的 2600k，或者 H.264 的 4500k。如果设置为 0，则禁用最大比特率限制。"
            bind:value={ffmpegConfig.maxBitrate}
            isEdited={ffmpegConfig.maxBitrate !== savedConfig.maxBitrate}
          />

          <SettingInputField
            inputType={SettingInputFieldType.NUMBER}
            {disabled}
            label="线程数"
            desc="较高的值会加快编码速度，但在活动期间会减少服务器处理其他任务的空间。此值不应超过 CPU 核心数。如果设置为 0，则最大化利用率。"
            bind:value={ffmpegConfig.threads}
            isEdited={ffmpegConfig.threads !== savedConfig.threads}
          />

          <SettingSelect
            label="转码策略"
            {disabled}
            desc="视频转码的策略，即确定何时应进行视频转码的规则。"
            bind:value={ffmpegConfig.transcode}
            name="transcode"
            options={[
              { value: TranscodePolicy.All, text: '全部视频' },
              {
                value: TranscodePolicy.Optimal,
                text: '视频高于目标分辨率或不符合期望格式的视频应该进行转码',
              },
              {
                value: TranscodePolicy.Required,
                text: '只有不符合期望格式的视频才需要进行转码',
              },
              {
                value: TranscodePolicy.Disabled,
                text: "不要对任何视频进行转码，这可能会导致某些客户端无法正常播放",
              },
            ]}
            isEdited={ffmpegConfig.transcode !== savedConfig.transcode}
          />

          <SettingSelect
            label="色调映射"
            {disabled}
            desc="色调映射（Tone-mapping）是在将 HDR 视频转换为 SDR 时尽量保留其外观的过程。每种算法在颜色、细节和亮度方面进行不同的权衡。Hable 算法保留细节，Mobius 算法保留颜色，而 Reinhard 算法保留亮度。"
            bind:value={ffmpegConfig.tonemap}
            name="tonemap"
            options={[
              {
                value: ToneMapping.Hable,
                text: 'Hable',
              },
              {
                value: ToneMapping.Mobius,
                text: 'Mobius',
              },
              {
                value: ToneMapping.Reinhard,
                text: 'Reinhard',
              },
              {
                value: ToneMapping.Disabled,
                text: 'Disabled',
              },
            ]}
            isEdited={ffmpegConfig.tonemap !== savedConfig.tonemap}
          />

          <SettingSwitch
            title="双通道编码"
            {disabled}
            subtitle="进行两次转码以产生更好的编码视频。当启用最大比特率（与H.264和HEVC兼容所需）时，此模式使用基于最大比特率的比特率范围，并忽略CRF。对于VP9，如果禁用最大比特率，则可以使用CRF。"
            bind:checked={ffmpegConfig.twoPass}
            isEdited={ffmpegConfig.twoPass !== savedConfig.twoPass}
          />

          <SettingAccordion
            title="硬件加速"
            subtitle="实验性的；速度更快，但在相同比特率下会降低质量。"
          >
            <div class="ml-4 mt-4 flex flex-col gap-4">
              <SettingSelect
                label="加速 API"
                {disabled}
                desc="这个 API 将与您的设备进行交互，以加速转码。这个设置是'尽力而为'的：如果失败，它将回退到软件转码。对于 VP9，它可能会根据您的硬件情况而工作或不工作。"
                bind:value={ffmpegConfig.accel}
                name="accel"
                options={[
                  { value: TranscodeHWAccel.Nvenc, text: 'NVENC (requires NVIDIA GPU)' },
                  {
                    value: TranscodeHWAccel.Qsv,
                    text: 'Quick Sync (requires 7th gen Intel CPU or later)',
                  },
                  {
                    value: TranscodeHWAccel.Vaapi,
                    text: 'VAAPI',
                  },
                  {
                    value: TranscodeHWAccel.Rkmpp,
                    text: 'RKMPP (only on Rockchip SOCs)',
                  },
                  {
                    value: TranscodeHWAccel.Disabled,
                    text: 'Disabled',
                  },
                ]}
                isEdited={ffmpegConfig.accel !== savedConfig.accel}
              />

              <SettingSelect
                label="恒定质量模式"
                desc="ICQ（智能恒定质量）模式比 CQP（恒定量化参数）模式更好，但某些硬件加速设备不支持此模式。在使用基于质量的编码时，设置此选项将优先选择指定的模式。由于 NVENC 不支持 ICQ，因此此选项将被忽略。"
                bind:value={ffmpegConfig.cqMode}
                options={[
                  { value: CQMode.Auto, text: 'Auto' },
                  { value: CQMode.Icq, text: 'ICQ' },
                  { value: CQMode.Cqp, text: 'CQP' },
                ]}
                isEdited={ffmpegConfig.cqMode !== savedConfig.cqMode}
              />

              <SettingSwitch
                title="时域自适应量化"
                {disabled}
                subtitle="仅适用于 NVENC。提高高细节、低运动场景的质量。可能与旧设备不兼容。"
                bind:checked={ffmpegConfig.temporalAQ}
                isEdited={ffmpegConfig.temporalAQ !== savedConfig.temporalAQ}
              />
            </div>
          </SettingAccordion>

          <SettingAccordion title="高级设置" subtitle="大多数用户不需要更改的选项">
            <div class="ml-4 mt-4 flex flex-col gap-4">
              <SettingInputField
                inputType={SettingInputFieldType.NUMBER}
                label="TONE-MAPPING NPL"
                desc="颜色将根据显示器亮度进行调整，以使其看起来正常。与直觉相反，较低的值会增加视频的亮度，反之亦然，因为它会补偿显示器的亮度。设置为0将自动设置该值。"
                bind:value={ffmpegConfig.npl}
                isEdited={ffmpegConfig.npl !== savedConfig.npl}
              />

              <SettingInputField
                inputType={SettingInputFieldType.NUMBER}
                label="MAX B-FRAMES"
                desc="较高的值可以提高压缩效率，但会减慢编码速度。在旧设备上可能与硬件加速不兼容。设置为0将禁用B帧，而设置为-1将自动设置该值。"
                bind:value={ffmpegConfig.bframes}
                isEdited={ffmpegConfig.bframes !== savedConfig.bframes}
              />

              <SettingInputField
                inputType={SettingInputFieldType.NUMBER}
                label="REFERENCE FRAMES"
                desc="在压缩给定帧时参考的帧数。较高的值可以提高压缩效率，但会减慢编码速度。设置为0将自动设置该值。"
                bind:value={ffmpegConfig.refs}
                isEdited={ffmpegConfig.refs !== savedConfig.refs}
              />

              <SettingInputField
                inputType={SettingInputFieldType.NUMBER}
                label="MAX KEYFRAME INTERVAL"
                desc="设置关键帧之间的最大帧距离。较低的值会降低压缩效率，但可以改善查找时间，并在快速移动的场景中可能提高质量。设置为0将自动设置该值。"
                bind:value={ffmpegConfig.gopSize}
                isEdited={ffmpegConfig.gopSize !== savedConfig.gopSize}
              />
            </div>
          </SettingAccordion>
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

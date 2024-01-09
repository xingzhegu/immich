<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { handleError } from '$lib/utils/handle-error';
  import { AllJobStatusResponseDto, api, JobCommand, JobCommandDto, JobName } from '@api';
  import type { ComponentType } from 'svelte';
  import {
    mdiFaceRecognition,
    mdiFileJpgBox,
    mdiFileXmlBox,
    mdiFolderMove,
    mdiImageSearch,
    mdiLibraryShelves,
    mdiTable,
    mdiVideo,
  } from '@mdi/js';
  import ConfirmDialogue from '../../shared-components/confirm-dialogue.svelte';
  import JobTile from './job-tile.svelte';
  import StorageMigrationDescription from './storage-migration-description.svelte';

  export let jobs: AllJobStatusResponseDto;

  interface JobDetails {
    title: string;
    subtitle?: string;
    allText?: string;
    missingText?: string;
    disabled?: boolean;
    icon: string;
    allowForceCommand?: boolean;
    component?: ComponentType;
    handleCommand?: (jobId: JobName, jobCommand: JobCommandDto) => Promise<void>;
  }

  let faceConfirm = false;

  const handleFaceCommand = async (jobId: JobName, dto: JobCommandDto) => {
    if (dto.force) {
      faceConfirm = true;
      return;
    }

    await handleCommand(jobId, dto);
  };

  const onFaceConfirm = () => {
    faceConfirm = false;
    handleCommand(JobName.RecognizeFaces, { command: JobCommand.Start, force: true });
  };

  $: jobDetails = <Partial<Record<JobName, JobDetails>>>{
    [JobName.ThumbnailGeneration]: {
      icon: mdiFileJpgBox,
      title: api.getJobName(JobName.ThumbnailGeneration),
      subtitle: '为每个资源生成大、小和模糊的缩略图，以及每个人的缩略图',
    },
    [JobName.MetadataExtraction]: {
      icon: mdiTable,
      title: api.getJobName(JobName.MetadataExtraction),
      subtitle: '从每个资源中提取元数据信息，例如GPS和分辨率',
    },
    [JobName.Library]: {
      icon: mdiLibraryShelves,
      title: api.getJobName(JobName.Library),
      subtitle: '执行库任务',
      allText: '全部',
      missingText: '刷新',
    },
    [JobName.Sidecar]: {
      title: api.getJobName(JobName.Sidecar),
      icon: mdiFileXmlBox,
      subtitle: '从文件系统中发现或同步Sidecar元数据',
      allText: '同步',
      missingText: '发现',
      disabled: !$featureFlags.sidecar,
    },
    [JobName.SmartSearch]: {
      icon: mdiImageSearch,
      title: api.getJobName(JobName.SmartSearch),
      subtitle: '对资源运行机器学习以支持智能搜索',
      disabled: !$featureFlags.clipEncode,
    },
    [JobName.RecognizeFaces]: {
      icon: mdiFaceRecognition,
      title: api.getJobName(JobName.RecognizeFaces),
      subtitle: '对资源运行机器学习以支持人脸识别',
      handleCommand: handleFaceCommand,
      disabled: !$featureFlags.facialRecognition,
    },
    [JobName.VideoConversion]: {
      icon: mdiVideo,
      title: api.getJobName(JobName.VideoConversion),
      subtitle: '对视频进行转码，以便在各种浏览器和设备上具有更广泛的兼容性',
    },
    [JobName.StorageTemplateMigration]: {
      icon: mdiFolderMove,
      title: api.getJobName(JobName.StorageTemplateMigration),
      allowForceCommand: false,
      component: StorageMigrationDescription,
    },
    [JobName.Migration]: {
      icon: mdiFolderMove,
      title: api.getJobName(JobName.Migration),
      subtitle: '将资源和人脸的缩略图迁移到最新的文件夹结构中',
      allowForceCommand: false,
    },
  };
  $: jobList = Object.entries(jobDetails) as [JobName, JobDetails][];

  async function handleCommand(jobId: JobName, jobCommand: JobCommandDto) {
    const title = jobDetails[jobId]?.title;

    try {
      const { data } = await api.jobApi.sendJobCommand({ id: jobId, jobCommandDto: jobCommand });
      jobs[jobId] = data;

      switch (jobCommand.command) {
        case JobCommand.Empty:
          notificationController.show({
            message: `Cleared jobs for: ${title}`,
            type: NotificationType.Info,
          });
          break;
      }
    } catch (error) {
      handleError(error, `Command '${jobCommand.command}' failed for job: ${title}`);
    }
  }
</script>

{#if faceConfirm}
  <ConfirmDialogue
    prompt="您确定要重新处理所有人脸吗？这将同时清除已命名的人脸信息。"
    on:confirm={onFaceConfirm}
    on:cancel={() => (faceConfirm = false)}
  />
{/if}

<div class="flex flex-col gap-7">
  {#each jobList as [jobName, { title, subtitle, disabled, allText, missingText, allowForceCommand, icon, component, handleCommand: handleCommandOverride }]}
    {@const { jobCounts, queueStatus } = jobs[jobName]}
    <JobTile
      {icon}
      {title}
      {disabled}
      {subtitle}
      allText={allText || '全部'}
      missingText={missingText || '剩余'}
      {allowForceCommand}
      {jobCounts}
      {queueStatus}
      on:command={({ detail }) => (handleCommandOverride || handleCommand)(jobName, detail)}
    >
      {#if component}
        <svelte:component this={component} slot="description" />
      {/if}
    </JobTile>
  {/each}
</div>

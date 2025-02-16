<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../elements/buttons/button.svelte';
  import { LibraryType, type LibraryResponseDto } from '@api';
  import { handleError } from '../../utils/handle-error';
  import { onMount } from 'svelte';
  import Icon from '$lib/components/elements/icon.svelte';
  import LibraryExclusionPatternForm from './library-exclusion-pattern-form.svelte';
  import { mdiPencilOutline } from '@mdi/js';

  export let library: Partial<LibraryResponseDto>;

  let addExclusionPattern = false;
  let editExclusionPattern: number | null = null;

  let exclusionPatternToAdd: string;
  let editedExclusionPattern: string;

  let exclusionPatterns: string[] = [];

  onMount(() => {
    if (library.exclusionPatterns) {
      exclusionPatterns = library.exclusionPatterns;
    } else {
      library.exclusionPatterns = [];
    }
  });

  const dispatch = createEventDispatcher<{
    cancel: void;
    submit: { library: Partial<LibraryResponseDto>; type: LibraryType };
  }>();
  const handleCancel = () => {
    dispatch('cancel');
  };

  const handleSubmit = () => {
    dispatch('submit', { library, type: LibraryType.External });
  };

  const handleAddExclusionPattern = async () => {
    if (!addExclusionPattern) {
      return;
    }

    if (!library.exclusionPatterns) {
      library.exclusionPatterns = [];
    }

    try {
      library.exclusionPatterns.push(exclusionPatternToAdd);
      exclusionPatternToAdd = '';

      exclusionPatterns = library.exclusionPatterns;
      addExclusionPattern = false;
    } catch (error) {
      handleError(error, '无法添加排除模式');
    }
  };

  const handleEditExclusionPattern = async () => {
    if (editExclusionPattern === null) {
      return;
    }

    if (!library.exclusionPatterns) {
      library.exclusionPatterns = [];
    }

    try {
      library.exclusionPatterns[editExclusionPattern] = editedExclusionPattern;
      exclusionPatterns = library.exclusionPatterns;
    } catch (error) {
      handleError(error, '无法编辑排除模式');
    } finally {
      editExclusionPattern = null;
    }
  };

  const handleDeleteExclusionPattern = async () => {
    if (editExclusionPattern === null) {
      return;
    }

    try {
      if (!library.exclusionPatterns) {
        library.exclusionPatterns = [];
      }

      const pathToDelete = library.exclusionPatterns[editExclusionPattern];
      library.exclusionPatterns = library.exclusionPatterns.filter((path) => path != pathToDelete);
      exclusionPatterns = library.exclusionPatterns;
    } catch (error) {
      handleError(error, '无法删除排除模式');
    } finally {
      editExclusionPattern = null;
    }
  };
</script>

{#if addExclusionPattern}
  <LibraryExclusionPatternForm
    submitText="添加"
    bind:exclusionPattern={exclusionPatternToAdd}
    on:submit={handleAddExclusionPattern}
    on:cancel={() => {
      addExclusionPattern = false;
    }}
  />
{/if}

{#if editExclusionPattern != null}
  <LibraryExclusionPatternForm
    submitText="保存"
    canDelete={true}
    bind:exclusionPattern={editedExclusionPattern}
    on:submit={handleEditExclusionPattern}
    on:delete={handleDeleteExclusionPattern}
    on:cancel={() => {
      editExclusionPattern = null;
    }}
  />
{/if}

<form on:submit|preventDefault={() => handleSubmit()} autocomplete="off" class="m-4 flex flex-col gap-4">
  <table class="w-full text-left">
    <tbody class="block w-full overflow-y-auto rounded-md border dark:border-immich-dark-gray">
      {#each exclusionPatterns as exclusionPattern, listIndex}
        <tr
          class={`flex h-[80px] w-full place-items-center text-center dark:text-immich-dark-fg ${
            listIndex % 2 == 0
              ? 'bg-immich-gray dark:bg-immich-dark-gray/75'
              : 'bg-immich-bg dark:bg-immich-dark-gray/50'
          }`}
        >
          <td class="w-3/4 text-ellipsis px-4 text-sm">{exclusionPattern}</td>
          <td class="w-1/4 text-ellipsis px-4 text-sm">
            <button
              type="button"
              on:click={() => {
                editExclusionPattern = listIndex;
                editedExclusionPattern = exclusionPattern;
              }}
              class="rounded-full bg-immich-primary p-3 text-gray-100 transition-all duration-150 hover:bg-immich-primary/75 dark:bg-immich-dark-primary dark:text-gray-700"
            >
              <Icon path={mdiPencilOutline} size="16" />
            </button>
          </td>
        </tr>
      {/each}
      <tr
        class={`flex h-[80px] w-full place-items-center text-center dark:text-immich-dark-fg ${
          exclusionPatterns.length % 2 == 0
            ? 'bg-immich-gray dark:bg-immich-dark-gray/75'
            : 'bg-immich-bg dark:bg-immich-dark-gray/50'
        }`}
      >
        <td class="w-3/4 text-ellipsis px-4 text-sm">
          {#if exclusionPatterns.length === 0}
            尚未添加模式
          {/if}
        </td>
        <td class="w-1/4 text-ellipsis px-4 text-sm"
          ><Button
            size="sm"
            on:click={() => {
              addExclusionPattern = true;
            }}>添加排除模式</Button
          ></td
        ></tr
      >
    </tbody>
  </table>

  <div class="flex w-full justify-end gap-4">
    <Button size="sm" color="gray" on:click={() => handleCancel()}>取消</Button>
    <Button size="sm" type="submit">保存</Button>
  </div>
</form>
